use std::net::{IpAddr, SocketAddr};
use std::sync::Arc;
use axum::extract::{ConnectInfo, State, WebSocketUpgrade};
use axum::extract::ws::{Message, WebSocket};
use axum::response::IntoResponse;
use futures_util::{SinkExt, StreamExt};
use log::info;
use tauri::Emitter;
use tokio::sync::Mutex;
use crate::state::{AppState, MobileClient, MobileEvent, ServerEvent};

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, state, addr.ip()))
}

async fn handle_socket(
    socket: WebSocket,
    state: AppState,
    addr: IpAddr,
) {
    info!("Got new websocket connection: {:?}", addr); // TODO: save IPs

    let (tx, mut rx) = socket.split();

    let tx = Arc::new(Mutex::new(tx));
    let journal = state.journal.lock().await;
    let msg = ServerEvent::AllJournalEntries { entries: journal.entries() };
    if let Ok(payload) = serde_json::to_string(&msg) {
        let tx = tx.clone();
        let mut chan = tx.lock().await;
        let _ = chan.send(Message::Text(axum::extract::ws::Utf8Bytes::from(payload))).await;
    }

    let mut sub = state.server_tx.subscribe();
    let tx_clone = Arc::clone(&tx);
    tokio::spawn(async move {
        while let Ok(evt) = sub.recv().await {
            let txt = match serde_json::to_string(&evt) {
                Ok(s) => s,
                Err(_) => continue, // skip bad serialization
            };
            let mut locked = tx_clone.lock().await;
            if locked.send(Message::Text(axum::extract::ws::Utf8Bytes::from(txt))).await.is_err() {
                // Client disconnected
                break;
            }
        }
    });

    while let Some(Ok(msg)) = rx.next().await {
        if let Message::Text(txt) = msg {
            if let Ok(evt) = serde_json::from_str::<MobileEvent>(&txt) {
                match evt {
                    MobileEvent::ViewportReport { width, height } => {
                        info!("Got viewportReport from {:?}", addr);
                        let mut clients = state.mobile_clients.lock().await;
                        clients.push(MobileClient { ip_addr: addr, viewport_width: width, viewport_height: height });
                        let _ = state.app_handle.emit("clients-updated-event", clients.clone());
                    },
                    _ => {
                        let _ = state.mobile_tx.send(evt).await;
                    }
                }
            }
        }
    }

    info!("WebSocket client disconnected: {:?}", addr);

    {
        let mut clients = state.mobile_clients.lock().await;
        *clients = clients.clone().into_iter().filter(|c| c.ip_addr != addr).collect();
        let _ = state.app_handle.emit("clients-updated-event", clients.clone());
    }
}
