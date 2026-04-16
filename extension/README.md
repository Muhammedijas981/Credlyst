# Credlyst Quick Finder (Browser Extension)

The official browser extension for [Credlyst](https://credlyst.ijas.space), allowing you to search and auto-fill your saved links instantly on any website.

## ✨ Features

- **Global Quick Finder**: Press `Ctrl+Shift+F` (or `Cmd+Shift+F` on Mac) anywhere on the web to open the command palette.
- **Instant Search**: Blazing-fast fuzzy search powered by Fuse.js.
- **Smart Auto-Fill**: Press `Enter` to magically insert the selected link into your currently focused input field or textarea.
- **React/Vue Compatible**: Properly updates state-controlled inputs.
- **Copy to Clipboard**: Use `Ctrl+C` or press `Enter` when no field is focused to seamlessly copy the link.
- **Secure Sync**: Seamless integration with your Supabase-powered Credlyst backend session.

## 🚀 Installation (Developer Mode)

To test the extension locally before publishing to the Chrome Web Store:

1. Open a Chromium-based browser (Chrome, Edge, Brave).
2. Navigate to `chrome://extensions`.
3. Toggle on **Developer Mode** in the top right corner.
4. Click **Load unpacked** in the top left.
5. Select the `Credlyst/extension` folder from your cloned repository.
6. The extension is now installed! You should see the Credlyst icon in your toolbar.

## 🛠️ Usage

1. **Sign In**: Click the extension icon in your browser toolbar and enter your Credlyst credentials.
2. **Focus a Field**: Go to any website and focus a text field (e.g. a job application field, a tweet box, etc).
3. **Launch Finder**: Press `Ctrl+Shift+F` to open the Quick Finder overlay.
4. **Search and Insert**: Type to narrow down your links. Use the arrow keys to select the desired link, and hit `Enter`. The URL will automatically be typed into the field.

## 📦 Packaging for Chrome Web Store

A packaging script is provided for your convenience.

1. Open PowerShell and navigate to the repository root.
2. Run `.\pack-extension.ps1`
3. A `dist/credlyst-extension.zip` file will be generated.
4. Upload this ZIP file to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## 🔒 Privacy & Permissions

The extension requests the bare minimum permissions to achieve the quick finder functionality:
- `storage`: securely store your active session token for API interactions.
- `activeTab`: safely inject the Quick Finder UI and insert URLs into the page.
- `<all_urls>` host permission: necessary to allow the extension script to run and fill forms on whatever site you visit.
