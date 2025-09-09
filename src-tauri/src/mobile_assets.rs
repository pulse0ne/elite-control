use axum::extract::State;
use axum::http::{HeaderValue, Response, StatusCode};
use axum::response::IntoResponse;
use include_dir::{include_dir, Dir};
use crate::state::AppState;

static MOBILE_ASSETS: Dir = include_dir!("$CARGO_MANIFEST_DIR/../mobile-client/dist");

pub async fn static_handler(
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