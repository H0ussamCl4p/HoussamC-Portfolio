//! HTTP Response helpers for Vercel serverless functions

use serde::Serialize;
use vercel_runtime::{Body, Error, Response, StatusCode};

pub type ApiResponse = Result<Response<Body>, Error>;

/// Create a JSON success response
pub fn json_response<T: Serialize>(data: &T) -> ApiResponse {
    let json = serde_json::to_string(data)?;

    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .header("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
        .header("Access-Control-Allow-Origin", "*")
        .body(Body::Text(json))?)
}

/// Create a JSON error response
pub fn error_response(status: StatusCode, message: &str) -> ApiResponse {
    let json = serde_json::json!({ "error": message });

    Ok(Response::builder()
        .status(status)
        .header("Content-Type", "application/json")
        .header("Access-Control-Allow-Origin", "*")
        .body(Body::Text(json.to_string()))?)
}

/// Create a 400 Bad Request response
pub fn bad_request(message: &str) -> ApiResponse {
    error_response(StatusCode::BAD_REQUEST, message)
}

/// Create a 500 Internal Server Error response
pub fn internal_error(message: &str) -> ApiResponse {
    error_response(StatusCode::INTERNAL_SERVER_ERROR, message)
}

/// Create a 404 Not Found response
pub fn not_found(message: &str) -> ApiResponse {
    error_response(StatusCode::NOT_FOUND, message)
}
