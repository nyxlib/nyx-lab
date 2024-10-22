/*--------------------------------------------------------------------------------------------------------------------*/

use std::collections::HashMap;

use serde::{Serialize, Deserialize};

use warp::{Filter, http::StatusCode};

use base64::{Engine as _, engine::general_purpose::STANDARD};

/*--------------------------------------------------------------------------------------------------------------------*/

use tauri_plugin_http::reqwest;

use tauri_plugin_store::StoreExt;

use tauri::{App, async_runtime::spawn};

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
    let store = app.store("nyx-addons-store.json").expect("Failed to get the store");

    spawn(async move {

        /*------------------------------------------------------------------------------------------------------------*/

        let client = reqwest::Client::new();

        /*------------------------------------------------------------------------------------------------------------*/

        let proxy = warp::path::full().and(warp::method()).and(warp::header::headers_cloned()).and(warp::body::bytes()).and_then(move |path: warp::filters::path::FullPath, method: warp::http::Method, headers: warp::http::HeaderMap, body: warp::hyper::body::Bytes| {

            let client = client.clone();

            let store = store.clone();

            async move {

                /*----------------------------------------------------------------------------------------------------*/

                let reqwest_url = format!("https://addons.nyxlib.org/{}", path.as_str()).replace("//", "/");

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

                        let headers = response.headers().clone();

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

                                    header_map.insert(
                                        key_str.into(),
                                        val_str.into()
                                    );

                                    response_builder = response_builder.header(
                                        key_str,
                                        val_str
                                    );
                                }

                                /*------------------------------------------------------------------------------------*/

                                let payload =  STANDARD.encode(&body_bytes);

                                /*------------------------------------------------------------------------------------*/

                                let cached_response = CachedResponse {
                                    header_map,
                                    payload,
                                };

                                store.set(reqwest_url.clone(), serde_json::to_value(&cached_response).unwrap());

                                /*------------------------------------------------------------------------------------*/

                                Ok::<_, warp::Rejection>(response_builder
                                    .status(StatusCode::from_u16(status.as_u16()).unwrap())
                                    .body(warp::hyper::Body::from(body_bytes.to_vec())
                                ).unwrap())
                            }
                            Err(_) => Ok::<_, warp::Rejection>(warp::http::Response::builder()
                                .status(StatusCode::BAD_GATEWAY)
                                .body(warp::hyper::Body::from(b"BAD_GATEWAY".to_vec())
                            ).unwrap())
                        }
                    }
                    Err(_) => Ok::<_, warp::Rejection>(warp::http::Response::builder()
                        .status(StatusCode::BAD_GATEWAY)
                        .body(warp::hyper::Body::from(b"BAD_GATEWAY".to_vec())
                    ).unwrap())
                }
            }
        });

        /*------------------------------------------------------------------------------------------------------------*/

        warp::serve(proxy).run(([127, 0, 0, 1], 7878)).await;

        /*------------------------------------------------------------------------------------------------------------*/
    });
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
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())

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
