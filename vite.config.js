import { defineConfig } from "vite";
import { createRequire } from "module";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const vitePrerender = require("vite-plugin-prerender");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "dist");

// Locate modern Chrome or Edge executable on host system
const browserCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  process.env.CHROME_BIN,
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

const browserExecutable = browserCandidates.find((p) => fs.existsSync(p));

const rendererOptions = {
  renderAfterTime: 1200,
  headless: true,
  maxConcurrentRoutes: 4,
};

if (browserExecutable) {
  rendererOptions.executablePath = browserExecutable;
}

export default defineConfig({
  plugins: [
    vitePrerender({
      staticDir: distDir,
      routes: ["/", "/login", "/signup", "/forgot-password"],
      renderer: new vitePrerender.PuppeteerRenderer(rendererOptions),
      postProcess(renderedRoute) {
        // Ensure root route maps to dist/index.html
        if (renderedRoute.originalRoute === "/") {
          renderedRoute.outputPath = path.join(distDir, "index.html");
        }
        return renderedRoute;
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
