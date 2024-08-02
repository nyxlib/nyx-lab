/*--------------------------------------------------------------------------------------------------------------------*/

use mime;

use tauri::{http};

use std::{fs, env, path::PathBuf};

/*--------------------------------------------------------------------------------------------------------------------*/

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run()
{
    tauri::Builder::default()

        /*------------------------------------------------------------------------------------------------------------*/
        /* ADDON PROTOCOL                                                                                             */
        /*------------------------------------------------------------------------------------------------------------*/

        .register_uri_scheme_protocol("addon", |_, req| {

            let full_path = match env::var("HOME").map(PathBuf::from) {

                /*----------------------------------------------------------------------------------------------------*/

                Err(_) => return http::Response::builder()
                    .status(http::StatusCode::BAD_REQUEST)
                    .header(http::header::CONTENT_TYPE, mime::TEXT_PLAIN.essence_str())
                    .body("addon dir not found".to_string().into_bytes())
                    .unwrap(),

                /*----------------------------------------------------------------------------------------------------*/

                Ok(home_dir) => home_dir.join(".local/indi-dashboard/addons/").join(req.uri().to_string().trim().replace("addon://localhost/", "")),

                /*----------------------------------------------------------------------------------------------------*/
            };

            match fs::read_to_string(full_path) {

                /*----------------------------------------------------------------------------------------------------*/

                Ok(content) => return http::Response::builder()
                    .status(http::StatusCode::BAD_REQUEST)
                    .header("Content-Type", mime::TEXT_PLAIN.essence_str())
                    .body(content.into_bytes())
                    .unwrap(),

                /*----------------------------------------------------------------------------------------------------*/

                Err(_) => return http::Response::builder()
                    .status(http::StatusCode::BAD_REQUEST)
                    .header(http::header::CONTENT_TYPE, mime::TEXT_PLAIN.essence_str())
                    .body("file not found".to_string().into_bytes())
                    .unwrap(),

                /*----------------------------------------------------------------------------------------------------*/
            };
        })

        /*------------------------------------------------------------------------------------------------------------*/
        /* PLUGINS                                                                                                    */
        /*------------------------------------------------------------------------------------------------------------*/

        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())

        /*------------------------------------------------------------------------------------------------------------*/
        /* APP                                                                                                        */
        /*------------------------------------------------------------------------------------------------------------*/

        .run(tauri::generate_context!()).expect("error while running tauri application")

        /*------------------------------------------------------------------------------------------------------------*/
    ;
}

/*--------------------------------------------------------------------------------------------------------------------*/
