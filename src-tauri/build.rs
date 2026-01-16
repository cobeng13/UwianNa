fn main() {
    let icons_dir = std::path::Path::new("icons");
    let icon_path = icons_dir.join("icon.ico");

    if std::fs::create_dir_all(icons_dir).is_ok() && !icon_path.exists() {
        let placeholder_icon: [u8; 70] = [
            0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 32, 0, 48, 0, 0, 0, 22, 0, 0, 0, 40,
            0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 255, 255, 0, 0,
            0, 0,
        ];
        let _ = std::fs::write(icon_path, placeholder_icon);
    }

    tauri_build::build()
}
