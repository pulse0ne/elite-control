mod logging;
mod state;
mod ws;
mod mobile_assets;
mod fonts;
mod vjoystick;
mod journal;
mod widget;

use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::TcpListener;
use local_ip_address::local_ip;
use log::{error, info};
use tokio::sync::Mutex;
use crate::journal::Journal;
use crate::state::{AppState, MobileEvent, ServerEvent};
use crate::vjoystick::vjoy_worker;

#[tauri::command]
async fn get_mobile_client_server_address() -> String {
    local_ip().unwrap().to_string()
}

#[tauri::command]
async fn list_system_fonts() -> Vec<fonts::FontSpec> {
    fonts::list_fonts()
}

pub async fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_mobile_client_server_address, list_system_fonts])
        .setup(move |app| {
            let (mobile_tx, mobile_rx) = tokio::sync::mpsc::channel::<MobileEvent>(32);
            let (server_tx, _) = tokio::sync::broadcast::channel::<ServerEvent>(32);

            let app_handle = app.handle();

            logging::setup_logging(app_handle.clone());

            // TODO: find a good way of getting this from config or UI
            let journal = Arc::new(Mutex::new(Journal::new("../../")));

            let state = AppState {
                mobile_tx,
                server_tx: server_tx.clone(),
                app_handle: app_handle.clone(),
                mobile_clients: Arc::new(Mutex::new(vec![])),
                journal: journal.clone(),
            };

            let (tx, mut rx) = tokio::sync::mpsc::channel(100);
            tokio::spawn({
                let journal = journal.clone();
                let server_tx = server_tx.clone();
                async move {
                    if let Err(e) = journal::watch_journal(journal, tx).await {
                        error!("Failed to watch journal: {}", e);
                    };

                    while let Some(entries) = rx.recv().await {
                        info!("Got new entries: {:?}", entries);
                        let _ = server_tx.send(ServerEvent::NewJournalEntries { entries });
                    }
                }
            });

            tokio::spawn(vjoy_worker(mobile_rx, server_tx.clone()));
            
            tokio::spawn(async move {
                let app = axum::Router::new()
                    .route("/ws", axum::routing::get(ws::ws_handler))
                    .route("/fonts/{font}", axum::routing::get(mobile_assets::font_handler))
                    .fallback(axum::routing::get(mobile_assets::static_handler))
                    .with_state(state);

                info!("Serving mobile client on http://0.0.0.0:11011/");
                let listener = TcpListener::bind("0.0.0.0:11011").await.unwrap();
                axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await.unwrap();
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
