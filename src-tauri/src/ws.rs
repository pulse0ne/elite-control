use std::net::{IpAddr, SocketAddr};
use std::sync::Arc;
use axum::extract::{ConnectInfo, State, WebSocketUpgrade};
use axum::extract::ws::{Message, WebSocket};
use axum::response::IntoResponse;
use futures_util::{SinkExt, StreamExt};
use log::{debug, info};
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
    debug!("New connection attempt from {}", addr);

    {
        let mut clients = state.mobile_clients.lock().await;
        clients.push(MobileClient { ip_addr: addr, viewport_width: 0, viewport_height: 0 });
        let _ = state.app_handle.emit("clients-updated-event", clients.clone());
        info!("Accepted new websocket connection: {:?} ({} total connections)", addr, clients.clone().len());
    }

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
    let mut sender = tokio::spawn(async move {
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

    let state_clone = state.clone();
    let mut receiver = tokio::spawn(async move {
        while let Some(Ok(msg)) = rx.next().await {
            if let Message::Text(txt) = msg {
                if let Ok(evt) = serde_json::from_str::<MobileEvent>(&txt) {
                    match evt {
                        MobileEvent::ViewportReport { width, height } => {
                            info!("Got viewportReport from {:?}: {}x{}", addr, width, height);
                            let mut clients = state_clone.mobile_clients.lock().await;
                            *clients = clients.clone()
                                .into_iter()
                                .map(|mut f| {
                                    f.viewport_width = width;
                                    f.viewport_height = height;
                                    f
                                })
                                .collect();
                            let _ = state_clone.app_handle.emit("clients-updated-event", clients.clone());
                        },
                        _ => {
                            let _ = state_clone.mobile_tx.send(evt).await;
                        }
                    }
                }
            }
        }
    });

    tokio::select! {
        _ = &mut sender => receiver.abort(),
        _ = &mut receiver => sender.abort(),
    }

    debug!("WebSocket disconnection: {:?}", addr);

    {
        let mut clients = state.mobile_clients.lock().await;
        *clients = clients.clone().into_iter().filter(|c| c.ip_addr != addr).collect();
        let _ = state.app_handle.emit("clients-updated-event", clients.clone());
        info!("Websocket disconnected from {:?} ({} remaining connections)", addr, clients.clone().len());
    }
}
