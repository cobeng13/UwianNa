# Lucky Draw

Neon casino-style random picker built with React + Vite, Tailwind CSS, and Framer Motion.

## Run locally

```bash
npm install
npm run dev
```

## Tauri desktop (Windows EXE)

Tauri requires the Rust toolchain (cargo). Install it first:

```bash
# Windows PowerShell
winget install Rustlang.Rustup
```

Then run:

```bash
npm install
npm run tauri
npm run tauri:build
```

The Windows `.exe` will be created by the Tauri build process in `src-tauri/target/release/bundle`.

## How to unlock Rig Mode

Click the **Lucky Draw** title 7 times within 4 seconds to open the hidden Rig Mode modal.
