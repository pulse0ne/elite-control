use axum::{
    extract::{ws::{WebSocketUpgrade, WebSocket}, State},
    response::IntoResponse,
};
use tokio::sync::{broadcast, mpsc, Mutex};
use futures_util::{StreamExt, SinkExt};
use serde::{Serialize, Deserialize};
use std::sync::Arc;
use axum::extract::ws::Message;
use axum::http::{HeaderValue, Response, StatusCode};
use include_dir::{include_dir, Dir};
use tokio::net::TcpListener;

static MOBILE_ASSETS: Dir = include_dir!("$CARGO_MANIFEST_DIR/../mobile-client/dist");

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ServerEvent {
    LayoutPushed { id: String },
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum MobileEvent {
    Press { button: u8 },
}

#[derive(Clone)]
struct AppState {
    mobile_tx: mpsc::Sender<MobileEvent>,
    server_tx: broadcast::Sender<ServerEvent>,
}

#[cfg_attr(any(target_os = "windows", target_os = "macos"), async_trait::async_trait)]
pub trait InputDevice: Send + Sync {
    async fn press_button(&self, button: u8);
    async fn release_button(&self, button: u8);
}

#[cfg(target_os = "windows")]
pub struct VJoyDevice {
    // TODO: actual vJoy device handle
}

#[cfg(target_os = "windows")]
#[async_trait::async_trait]
impl InputDevice for VJoyDevice {
    async fn press_button(&self, button: u8) {
        // TODO: call vJoy API here
    }

    async fn release_button(&self, button: u8) {
        // TODO: call vJoy API here
    }
}

#[cfg(not(target_os = "windows"))]
pub struct MockDevice;

#[cfg(not(target_os = "windows"))]
#[async_trait::async_trait]
impl InputDevice for MockDevice {
    async fn press_button(&self, button: u8) {
        println!("[MOCK] press_button({})", button);
    }

    async fn release_button(&self, button: u8) {
        println!("[MOCK] release_button({})", button);
    }
}

pub async fn run() {
    // Channels
    let (mobile_tx, mobile_rx) = mpsc::channel::<MobileEvent>(32);
    let (server_tx, _) = broadcast::channel::<ServerEvent>(32);

    let state = AppState {
        mobile_tx,
        server_tx: server_tx.clone(),
    };

    let device: Arc<Mutex<dyn InputDevice>> = {
        #[cfg(target_os = "windows")]
        {
            Arc::new(Mutex::new(VJoyDevice { /* TODO: init */ }))
        }
        #[cfg(not(target_os = "windows"))]
        {
            Arc::new(Mutex::new(MockDevice))
        }
    };

    // Spawn vJoy worker
    tokio::spawn(vjoy_worker(device, mobile_rx, server_tx.clone()));

    // Spawn Axum server for mobile clients
    tokio::spawn(async move {
        let app = axum::Router::new()
            .route("/ws", axum::routing::get(ws_handler))
            .fallback(axum::routing::get(static_handler))
            .with_state(state);

        println!("Serving mobile client on http://0.0.0.0:8787/");
        let listener = TcpListener::bind("0.0.0.0:8787").await.unwrap();
        axum::serve(listener, app).await.unwrap();
    });

    // Run Tauri main loop (desktop UI)
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn static_handler(
    State(_state): State<AppState>, // we keep the same state type for sharing channels if needed
    req: axum::http::Request<axum::body::Body>,
) -> impl IntoResponse {
    let path = req.uri().path().trim_start_matches('/'); // remove leading slash

    // fallback to index.html if file is missing
    let file = MOBILE_ASSETS.get_file(path).or_else(|| MOBILE_ASSETS.get_file("index.html"));

    if let Some(file) = file {
        let mime = mime_guess::from_path(file.path()).first_or_octet_stream();
        let mut res = Response::new(file.contents().into());
        res.headers_mut().insert(
            "content-type",
            HeaderValue::from_str(mime.as_ref()).unwrap(),
        );
        res
    } else {
        (StatusCode::NOT_FOUND, "Not Found").into_response()
    }
}

async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

async fn handle_socket(
    socket: WebSocket,
    state: AppState,
) {
    // Split socket into sink (tx) and stream (rx)
    let (tx, mut rx) = socket.split();

    // Wrap tx in Arc<Mutex<>> so it can be shared with tasks
    let tx = Arc::new(Mutex::new(tx));

    // --- Task: Send server events to this client ---
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
}


async fn vjoy_worker(device: Arc<Mutex<dyn InputDevice>>, mut mobile_rx: mpsc::Receiver<MobileEvent>, server_tx: broadcast::Sender<ServerEvent>) {
    println!("vJoy worker running...");
    while let Some(evt) = mobile_rx.recv().await {
        println!("Received mobile event: {:?}", evt);
        match evt {
            MobileEvent::Press { button } => {
                device.lock().await.press_button(button).await;
            }
        }
    }

    let _ = server_tx.send(ServerEvent::LayoutPushed { id: "example".into() });
}
