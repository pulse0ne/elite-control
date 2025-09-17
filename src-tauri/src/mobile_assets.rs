use std::fs::File;
use std::io::Read;
use axum::extract::{Path, State};
use axum::http::{HeaderValue, Response, StatusCode};
use axum::response::IntoResponse;
#[cfg(not(debug_assertions))]
use include_dir::{include_dir, Dir};
use crate::fonts::get_font_path;
use crate::state::AppState;

#[cfg(not(debug_assertions))]
static MOBILE_ASSETS: Dir = include_dir!("$CARGO_MANIFEST_DIR/../mobile-client/dist");

#[cfg(not(debug_assertions))]
pub async fn static_handler(
    State(_state): State<AppState>,
    req: axum::http::Request<axum::body::Body>,
) -> impl IntoResponse {
    let path = req.uri().path().trim_start_matches('/');

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

// #[axum::debug_handler]
pub async fn font_handler(Path(font): Path<String>) -> impl IntoResponse {
    let last_period = font.rfind(".").unwrap();
    // println!("{:#?}", font);
    let font_path = match get_font_path(&font[0..last_period]) {
        Ok(path) => path,
        Err(_) => return (StatusCode::NOT_FOUND, "Not found").into_response(),
    };
    let file = File::open(font_path.clone());
    if let Ok(mut file) = file {
        let mim = mime_guess::from_path(font_path).first_or_octet_stream();
        let mut contents: Vec<u8> = Vec::new();
        file.read_to_end(&mut contents).unwrap();
        let mut res = Response::new(contents.into());
        res.headers_mut().insert(
            "content-type",
            HeaderValue::from_str(mim.as_ref()).unwrap(),
        );
        res
    } else {
        (StatusCode::NOT_FOUND, "Not Found").into_response()
    }
}

#[cfg(debug_assertions)]
pub async fn static_handler(
    State(_state): State<AppState>, // we keep the same state type for sharing channels if needed
    req: axum::http::Request<axum::body::Body>,
) -> impl IntoResponse {
    let path = req.uri().path().trim_start_matches('/');
    let disk_path = format!("{}/{}", env!("CARGO_MANIFEST_DIR"), "../mobile-client/dist");
    let candidate = std::path::Path::new(&disk_path).join(path);

    let file_path = if candidate.exists() && candidate.is_file() {
        candidate
    } else {
        std::path::Path::new(&disk_path).join("index.html")
    };

    match tokio::fs::read(&file_path).await {
        Ok(bytes) => {
            let mime = mime_guess::from_path(&file_path).first_or_octet_stream();
            let mut res = Response::new(bytes.into());
            res.headers_mut()
                .insert("content-type", HeaderValue::from_str(mime.as_ref()).unwrap());
            res
        }
        Err(_) => {
            (StatusCode::NOT_FOUND, "Not Found").into_response()
        },
    }
}
