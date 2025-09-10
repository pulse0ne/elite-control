use std::sync::Arc;
use serde::{Deserialize, Serialize};
use tokio::sync::{broadcast, mpsc, Mutex};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub enum ServerEvent {
    LayoutPushed { id: String },
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub enum MobileEvent {
    Press { button: u8, duration: u64 },
}

#[derive(Clone)]
pub struct AppState {
    pub mobile_tx: mpsc::Sender<MobileEvent>,
    pub server_tx: broadcast::Sender<ServerEvent>,
    pub app_handle: tauri::AppHandle,
    pub client_count: Arc<Mutex<usize>>,
}
