use tauri::WebviewWindow;

// Apply OS-level flags to hide window from screen shares and recorders
pub fn set_anti_capture(window: &WebviewWindow) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use windows_sys::Win32::UI::WindowsAndMessaging::{SetWindowDisplayAffinity, WDA_EXCLUDEFROMCAPTURE};
        use windows_sys::Win32::Foundation::HWND;

        // Extract raw HWND pointer from Tauri's wrapper
        let hwnd_wrapper = window.hwnd().map_err(|e| e.to_string())?;
        let hwnd = hwnd_wrapper.0 as HWND;

        unsafe {
            // WDA_EXCLUDEFROMCAPTURE (0x00000011) completely hides the window from capture
            let success = SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE);
            if success == 0 {
                return Err("Failed to set window display affinity on Windows".into());
            }
        }
        return Ok(());
    }

    #[cfg(target_os = "macos")]
    {
        use cocoa::appkit::NSWindow;
        use objc::runtime::Object;

        // Retrieve NSWindow pointer on macOS
        let ns_window_ptr = window.ns_window().map_err(|e| e.to_string())? as *mut Object;
        unsafe {
            // NSWindowSharingNone (0) prevents window inclusion in screen sharing
            ns_window_ptr.setSharingType_(0);
        }
        return Ok(());
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        Err("Anti-capture protection is not supported on this platform".into())
    }
}