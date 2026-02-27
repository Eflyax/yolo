#[tauri::command]
fn detect_ssh_keys() -> Vec<String> {
    let home = std::env::var("HOME").unwrap_or_default();
    let ssh_dir = std::path::Path::new(&home).join(".ssh");

    ["id_rsa", "id_ed25519", "id_ecdsa", "id_dsa"]
        .iter()
        .filter_map(|name| {
            let path = ssh_dir.join(name);
            if path.exists() {
                Some(path.to_string_lossy().into_owned())
            } else {
                None
            }
        })
        .collect()
}

#[tauri::command]
fn find_free_port() -> Result<u16, String> {
    use std::net::TcpListener;
    TcpListener::bind("127.0.0.1:0")
        .map(|l| l.local_addr().unwrap().port())
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_server_binary_path(app: tauri::AppHandle) -> Result<String, String> {
    use tauri::Manager;
    app.path()
        .resolve("remote-worker-linux-x64", tauri::path::BaseDirectory::Resource)
        .map(|p: std::path::PathBuf| p.to_string_lossy().into_owned())
        .map_err(|e: tauri::Error| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![detect_ssh_keys, find_free_port, get_server_binary_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
