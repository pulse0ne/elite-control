mod state;
mod ws;
mod mobile_assets;
mod vjoystick;

use std::sync::Arc;
use font_kit::source::SystemSource;
use tokio::net::TcpListener;
use local_ip_address::local_ip;
use tokio::sync::Mutex;
use crate::state::{AppState, MobileEvent, ServerEvent};
use crate::vjoystick::vjoy_worker;

#[tauri::command]
async fn get_mobile_client_server_address() -> String {
    local_ip().unwrap().to_string()
}

#[tauri::command]
async fn list_system_fonts() -> Vec<String> {
    let source = SystemSource::new();
    source.all_families().unwrap()
}

pub async fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_mobile_client_server_address, list_system_fonts])
        .setup(move |app| {
            let (mobile_tx, mobile_rx) = tokio::sync::mpsc::channel::<MobileEvent>(32);
            let (server_tx, _) = tokio::sync::broadcast::channel::<ServerEvent>(32);

            let app_handle = app.handle();

            let state = AppState {
                mobile_tx,
                server_tx: server_tx.clone(),
                app_handle: app_handle.clone(),
                client_count: Arc::new(Mutex::new(0))
            };

            tokio::spawn(vjoy_worker(mobile_rx, server_tx.clone()));

            tokio::spawn(async move {
                let app = axum::Router::new()
                    .route("/ws", axum::routing::get(ws::ws_handler))
                    .fallback(axum::routing::get(mobile_assets::static_handler))
                    .with_state(state);

                println!("Serving mobile client on http://0.0.0.0:8787/");
                let listener = TcpListener::bind("0.0.0.0:8787").await.unwrap();
                axum::serve(listener, app).await.unwrap();
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
