#[cfg(target_os = "windows")]
mod windows;
#[cfg(target_os = "windows")]
pub use windows::VJoyDevice;
#[cfg(target_os = "windows")]
use vjoy::VJoy;

#[cfg(not(target_os = "windows"))]
mod mock;
#[cfg(not(target_os = "windows"))]
pub use mock::MockDevice;

use std::sync::Arc;
use tokio::sync::{broadcast, mpsc, Mutex};
use crate::state::{MobileEvent, ServerEvent};

#[cfg_attr(any(target_os = "windows", target_os = "macos"), async_trait::async_trait)]
pub trait InputDevice: Send + Sync {
    async fn press_button(&mut self, button: u8, duration_millis: u64);
}

pub async fn vjoy_worker(
    mut mobile_rx: mpsc::Receiver<MobileEvent>,
    server_tx: broadcast::Sender<ServerEvent>
) {
    let device: Arc<Mutex<dyn InputDevice>> = {
        #[cfg(target_os = "windows")]
        {
            Arc::new(Mutex::new(VJoyDevice { vjoy: VJoy::from_default_dll_location().unwrap(), device_id: 2 }))
        }
        #[cfg(not(target_os = "windows"))]
        {
            Arc::new(Mutex::new(MockDevice))
        }
    };
    println!("vJoy worker running...");
    while let Some(evt) = mobile_rx.recv().await {
        println!("Received mobile event: {:?}", evt);
        match evt {
            MobileEvent::Press { button, duration } => {
                device.lock().await.press_button(button, duration).await;
            },
            _ => {}
        }
    }

    let _ = server_tx.send(ServerEvent::LayoutPushed { id: "example".into() });
}