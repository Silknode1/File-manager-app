pub mod commands;
pub mod grouper;
pub mod scanner;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::start_scan,
            commands::cancel_scan,
            commands::get_scan_progress,
            commands::get_scan_results,
            commands::delete_files,
            commands::move_to_trash,
            commands::get_file_preview,
            commands::get_system_info,
            commands::get_directory_tree,
            commands::reveal_in_finder,
            commands::get_file_metadata,
        ])
        .run(tauri::generate_context!())
        .expect("error while running FileCraft");
}
