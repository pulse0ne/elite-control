use std::sync::Arc;
use axum::extract::{State, WebSocketUpgrade};
use axum::extract::ws::{Message, WebSocket};
use axum::response::IntoResponse;
use futures_util::{SinkExt, StreamExt};
use serde::Serialize;
use tauri::Emitter;
use tokio::sync::Mutex;
use crate::state::{AppState, MobileEvent, ServerEvent};

#[derive(Serialize, Clone)]
struct ClientCountEvent {
    count: usize,
}

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

async fn handle_socket(
    socket: WebSocket,
    state: AppState,
) {
    println!("Got new websocket connection");
    {
        let mut count = state.client_count.lock().await;
        *count += 1;
        let _ = state.app_handle.emit("client-count", ClientCountEvent { count: *count });
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

    // --- Task: Receive events from client ---
    while let Some(Ok(msg)) = rx.next().await {
        if let Message::Text(txt) = msg {
            if let Ok(evt) = serde_json::from_str::<MobileEvent>(&txt) {
                let _ = state.mobile_tx.send(evt).await; // ignore if receiver dropped
            }
        }
    }

    println!("WebSocket client disconnected");

    {
        let mut count = state.client_count.lock().await;
        *count -= 1;
        let _ = state.app_handle.emit("client-count", ClientCountEvent { count: *count });
    }
}
