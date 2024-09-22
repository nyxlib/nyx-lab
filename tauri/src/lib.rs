/*--------------------------------------------------------------------------------------------------------------------*/

use mime;

use mime_guess;

use tauri::{http, Manager};

use std::{fs, io, env, path};

use tauri_plugin_http::reqwest;

/*--------------------------------------------------------------------------------------------------------------------*/

async fn _download_file(uri_without_query: &str, file_path: &path::PathBuf) -> Result<(), io::Error>
{
    /*----------------------------------------------------------------------------------------------------------------*/
    /* CREATE DIRECTORY                                                                                               */
    /*----------------------------------------------------------------------------------------------------------------*/

    if let Some(parent_dir) = file_path.parent()
    {
        fs::create_dir_all(parent_dir)?;
    }

    /*----------------------------------------------------------------------------------------------------------------*/
    /* DOWNLOAD FILE                                                                                                  */
    /*----------------------------------------------------------------------------------------------------------------*/

    let url = uri_without_query.replace("addon://", "https://addons.nyxlib.org/repo/").trim().to_string();

    /*----------------------------------------------------------------------------------------------------------------*/

    let response = reqwest::Client::new()
        .get(&url)
        .send()
        .await
        .map_err(|e| io::Error::new(io::ErrorKind::Other, format!("HTTP request error: {}", e)))?
        .error_for_status()
        .map_err(|e| io::Error::new(io::ErrorKind::Other, format!("HTTP error: {}", e)))?
    ;

    /*----------------------------------------------------------------------------------------------------------------*/

    let content = response.bytes()
        .await
        .map_err(|e| io::Error::new(io::ErrorKind::Other, format!("Error reading data: {}", e)))?;

    /*----------------------------------------------------------------------------------------------------------------*/

    fs::write(file_path, &content)?;

    /*----------------------------------------------------------------------------------------------------------------*/

    Ok(())
}

/*--------------------------------------------------------------------------------------------------------------------*/

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run()
{
    /*----------------------------------------------------------------------------------------------------------------*/

    tauri::Builder::default()

        /*------------------------------------------------------------------------------------------------------------*/

        .setup(|app| {

            let addons_dir = app.path()
                .app_config_dir()
                .map(|dir| dir.join("addons"))
                .expect("Error determining the addon directory")
            ;

            fs::create_dir_all(&addons_dir).expect("Error creating the addons directory");

            Ok(())
        })

        /*------------------------------------------------------------------------------------------------------------*/
        /* ADDON PROTOCOL                                                                                             */
        /*------------------------------------------------------------------------------------------------------------*/

        .register_uri_scheme_protocol("addon", move |app, req| {

            tauri::async_runtime::block_on(async move {

                /*----------------------------------------------------------------------------------------------------*/
                /* EXTRACT FILE PATH FROM URL                                                                         */
                /*----------------------------------------------------------------------------------------------------*/

                let uri = req.uri().to_string();

                let uri_without_query = uri.split('?').next().unwrap_or(&uri);

                let file_path = app.path().app_config_dir().unwrap().join("addons").join(uri_without_query.replace("addon://", "").trim());

                /*----------------------------------------------------------------------------------------------------*/
                /* DOWNLOAD FILE IF NEEDED                                                                            */
                /*----------------------------------------------------------------------------------------------------*/

                if !file_path.exists()
                {
                    if let Err(e) = _download_file(&uri_without_query, &file_path).await
                    {
                        return http::Response::builder()
                            .status(http::StatusCode::INTERNAL_SERVER_ERROR)
                            .header(http::header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                            .header(http::header::CONTENT_TYPE, mime::TEXT_PLAIN.essence_str())
                            .body(e.to_string().into_bytes())
                            .unwrap()
                        ;
                    }
                }

                /*----------------------------------------------------------------------------------------------------*/
                /* GET FILE MIME                                                                                      */
                /*----------------------------------------------------------------------------------------------------*/

                let file_mime = mime_guess::from_path(&file_path).first_or_octet_stream();

                /*----------------------------------------------------------------------------------------------------*/
                /* SERVE FILE                                                                                         */
                /*----------------------------------------------------------------------------------------------------*/

                return match fs::read(file_path) {
                    /*------------------------------------------------------------------------------------------------*/

                    Ok(content) => http::Response::builder()
                        .status(http::StatusCode::/*-*/OK/*-*/)
                        .header(http::header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                        .header(http::header::CONTENT_TYPE, file_mime.essence_str())
                        .body(content)
                        .unwrap(),

                    /*------------------------------------------------------------------------------------------------*/

                    Err(e) => http::Response::builder()
                        .status(http::StatusCode::NOT_FOUND)
                        .header(http::header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                        .header(http::header::CONTENT_TYPE, mime::TEXT_PLAIN.essence_str())
                        .body(e.to_string().into_bytes())
                        .unwrap(),

                    /*------------------------------------------------------------------------------------------------*/
                };

                /*----------------------------------------------------------------------------------------------------*/
            })
        })

        /*------------------------------------------------------------------------------------------------------------*/
        /* PLUGINS                                                                                                    */
        /*------------------------------------------------------------------------------------------------------------*/

        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())

        /*------------------------------------------------------------------------------------------------------------*/
        /* APP                                                                                                        */
        /*------------------------------------------------------------------------------------------------------------*/

        .run(tauri::generate_context!()).expect("Error while running tauri application")

        /*------------------------------------------------------------------------------------------------------------*/
    ;

    /*----------------------------------------------------------------------------------------------------------------*/
}

/*--------------------------------------------------------------------------------------------------------------------*/
