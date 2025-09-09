use serde::{Deserialize, Serialize};
use tokio::sync::{broadcast, mpsc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ServerEvent {
    LayoutPushed { id: String },
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum MobileEvent {
    Press { button: u8, duration: u64 },
}

#[derive(Clone)]
pub struct AppState {
    pub mobile_tx: mpsc::Sender<MobileEvent>,
    pub server_tx: broadcast::Sender<ServerEvent>,
}

impl AppState {
    pub fn new() -> (Self, mpsc::Receiver<MobileEvent>) {
        let (mobile_tx, mobile_rx) = mpsc::channel(32);
        let (server_tx, _) = broadcast::channel(32);
        (
            Self { mobile_tx, server_tx },
            mobile_rx,
        )
    }
}