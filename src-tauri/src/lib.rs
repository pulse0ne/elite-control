mod state;
mod ws;
mod mobile_assets;
mod vjoystick;

use tokio::net::TcpListener;
use local_ip_address::local_ip;
use crate::state::AppState;
use crate::vjoystick::vjoy_worker;

#[tauri::command]
async fn get_mobile_client_server_address() -> String {
    local_ip().unwrap().to_string()
}

pub async fn run() {

    let (state, mobile_rx) = AppState::new();

    tokio::spawn(vjoy_worker(mobile_rx, state.server_tx.clone()));

    // Spawn Axum server for mobile clients
    tokio::spawn(async move {
        let app = axum::Router::new()
            .route("/ws", axum::routing::get(ws::ws_handler))
            .fallback(axum::routing::get(mobile_assets::static_handler))
            .with_state(state);

        println!("Serving mobile client on http://0.0.0.0:8787/");
        let listener = TcpListener::bind("0.0.0.0:8787").await.unwrap();
        axum::serve(listener, app).await.unwrap();
    });

    // Run Tauri main loop (desktop UI)
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_mobile_client_server_address])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
