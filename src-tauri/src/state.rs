use std::net::IpAddr;
use std::sync::Arc;
use serde::{Deserialize, Serialize};
use tokio::sync::{broadcast, mpsc, Mutex};
use crate::journal::Journal;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub enum ServerEvent {
    LayoutPushed { id: String },
    AllJournalEntries { entries: Vec<String> },
    NewJournalEntries { entries: Vec<String> },
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub enum MobileEvent {
    Press { button: u8, duration: u64 },
    ViewportReport { width: u64, height: u64 },
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MobileClient {
    pub ip_addr: IpAddr,
    pub viewport_width: u64,
    pub viewport_height: u64,
}

#[derive(Clone)]
pub struct AppState {
    pub mobile_tx: mpsc::Sender<MobileEvent>,
    pub server_tx: broadcast::Sender<ServerEvent>,
    pub app_handle: tauri::AppHandle,
    pub mobile_clients: Arc<Mutex<Vec<MobileClient>>>,
    pub journal: Arc<Mutex<Journal>>,
}
