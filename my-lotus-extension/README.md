# 🔌 How to Load a Lotus Extension (Manually)

This guide walks you through manually loading a Chrome extension from your local folder — great for developers testing locally.

# 🌸 My Lotus Extension

This is a Chrome extension that overlays a flower animation/effect on web pages. It features a simple popup UI and styling using HTML, CSS, and JavaScript.

---

## 📁 Step 1: Prepare Your Extension Folder

Ensure your extension folder has at least:

---

## 📁 Folder Structure

Example structure:
```
my-lotus-extension/
├── flower-overlay.css
├── flower-overlay.js
├── icon16.png
├── icon48.png
├── icon128.png
├── manifest.json
├── popup.css
├── popup.html
└── popup.js
```

> 📌 Make sure `manifest.json` is **valid and complete**, following [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/).

---

## 🌐 Step 2: Open Chrome Extensions Page

1. Open **Google Chrome**
2. In the address bar, go to:


---

## ⚙️ Step 3: Enable Developer Mode

1. At the top-right of the Extensions page, turn on the toggle for **Developer mode**

## Enable Developer Mode

https://prnt.sc/_ZmU_8JlSo1D

---

## 📂 Step 4: Load Unpacked Extension

1. Click on the **"Load unpacked"** button
2. Browse and **select the folder** that contains your extension (e.g., `my-lotus-extension/`)
3. Once selected, Chrome will load your extension

You should now see it listed on the extensions page, and its icon (if defined) will appear in the toolbar.

---

## 🔁 Step 5: Update Extension (if needed)

- When you make changes to the code, **return to `chrome://extensions/` and click "Reload"** on your extension card to apply updates.
- You can also click "Remove" to uninstall it.

---

## 🧪 Tips for Testing

- Use `console.log()` inside background/content scripts and check logs via:
  - `chrome://extensions/` → "Details" → "Inspect views"
- Ensure permissions in `manifest.json` match what you need (e.g., `tabs`, `storage`, etc.)

---

## ❗ Troubleshooting

- **Manifest errors**: Double-check your `manifest.json` syntax and required fields
- **Permission errors**: Add correct permissions under `"permissions"` in the manifest
- **Extension not showing**: Make sure `"action"` or `"browser_action"` is defined with an icon

---

## 📚 Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)

---

## ✅ Done!

You’ve now successfully loaded your custom Chrome extension manually for testing or development.
