import { defineConfig } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  renderLandingPage,
  renderLoginPage,
  renderSignupPage,
  renderForgotPasswordPage,
} from "./src/views/publicViews.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "dist");

function staticPrerenderPlugin() {
  return {
    name: "vite-static-prerender",
    apply: "build",
    enforce: "post",
    closeBundle() {
      const indexHtmlPath = path.join(distDir, "index.html");
      if (!fs.existsSync(indexHtmlPath)) return;

      const baseHtml = fs.readFileSync(indexHtmlPath, "utf-8");

      const routes = [
        {
          path: "/",
          title: "Credlyst — Your Personal Link Vault & Bookmark Manager",
          description:
            "A practical, privacy-focused link management solution designed to free you from browser tab overload. Manage essential URLs effortlessly across Web App, Browser Extension, and Mobile with instant search and cloud sync.",
          html: renderLandingPage(),
        },
        {
          path: "/landing",
          title: "Credlyst — Your Personal Link Vault & Bookmark Manager",
          description:
            "A practical, privacy-focused link management solution designed to free you from browser tab overload. Manage essential URLs effortlessly across Web App, Browser Extension, and Mobile with instant search and cloud sync.",
          html: renderLandingPage(),
        },
        {
          path: "/login",
          title: "Sign In — Credlyst",
          description:
            "Sign in to your Credlyst account to access your saved links, categories, and synchronized bookmarks.",
          html: renderLoginPage(),
        },
        {
          path: "/signup",
          title: "Create an Account — Credlyst",
          description:
            "Create a free Credlyst account. Start saving, searching, and managing your links with privacy and real-time cloud sync.",
          html: renderSignupPage(),
        },
        {
          path: "/forgot-password",
          title: "Reset Password — Credlyst",
          description:
            "Recover your Credlyst account password. Enter your email to receive a secure recovery link.",
          html: renderForgotPasswordPage(),
        },
      ];

      for (const route of routes) {
        let routeHtml = baseHtml;

        // Inject route title if specified
        if (route.title) {
          routeHtml = routeHtml.replace(
            /<title>.*?<\/title>/i,
            `<title>${route.title}</title>`
          );
          routeHtml = routeHtml.replace(
            /<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i,
            `<meta property="og:title" content="${route.title}" />`
          );
          routeHtml = routeHtml.replace(
            /<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i,
            `<meta name="twitter:title" content="${route.title}" />`
          );
        }

        // Inject route description if specified
        if (route.description) {
          routeHtml = routeHtml.replace(
            /<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i,
            `<meta name="description" content="${route.description}" />`
          );
          routeHtml = routeHtml.replace(
            /<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i,
            `<meta property="og:description" content="${route.description}" />`
          );
          routeHtml = routeHtml.replace(
            /<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i,
            `<meta name="twitter:description" content="${route.description}" />`
          );
        }

        // Update canonical URL and og:url
        const canonicalUrl =
          route.path === "/"
            ? "https://credlyst.ijas.space/"
            : `https://credlyst.ijas.space${route.path}`;
        routeHtml = routeHtml.replace(
          /<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i,
          `<link rel="canonical" href="${canonicalUrl}" />`
        );
        routeHtml = routeHtml.replace(
          /<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i,
          `<meta property="og:url" content="${canonicalUrl}" />`
        );
        routeHtml = routeHtml.replace(
          /<meta\s+name=["']twitter:url["']\s+content=["'].*?["']\s*\/?>/i,
          `<meta name="twitter:url" content="${canonicalUrl}" />`
        );

        // Inject pre-rendered content into <div id="app">...</div>
        routeHtml = routeHtml.replace(
          /<div id="app">[\s\S]*?<\/div>/i,
          `<div id="app">${route.html}</div>`
        );

        const outDir =
          route.path === "/"
            ? distDir
            : path.join(distDir, route.path.replace(/^\//, ""));
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, "index.html"), routeHtml, "utf-8");
      }
      console.log(
        "✓ [static-prerender] Pre-rendered static HTML generated for /, /landing, /login, /signup, /forgot-password"
      );
    },
  };
}

export default defineConfig({
  plugins: [staticPrerenderPlugin()],
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
