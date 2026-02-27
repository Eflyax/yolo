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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![detect_ssh_keys])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
