/*--------------------------------------------------------------------------------------------------------------------*/

use std::net::TcpListener;

use std::collections::HashMap;

use serde::{Serialize, Deserialize};

use warp::{Filter, http::StatusCode};

use base64::{Engine as _, engine::general_purpose::STANDARD};

/*--------------------------------------------------------------------------------------------------------------------*/

use tauri_plugin_http::reqwest;

use tauri_plugin_store::StoreExt;

use tauri::{App, async_runtime::spawn};

/*--------------------------------------------------------------------------------------------------------------------*/

const NYX_INDEX_HOST: &str = "addons.nyxlib.org";

const NYX_ADDON_STORE_FILENAME: &str = "nyx-addons-store.json";

/*--------------------------------------------------------------------------------------------------------------------*/

#[derive(Serialize, Deserialize)]
struct CachedResponse
{
    header_map: HashMap<String, String>,

    payload: String,
}

/*--------------------------------------------------------------------------------------------------------------------*/

fn start_addon_proxy(app: &mut App)
{
    /*----------------------------------------------------------------------------------------------------------------*/

    if TcpListener::bind("127.0.0.1:7878").is_err()
    {
        print!("Port 7878 is already in use, skipping the addon proxy.");

        return;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    let store = app.store(NYX_ADDON_STORE_FILENAME).expect("Failed to initialize the store, skipping the addon proxy.");

    /*----------------------------------------------------------------------------------------------------------------*/

    spawn(async move {

        /*------------------------------------------------------------------------------------------------------------*/

        let client = reqwest::Client::new();

        /*------------------------------------------------------------------------------------------------------------*/

        let proxy = warp::path::full().and(warp::method()).and(warp::header::headers_cloned()).and(warp::body::bytes()).and_then(move |path: warp::filters::path::FullPath, method: warp::http::Method, headers: warp::http::HeaderMap, body: warp::hyper::body::Bytes| {

            let client = client.clone();

            let store = store.clone();

            async move {

                /*----------------------------------------------------------------------------------------------------*/
                /*                                                                                                    */
                /*----------------------------------------------------------------------------------------------------*/

                let reqwest_url = format!("https://{}", format!("{}/{}", NYX_INDEX_HOST, path.as_str()).replace("//", "/"));

                /*----------------------------------------------------------------------------------------------------*/
                /*                                                                                                    */
                /*----------------------------------------------------------------------------------------------------*/

                if store.has(&reqwest_url)
                {
                    let cached_response: Result<CachedResponse, _> = serde_json::from_value(store.get(&reqwest_url).unwrap());

                    match cached_response
                    {
                        Ok(cached_response) => {

                            /*----------------------------------------------------------------------------------------*/

                            let mut response_builder = warp::http::Response::builder();

                            for (key, val) in cached_response.header_map.iter()
                            {
                                response_builder = response_builder.header(key, val);
                            }

                            /*----------------------------------------------------------------------------------------*/

                            let payload = STANDARD.decode(&cached_response.payload).unwrap();

                            /*----------------------------------------------------------------------------------------*/

                            return Ok::<_, warp::Rejection>(response_builder.status(StatusCode::OK).body(warp::hyper::Body::from(payload)).unwrap());

                            /*----------------------------------------------------------------------------------------*/
                        }
                        Err(_) => {

                            store.delete(&reqwest_url);
                        }
                    }
                }

                /*----------------------------------------------------------------------------------------------------*/
                /*                                                                                                    */
                /*----------------------------------------------------------------------------------------------------*/

                let reqwest_method = reqwest::Method::from_bytes(method.as_str().as_bytes()).unwrap();

                /*----------------------------------------------------------------------------------------------------*/

                let mut reqwest_headers = reqwest::header::HeaderMap::new();

                for (key, val) in headers.iter()
                {
                    if key.as_str() != "host"
                    {
                        reqwest_headers.insert(
                            reqwest::header::HeaderName::from_bytes(key.as_str().as_bytes()).unwrap(),
                            reqwest::header::HeaderValue::from_bytes(val/*-----*/.as_bytes()).unwrap()
                        );
                    }
                }

                /*----------------------------------------------------------------------------------------------------*/

                let response_result = client.request(reqwest_method, &reqwest_url)
                    .headers(reqwest_headers)
                    .body(body)
                    .send()
                    .await
                ;

                /*----------------------------------------------------------------------------------------------------*/

                match response_result
                {
                    Ok(response) => {

                        let status = response.status().clone();

                        let mut headers = response.headers().clone();

                        headers.insert(reqwest::header::EXPIRES, reqwest::header::HeaderValue::from_static("0"));

                        headers.insert(reqwest::header::CACHE_CONTROL, reqwest::header::HeaderValue::from_static("no-store, no-cache, must-revalidate, max-age=0"));

                        match response.bytes().await
                        {
                            Ok(body_bytes) => {

                                /*------------------------------------------------------------------------------------*/

                                let mut header_map = HashMap::new();
                                let mut response_builder = warp::http::Response::builder();

                                for (key, val) in headers.iter()
                                {
                                    let key_str = key.as_str()/*-----*/;
                                    let val_str = val.to_str().unwrap();

                                    if ["access-control-allow-headers", "access-control-allow-methods", "access-control-allow-origin", "cache-control", "content-encoding", "content-type", "expires", "transfer-encoding"].contains(&key.as_str().to_lowercase().as_str())
                                    {
                                        header_map.insert(
                                            key_str.into(),
                                            val_str.into()
                                        );

                                        response_builder = response_builder.header(
                                            key_str,
                                            val_str
                                        );
                                    }
                                }

                                /*------------------------------------------------------------------------------------*/

                                if status.is_success()
                                {
                                    /*--------------------------------------------------------------------------------*/

                                    let payload =  STANDARD.encode(&body_bytes);

                                    /*--------------------------------------------------------------------------------*/

                                    let cached_response = CachedResponse {
                                        header_map,
                                        payload,
                                    };

                                    /*--------------------------------------------------------------------------------*/

                                    store.set(reqwest_url.clone(), serde_json::to_value(&cached_response).unwrap());

                                    /*--------------------------------------------------------------------------------*/
                                }

                                /*------------------------------------------------------------------------------------*/

                                Ok::<_, warp::Rejection>(response_builder
                                    .status(StatusCode::from_u16(status.as_u16()).unwrap())
                                    .body(warp::hyper::Body::from(body_bytes.to_vec())).unwrap())
                            }
                            Err(e) => Ok::<_, warp::Rejection>(warp::http::Response::builder()
                                .status(StatusCode::BAD_GATEWAY)
                                .body(warp::hyper::Body::from(format!("Failed to retrieve response body: {}", e))).unwrap())
                        }
                    }
                    Err(e) => Ok::<_, warp::Rejection>(warp::http::Response::builder()
                        .status(StatusCode::BAD_GATEWAY)
                        .body(warp::hyper::Body::from(format!("Failed to execute proxy request: {}", e))).unwrap())
                }
            }
        });

        /*------------------------------------------------------------------------------------------------------------*/

        warp::serve(proxy).run(([0, 0, 0, 0], 7878)).await;

        /*------------------------------------------------------------------------------------------------------------*/
    });

    /*----------------------------------------------------------------------------------------------------------------*/
}


/*--------------------------------------------------------------------------------------------------------------------*/

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run()
{
    /*----------------------------------------------------------------------------------------------------------------*/

    tauri::Builder::default()

        /*------------------------------------------------------------------------------------------------------------*/

        .setup(|app| {

            start_addon_proxy(app);

            Ok(())
        })

        /*------------------------------------------------------------------------------------------------------------*/
        /* PLUGINS                                                                                                    */
        /*------------------------------------------------------------------------------------------------------------*/

        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_geolocation::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())

        /*------------------------------------------------------------------------------------------------------------*/
        /* APPLICATION                                                                                                */
        /*------------------------------------------------------------------------------------------------------------*/

        .run(tauri::generate_context!())

        /*------------------------------------------------------------------------------------------------------------*/

        .expect("Error while running Nyx-Dashboard")

        /*------------------------------------------------------------------------------------------------------------*/
    ;

    /*----------------------------------------------------------------------------------------------------------------*/
}

/*--------------------------------------------------------------------------------------------------------------------*/
