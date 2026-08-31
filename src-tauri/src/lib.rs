mod capture_protection;

use tauri::{Manager, WebviewWindow};

// Command to apply capture protection from the frontend
#[tauri::command]
fn enable_anti_capture(window: WebviewWindow) -> Result<(), String> {
    capture_protection::set_anti_capture(&window)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![enable_anti_capture])
        .setup(|app| {
            // Ensure window initializes on top and without decorations
            if let Some(window) = app.get_webview_window("main") {
                let _ = capture_protection::set_anti_capture(&window);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}