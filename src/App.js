import linkManager from "./services/linkManager.js";
import searchEngine from "./services/searchEngine.js";
import authService from "./services/authService.js";
import toast from "./utils/toast.js";
import Router from "./router/Router.js";
import {
  renderLandingPage,
  renderLoginPage,
  renderSignupPage,
  renderForgotPasswordPage,
  renderResetPasswordPage,
} from "./views/publicViews.js";

class App {
  constructor() {
    this.currentPage = "landing";
    this.currentView = "all"; // all, favorites, recent, categories-page, settings, or category:{name}
    this.theme = localStorage.getItem("theme") || "light";
    this.user = authService.currentUser || {
      name: "Sarah D.",
      plan: "Free Plan",
    };
    this.accounts =
      authService.accounts.length > 0
        ? authService.accounts
        : [
            this.user,
            { name: "Work Profile", plan: "Pro Plan" },
            { name: "Personal Dev", plan: "Hacker Plan" },
          ];
    this.currentAccountIndex = 0;
    this.categories = [];

    window.app = this;
    this.router = new Router();
    this.setupRoutes();
  }

  setupRoutes() {
    // Route guards
    this.router.beforeEach((toPath, fromPath, next) => {
      const cleanPath = toPath.split("?")[0].replace(/\/+$/, "") || "/";
      const isAuthenticated = authService.isAuthenticated;

      // Guest routes
      const guestRoutes = ["/landing", "/login", "/signup", "/forgot-password"];
      const isGuestRoute = guestRoutes.includes(cleanPath);

      // Reset password route
      if (cleanPath === "/reset-password") {
        return next();
      }

      // Root path
      if (cleanPath === "/") {
        if (isAuthenticated) {
          return next();
        } else {
          if (window.innerWidth <= 768) {
            return next("/login");
          }
          return next("/landing");
        }
      }

      if (isGuestRoute) {
        if (isAuthenticated) {
          return next("/");
        }
        return next();
      }

      // Protected dashboard routes
      if (!isAuthenticated) {
        return next("/login");
      }

      next();
    });

    // Public / Auth routes
    this.router.addRoute("/landing", () => this.showPage("landing"), { name: "landing" });
    this.router.addRoute("/login", () => this.showPage("login"), { name: "login" });
    this.router.addRoute("/signup", () => this.showPage("signup"), { name: "signup" });
    this.router.addRoute("/forgot-password", () => this.showPage("forgot-password"), { name: "forgot-password" });
    this.router.addRoute("/reset-password", () => this.showPage("reset-password"), { name: "reset-password" });

    // Dashboard views
    this.router.addRoute("/", () => this.showDashboardView("all"), { name: "home" });
    this.router.addRoute("/all", () => this.showDashboardView("all"), { name: "all" });
    this.router.addRoute("/dashboard", () => this.showDashboardView("all"), { name: "dashboard" });
    this.router.addRoute("/favorites", () => this.showDashboardView("favorites"), { name: "favorites" });
    this.router.addRoute("/favorite", () => this.showDashboardView("favorites"), { name: "favorite" });
    this.router.addRoute("/recent", () => this.showDashboardView("recent"), { name: "recent" });
    this.router.addRoute("/categories", () => this.showDashboardView("categories-page"), { name: "categories" });
    this.router.addRoute("/category/:categoryName", (params) => {
      this.showDashboardView("category:" + (params.categoryName || ""));
    }, { name: "category" });
    this.router.addRoute("/settings", () => this.showDashboardView("settings"), { name: "settings" });
  }

  showPage(pageName) {
    this.currentPage = pageName;
    this.render();
    window.scrollTo(0, 0);
  }

  async showDashboardView(viewName) {
    const isDifferentPage = this.currentPage !== "dashboard";
    this.currentPage = "dashboard";
    this.currentView = viewName;

    if (authService.isAuthenticated) {
      this.user = authService.getCurrentUser() || this.user;
      this.accounts = authService.accounts.length > 0 ? authService.accounts : this.accounts;
    }

    if (isDifferentPage || !document.getElementById("links-grid")) {
      this.render();
    } else {
      this.updateActiveNavIndicators();
      await this.loadView();
    }
  }

  updateActiveNavIndicators() {
    document
      .querySelectorAll(".nav-item, .mobile-nav-item")
      .forEach((item) => item.classList.remove("active"));

    if (this.currentView.startsWith("category:")) {
      const catName = this.currentView.replace("category:", "");
      document
        .querySelectorAll(`[data-category="${catName}"]`)
        .forEach((el) => el.classList.add("active"));
    } else {
      document
        .querySelectorAll(`[data-view="${this.currentView}"]`)
        .forEach((el) => el.classList.add("active"));
    }
  }

  async init() {
    try {
      await authService.initPromise;

      const urlParams = new URLSearchParams(window.location.search);
      const isResetView = urlParams.get("view") === "reset-password";

      authService.onPasswordRecovery((session) => {
        this.router.navigate("/reset-password");
      });

      if (authService.isAuthenticated) {
        this.user = authService.getCurrentUser() || this.user;
        this.accounts = authService.accounts.length > 0 ? authService.accounts : this.accounts;
      }

      this.applyTheme();
      this.setupEventListeners();

      if (isResetView || authService.isRecovery) {
        await this.router.navigate("/reset-password", { replace: true });
      } else {
        await this.router.init();
      }

      this.hideLoading();
    } catch (error) {
      console.error("App init failed:", error);
      this.renderError(error);
    }
  }

  hideLoading() {
    const loading = document.getElementById("loading");
    if (loading) loading.style.opacity = "0";
    setTimeout(() => {
      loading?.remove();
      document.dispatchEvent(new Event("custom-render-trigger"));
    }, 300);
  }

  toggleTheme() {
    this.theme = this.theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", this.theme);
    this.applyTheme();
  }

  applyTheme() {
    document.documentElement.setAttribute("data-theme", this.theme);
    const themeBtnSvg = document.querySelector("#theme-toggle-btn svg");
    if (themeBtnSvg) {
      if (this.theme === "dark") {
        themeBtnSvg.innerHTML =
          '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
      } else {
        themeBtnSvg.innerHTML =
          '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
      }
    }
  }

  render() {
    const app = document.getElementById("app");

    switch (this.currentPage) {
      case "landing":
        app.innerHTML = this.renderLandingPage();
        break;
      case "login":
        app.innerHTML = this.renderLoginPage();
        break;
      case "signup":
        app.innerHTML = this.renderSignupPage();
        break;
      case "forgot-password":
        app.innerHTML = this.renderForgotPasswordPage();
        break;
      case "reset-password":
        app.innerHTML = this.renderResetPasswordPage();
        break;
      case "dashboard":
        app.innerHTML = this.renderDashboard();
        break;
    }

    this.setupDynamicListeners();
    this.applyTheme(); // Ensure theme UI elements are updated after render
  }

  // --- VIEW RENDERERS ---

  renderLandingPage() {
    return renderLandingPage();
  }

  renderLoginPage() {
    return renderLoginPage();
  }

  renderSignupPage() {
    return renderSignupPage();
  }

  renderForgotPasswordPage() {
    return renderForgotPasswordPage();
  }

  renderResetPasswordPage() {
    return renderResetPasswordPage();
  }

  renderDashboard() {
    // SVG Icons
    const iconDashboard = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`;
    const iconHeart = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
    const iconClock = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
    const iconCategory = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>`;
    const iconSettings = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
    const iconSearch = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
    const iconPlus = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;

    return `
            <div class="dashboard-wrapper">
                <!-- SIDEBAR -->
                <aside class="sidebar" id="sidebar">
                    <div class="sidebar-top">
                        <div class="logo-area" style="cursor: pointer;" onclick="app.router.navigate('/')">
                            <img src="/logo.png" alt="Credlyst logo" class="logo-image" decoding="async">
                            <span class="logo-text">Credlyst</span>
                        </div>
                        
                        <nav class="nav-menu">
                            <a href="/" class="nav-item ${this.currentView === "all" ? "active" : ""}" data-view="all">
                                ${iconDashboard}
                                <span>All Links</span>
                            </a>
                            <a href="/favorites" class="nav-item ${this.currentView === "favorites" ? "active" : ""}" data-view="favorites">
                                ${iconHeart}
                                <span>Favorites</span>
                            </a>
                            <a href="/recent" class="nav-item ${this.currentView === "recent" ? "active" : ""}" data-view="recent">
                                ${iconClock}
                                <span>Recent</span>
                            </a>
                            <a href="/categories" class="nav-item ${this.currentView === "categories-page" ? "active" : ""}" data-view="categories-page">
                                ${iconCategory}
                                <span>Categories</span>
                            </a>
                            <a href="/settings" class="nav-item ${this.currentView === "settings" ? "active" : ""}" data-view="settings">
                                ${iconSettings}
                                <span>Settings</span>
                            </a>
                        </nav>
                    </div>
                    
                    <div class="sidebar-bottom">
                        <div class="user-section">
                            <div class="user-profile">
                                <div class="avatar">${this.user.name.charAt(0)}</div>
                                <div class="user-info">
                                    <span class="user-name">${this.user.name}</span>
                                    <span class="user-plan">Free Plan</span>
                                </div>
                            </div>
                            <div style="margin: 0.5rem 0; width: 100%; border-top: 1px solid var(--border-color); opacity: 0.5;"></div>
                            <button class="btn-block btn-outline" style="margin-bottom: 0.5rem; font-size: 0.85rem; padding: 0.4rem; display: flex; align-items: center; justify-content: center; gap: 4px;" data-action="add-account">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Add another account
                            </button>
                            <a href="#" class="logout-link" id="logout-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                <span>Log out</span>
                            </a>
                        </div>
                    </div>
                </aside>

                <!-- MAIN CONTENT -->
                <main class="main-content">
                    <!-- Mobile Logo Section -->
                    <div class="mobile-logo-section">
                        <div class="mobile-logo-left" style="cursor: pointer;" onclick="app.router.navigate('/')">
                            <img src="/logo.png" alt="Credlyst logo" class="mobile-app-logo" decoding="async">
                            <span class="mobile-app-name">Credlyst</span>
                        </div>
                        <div class="mobile-profile-action">
                            <button id="mobile-profile-toggle" class="mobile-profile-btn">
                                <div class="avatar-sm">${this.user.name.charAt(0)}</div>
                            </button>
                            
                            <!-- Profile Dropdown -->
                            <div id="mobile-profile-dropdown" class="profile-dropdown hidden">
                                <div class="dropdown-header">
                                    <div class="avatar-md">${this.user.name.charAt(0)}</div>
                                    <div class="dropdown-user-info">
                                        <div class="dropdown-name">${this.user.name}</div>
                                        <div class="dropdown-plan">Free Plan</div>
                                    </div>
                                </div>
                                <div class="dropdown-divider"></div>
                                <button class="dropdown-item" data-action="add-account">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                    Add another account
                                </button>
                                <button id="mobile-logout-btn" class="dropdown-item danger">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                    Log out
                                </button>
                            </div>
                            <div id="profile-overlay" class="profile-overlay hidden"></div>
                        </div>
                    </div>
                    
                    <header class="top-bar">
                        <div class="search-wrapper">
                            ${iconSearch}
                            <input type="text" id="global-search" placeholder="Search links...">
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button id="theme-toggle-btn" class="btn btn-outline" style="padding: 0.5rem; display: flex; align-items: center; justify-content: center;" aria-label="Toggle theme" title="Toggle theme">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"></svg>
                            </button>
                            <button class="btn btn-outline" id="smart-paste-btn" style="font-weight: 500;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                Smart Paste
                            </button>
                            <button class="btn btn-outline" id="auto-categorize-btn" style="font-weight: 500; display: flex; align-items: center; gap: 4px;">
                                ✨ Auto-Categorize All
                            </button>
                            <button class="btn btn-primary" id="add-link-btn" style="font-weight: 500;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                New Link
                            </button>
                        </div>
                    </header>

                    <div class="content-scroll">
                        <div class="section-header">
                            <h1 id="view-title">All Links <span class="count-badge" id="total-count">...</span></h1>
                        </div>
                        
                        <div id="links-grid" class="cards-grid">
                            <div class="loading-state">Loading links...</div>
                        </div>
                    </div>
                </main>

                <!-- MOBILE BOTTOM NAVIGATION -->
                <nav class="mobile-nav">
                    <div class="mobile-nav-items">
                        <a href="/" class="mobile-nav-item ${this.currentView === "all" ? "active" : ""}" data-view="all">
                            ${iconDashboard}
                            <span>All</span>
                        </a>
                        <a href="/favorites" class="mobile-nav-item ${this.currentView === "favorites" ? "active" : ""}" data-view="favorites">
                            ${iconHeart}
                            <span>Favorites</span>
                        </a>
                        <a href="/categories" class="mobile-nav-item ${this.currentView === "categories-page" ? "active" : ""}" data-view="categories-page">
                            ${iconCategory}
                            <span>Categories</span>
                        </a>
                        <a href="/recent" class="mobile-nav-item ${this.currentView === "recent" ? "active" : ""}" data-view="recent">
                            ${iconClock}
                            <span>Recent</span>
                        </a>
                        <a href="/settings" class="mobile-nav-item ${this.currentView === "settings" ? "active" : ""}" data-view="settings">
                            ${iconSettings}
                            <span>Settings</span>
                        </a>
                    </div>
                </nav>

                <!-- MOBILE FAB -->
                <button class="mobile-fab" id="mobile-add-btn">
                    ${iconPlus}
                </button>
                
                <div id="modal-container"></div>
            </div>
        `;
  }

  renderError(error) {
    document.getElementById("loading").innerHTML = `
            <div style="text-align:center; padding:2rem">
                <h2>Error</h2><p>${error.message}</p>
                <button onclick="location.reload()">Reload</button>
            </div>`;
  }

  // --- EVENT LISTENERS ---

  setupEventListeners() {
    document.addEventListener("click", (e) => {
      const action = e.target.closest("[data-action]")?.dataset.action;
      if (action === "nav-login") {
        this.router.navigate("/login");
      }
      if (action === "nav-signup") {
        this.router.navigate("/signup");
      }
      if (action === "nav-forgot-password") {
        this.router.navigate("/forgot-password");
      }
      if (action === "toggle-password") {
        const wrapper = e.target.closest(".password-wrapper");
        const input = wrapper.querySelector("input");
        const icon = wrapper.querySelector(".eye-icon");

        if (input.type === "password") {
          input.type = "text";
          icon.innerHTML =
            '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
        } else {
          input.type = "password";
          icon.innerHTML =
            '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
        }
      }
      if (action === "add-account") {
        document
          .getElementById("mobile-profile-dropdown")
          ?.classList.add("hidden");
        document.getElementById("profile-overlay")?.classList.add("hidden");
        this.router.navigate("/login");
      }
    });
  }

  setupDynamicListeners() {
    // Landing & Auth
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
          // Show loader
          submitBtn.disabled = true;
          submitBtn.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <div class="spinner-small"></div>
                            Signing in...
                        </div>
                    `;

          await authService.login(
            e.target.email.value,
            e.target.password.value,
          );
          this.user = authService.getCurrentUser();

          // Show success toast
          toast.success("Welcome back! Redirecting to dashboard...");

          // Redirect to dashboard after short delay
          setTimeout(() => {
            this.router.navigate("/");
          }, 800);
        } catch (error) {
          // Show error toast
          toast.error(error.message || "Login failed. Please try again.");

          // Reset button
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      });
    }

    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
      signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
          // Show loader
          submitBtn.disabled = true;
          submitBtn.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <div class="spinner-small"></div>
                            Creating account...
                        </div>
                    `;

          await authService.signup(
            e.target.name.value,
            e.target.email.value,
            e.target.password.value,
          );
          this.user = authService.getCurrentUser();

          // Show success toast
          toast.success("Account created successfully! Redirecting...");

          // Redirect to dashboard after short delay
          setTimeout(() => {
            this.router.navigate("/");
          }, 800);
        } catch (error) {
          // Show error toast
          toast.error(error.message || "Signup failed. Please try again.");

          // Reset button
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      });
    }

    const forgotPasswordForm = document.getElementById("forgot-password-form");
    if (forgotPasswordForm) {
      forgotPasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        const email = e.target.email.value.trim();

        if (!email) {
          toast.error("Please enter your email address.");
          return;
        }

        try {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <div class="spinner-small"></div>
                            Sending link...
                        </div>
                    `;

          await authService.requestPasswordReset(email);
          toast.success("Password reset email sent. Please check your inbox.");

          setTimeout(() => {
            this.router.navigate("/login");
          }, 1200);
        } catch (error) {
          toast.error(error.message || "Unable to send reset email.");
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      });
    }

    const resetPasswordForm = document.getElementById("reset-password-form");
    if (resetPasswordForm) {
      resetPasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        const password = e.target.password.value;
        const confirmPassword = e.target.confirmPassword.value;

        if (!password || password.length < 6) {
          toast.error("Password must be at least 6 characters.");
          return;
        }

        if (password !== confirmPassword) {
          toast.error("Passwords do not match.");
          return;
        }

        try {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <div class="spinner-small"></div>
                            Updating password...
                        </div>
                    `;

          await authService.updatePassword(password);
          toast.success("Password updated successfully. You can sign in now.");

          setTimeout(() => {
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            );
            this.router.navigate("/login");
          }, 1200);
        } catch (error) {
          toast.error(error.message || "Unable to update password.");
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      });
    }

    const settingsPasswordChangeForm = document.getElementById(
      "settings-password-change-form",
    );
    if (settingsPasswordChangeForm) {
      settingsPasswordChangeForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newPassword = e.target.newPassword.value;
        const confirmPassword = e.target.confirmPassword.value;

        if (!newPassword || newPassword.length < 6) {
          toast.error("Password must be at least 6 characters.");
          return;
        }

        if (newPassword !== confirmPassword) {
          toast.error("Passwords do not match.");
          return;
        }

        try {
          const submitBtn = e.target.querySelector('button[type="submit"]');
          const originalText = submitBtn.innerHTML;
          submitBtn.disabled = true;
          submitBtn.innerHTML = "Updating...";

          await authService.updatePassword(newPassword);
          toast.success("Password updated successfully.");

          e.target.reset();
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        } catch (error) {
          toast.error(error.message || "Unable to update password.");
          const submitBtn = e.target.querySelector('button[type="submit"]');
          submitBtn.disabled = false;
          submitBtn.innerHTML = "Change Password";
        }
      });
    }

    // Dashboard
    if (this.currentPage === "dashboard") {
      this.hydrateDashboard();

      // Logout
      document.getElementById("logout-btn")?.addEventListener("click", () => {
        authService.logout();
      });
      // Add Link (Desktop)
      document
        .getElementById("add-link-btn")
        ?.addEventListener("click", () => this.showAddLinkModal());

      // Smart Paste (Desktop)
      document
        .getElementById("smart-paste-btn")
        ?.addEventListener("click", () => this.showSmartPasteModal());

      // Auto-Categorize All
      document
        .getElementById("auto-categorize-btn")
        ?.addEventListener("click", () => this.autoCategorizeAllLinks());

      // Theme Toggle
      document
        .getElementById("theme-toggle-btn")
        ?.addEventListener("click", () => this.toggleTheme());

      // Mobile FAB
      document
        .getElementById("mobile-add-btn")
        ?.addEventListener("click", () => this.showAddLinkModal());

      // Gmail-like Account Switcher — attached only to avatar elements
      // Use rAF so avatar dimensions are available (post-layout)
      requestAnimationFrame(() => this._setupAccountSwiper());

      // Mobile Profile Dropdown Toggle
      const mobileProfileToggle = document.getElementById(
        "mobile-profile-toggle",
      );
      const mobileProfileDropdown = document.getElementById(
        "mobile-profile-dropdown",
      );
      const profileOverlay = document.getElementById("profile-overlay");

      if (mobileProfileToggle && mobileProfileDropdown && profileOverlay) {
        const toggleDropdown = () => {
          mobileProfileDropdown.classList.toggle("hidden");
          profileOverlay.classList.toggle("hidden");
        };

        mobileProfileToggle.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleDropdown();
        });

        profileOverlay.addEventListener("click", toggleDropdown);

        // Close when clicking outside (fallback)
        document.addEventListener("click", (e) => {
          if (
            !mobileProfileDropdown.classList.contains("hidden") &&
            !mobileProfileDropdown.contains(e.target) &&
            !mobileProfileToggle.contains(e.target)
          ) {
            toggleDropdown();
          }
        });
      }

      // Mobile Logout
      document
        .getElementById("mobile-logout-btn")
        ?.addEventListener("click", () => {
          authService.logout();
        });

      // Search
      const searchInput = document.getElementById("global-search");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          this.handleSearch(e.target.value);
        });
      }

      // Navigation items (All/Favorites/Recent/Categories/Settings) - works for both desktop and mobile
      document.querySelectorAll("[data-view]").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          const view = e.currentTarget.dataset.view;
          let targetPath = "/";
          if (view === "all") targetPath = "/";
          else if (view === "favorites") targetPath = "/favorites";
          else if (view === "recent") targetPath = "/recent";
          else if (view === "categories-page") targetPath = "/categories";
          else if (view === "settings") targetPath = "/settings";
          else if (view && view.startsWith("category:")) targetPath = "/category/" + encodeURIComponent(view.replace("category:", ""));
          this.router.navigate(targetPath);
        });
      });

      // Category filter
      document.querySelectorAll("[data-category]").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          const cat = e.currentTarget.dataset.category;
          this.router.navigate("/category/" + encodeURIComponent(cat));
        });
      });
    }
  }

  async hydrateDashboard() {
    // Load categories
    await this.loadCategories();
    // Load links based on current view
    await this.loadView();
  }

  _setupAccountSwiper() {
    if (this.accounts.length <= 1) return; // Nothing to swipe if single account

    // For each avatar element in the DOM, we wrap it to clip overflow and attach swipe
    const avatarEls = document.querySelectorAll(".avatar, .avatar-sm");

    avatarEls.forEach((avatarEl) => {
      // Wrap avatar in a clip wrapper if not already wrapped
      if (!avatarEl.parentElement.classList.contains("avatar-swipe-wrapper")) {
        const wrapper = document.createElement("div");
        wrapper.className = "avatar-swipe-wrapper";
        wrapper.style.cssText = `
                    overflow: hidden;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    width: ${avatarEl.offsetWidth || 36}px;
                    height: ${avatarEl.offsetHeight || 36}px;
                    position: relative;
                    cursor: grab;
                    user-select: none;
                    -webkit-user-select: none;
                `;
        avatarEl.parentElement.insertBefore(wrapper, avatarEl);
        wrapper.appendChild(avatarEl);
      }

      const wrapper = avatarEl.parentElement;

      let startY = 0;
      let isDragging = false;
      let hasSwiped = false; // Track if an actual swipe happened (vs just a tap)
      let isAnimating = false;

      const doSwitch = async (direction) => {
        if (isAnimating) return;
        isAnimating = true;

        const slideOut = direction > 0 ? "-110%" : "110%";
        const slideIn = direction > 0 ? "110%" : "-110%";

        // Animate out
        avatarEl.style.transition =
          "transform 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease";
        avatarEl.style.transform = `translateY(${slideOut})`;
        avatarEl.style.opacity = "0";

        // Compute next index
        const nextIndex =
          direction > 0
            ? (this.currentAccountIndex + 1) % this.accounts.length
            : (this.currentAccountIndex - 1 + this.accounts.length) %
              this.accounts.length;

        const targetAccount = this.accounts[nextIndex];

        // Switch backend session
        if (authService.isAuthenticated && targetAccount.access_token) {
          try {
            await authService.switchAccount(targetAccount);
            this.user = authService.getCurrentUser();
            this.accounts = authService.accounts;
            this.currentAccountIndex = 0;
          } catch (err) {
            console.error("Account switch failed:", err);
            toast.error("Could not switch account — session may have expired.");
            avatarEl.style.transition =
              "transform 0.22s ease, opacity 0.22s ease";
            avatarEl.style.transform = "translateY(0)";
            avatarEl.style.opacity = "1";
            isAnimating = false;
            return;
          }
        } else {
          this.user = targetAccount;
          this.currentAccountIndex = nextIndex;
        }

        // Update all name/plan/email text across the whole page
        const name = this.user.name || "User";
        const plan = this.user.plan || "Free Plan";
        const email = this.user.email || "";
        const initial = name.charAt(0).toUpperCase();

        document
          .querySelectorAll(".avatar, .avatar-md, .avatar-sm")
          .forEach((el) => (el.textContent = initial));
        document
          .querySelectorAll(".user-name, .dropdown-name")
          .forEach((el) => (el.textContent = name));
        document
          .querySelectorAll(".user-plan, .dropdown-plan")
          .forEach((el) => (el.textContent = plan));
        document
          .querySelectorAll(".user-email")
          .forEach((el) => (el.textContent = email));

        // Position new content below/above ready to slide in
        avatarEl.style.transition = "none";
        avatarEl.style.transform = `translateY(${slideIn})`;
        avatarEl.style.opacity = "0";
        void avatarEl.offsetWidth; // force reflow

        // Animate in with a spring bounce
        avatarEl.style.transition =
          "transform 0.32s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.28s ease";
        avatarEl.style.transform = "translateY(0)";
        avatarEl.style.opacity = "1";

        toast.info(`↔ Switched to ${name}`);

        // Reload data for the new account
        await this.hydrateDashboard();

        setTimeout(() => {
          isAnimating = false;
          startY = 0;
        }, 350);
      };

      // --- Touch ---
      wrapper.addEventListener(
        "touchstart",
        (e) => {
          if (isAnimating) return;
          startY = e.touches[0].clientY;
          hasSwiped = false;
          isDragging = false;
        },
        { passive: true },
      );

      wrapper.addEventListener(
        "touchmove",
        (e) => {
          if (isAnimating || !startY) return;
          isDragging = true;
        },
        { passive: true },
      );

      wrapper.addEventListener(
        "touchend",
        (e) => {
          if (isAnimating || !startY) return;
          const endY = e.changedTouches[0].clientY;
          const diffY = startY - endY;
          if (Math.abs(diffY) > 40) {
            hasSwiped = true;
            doSwitch(diffY > 0 ? 1 : -1);
          }
          startY = 0;
          isDragging = false;
        },
        { passive: true },
      );

      // --- Mouse (desktop) ---
      let mouseMoved = false;
      wrapper.addEventListener("mousedown", (e) => {
        if (isAnimating) return;
        startY = e.clientY;
        mouseMoved = false;
        wrapper.style.cursor = "grabbing";
      });

      window.addEventListener("mousemove", (e) => {
        if (!startY || isAnimating) return;
        if (Math.abs(startY - e.clientY) > 5) mouseMoved = true;
      });

      window.addEventListener("mouseup", (e) => {
        if (!startY || isAnimating) {
          startY = 0;
          wrapper.style.cursor = "grab";
          return;
        }
        const diffY = startY - e.clientY;
        if (mouseMoved && Math.abs(diffY) > 40) {
          doSwitch(diffY > 0 ? 1 : -1);
        }
        startY = 0;
        mouseMoved = false;
        wrapper.style.cursor = "grab";
      });
    });
  }

  async loadCategories() {
    try {
      let dbCategories = [];

      // Fetch from Supabase
      try {
        dbCategories = await linkManager.getCategories();
      } catch (err) {
        console.warn("Failed to fetch categories from Supabase:", err);
      }

      // Get custom categories from localStorage
      const customCategories = JSON.parse(
        localStorage.getItem("custom_categories") || "[]",
      );

      // Remove duplicates from localStorage
      const uniqueCustomCategories = [...new Set(customCategories)];
      if (uniqueCustomCategories.length !== customCategories.length) {
        localStorage.setItem(
          "custom_categories",
          JSON.stringify(uniqueCustomCategories),
        );
      }

      // Merge: add custom categories that don't exist in DB yet
      const mergedCategories = [...dbCategories];
      uniqueCustomCategories.forEach((customCat) => {
        if (!mergedCategories.some((c) => c.category === customCat)) {
          mergedCategories.push({ category: customCat, count: 0 });
        }
      });

      this.categories = mergedCategories;

      // Update sidebar if already rendered
      const categoriesList = document.getElementById("categories-list");
      if (categoriesList) {
        const categoriesHTML = this.categories
          .map(
            (cat) => `
                    <a href="/category/${encodeURIComponent(cat.category)}" class="nav-item tag-item ${this.currentView === "category:" + cat.category ? "active" : ""}" data-category="${cat.category}">
                        <span>#</span> ${cat.category} <small>(${cat.count})</small>
                    </a>
                `,
          )
          .join("");
        categoriesList.innerHTML =
          categoriesHTML ||
          '<p style="padding: 0 1rem; color: var(--text-tertiary); font-size: 0.85rem;">No categories yet</p>';

        // Re-attach listeners
        document.querySelectorAll("#categories-list [data-category]").forEach((item) => {
          item.addEventListener("click", (e) => {
            e.preventDefault();
            this.router.navigate("/category/" + encodeURIComponent(e.currentTarget.dataset.category));
          });
        });
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  }

  async loadView() {
    let links = [];
    let title = "All Links";

    try {
      if (this.currentView === "all") {
        links = await linkManager.getAllLinks();
        title = "All Links";
        this.renderLinksList(links);
      } else if (this.currentView === "favorites") {
        links = await searchEngine.getFavorites();
        title = "Favorites";
        this.renderLinksList(links);
      } else if (this.currentView === "recent") {
        const allLinks = await linkManager.getAllLinks();

        // Industry standard: "Recent" means within a certain time window (e.g. 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        links = allLinks
          .filter((link) => {
            const actionDate = new Date(link.updated_at || link.created_at);
            return actionDate >= sevenDaysAgo;
          })
          .sort(
            (a, b) =>
              new Date(b.updated_at || b.created_at) -
              new Date(a.updated_at || a.created_at),
          )
          .slice(0, 12); // max 12 items

        title = "Recent (Last 7 Days)";
        this.renderLinksList(links);
      } else if (this.currentView === "categories-page") {
        title = "Categories";
        this.renderCategoriesPage();
        this.updateActiveNavIndicators();
        return;
      } else if (this.currentView === "settings") {
        title = "Settings";
        this.renderSettingsPage();
        this.updateActiveNavIndicators();
        return;
      } else if (this.currentView.startsWith("category:")) {
        const category = this.currentView.replace("category:", "");
        links = await searchEngine.searchByCategory(category);
        title = `# ${category}`;
        this.renderLinksList(links);
      }

      const viewTitleEl = document.getElementById("view-title");
      if (viewTitleEl) {
        viewTitleEl.innerHTML = `${title} <span class="count-badge">(${links.length})</span>`;
      }

      this.updateActiveNavIndicators();
    } catch (error) {
      console.error("Failed to load view:", error);
      this.renderLinksList([]);
    }
  }

  handleSearch(query) {
    if (!query.trim()) {
      this.loadView();
      return;
    }
    searchEngine.search(query).then((results) => {
      document.getElementById("view-title").innerHTML =
        `Search Results <span class="count-badge">(${results.length})</span>`;
      this.renderLinksList(results);
    });
  }

  renderLinksList(links) {
    const container = document.getElementById("links-grid");
    if (!container) return;

    container.className = "cards-grid";

    if (links.length === 0) {
      container.innerHTML = `
                <div class="empty-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; grid-column: 1 / -1; min-height: 40vh;">
                    <style>
                        @keyframes floatCat { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
                        @keyframes zzzFly { 0% { opacity: 0; transform: translate(0, 0) scale(0.5); } 50% { opacity: 0.7; transform: translate(15px, -20px) scale(1); } 100% { opacity: 0; transform: translate(30px, -40px) scale(1.2); } }
                    </style>
                    <svg width="180" height="180" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: #cbd5e1; margin-bottom: 1.5rem; animation: floatCat 6s ease-in-out infinite;">
                        <!-- Sleeping Anime Cat SVG Outline -->
                        <g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                            <!-- Cat Body -->
                            <path d="M 120 280 C 120 180, 280 180, 280 280" fill="none" stroke-width="12" />
                            <!-- Ears -->
                            <path d="M 130 200 L 105 110 L 175 160" fill="none" stroke-width="10" />
                            <path d="M 270 200 L 295 110 L 225 160" fill="none" stroke-width="10" />
                            <!-- Closed Eyes -->
                            <path d="M 150 220 Q 165 235 180 220" fill="none" stroke-width="8" />
                            <path d="M 220 220 Q 235 235 250 220" fill="none" stroke-width="8" />
                            <!-- Cute Nose -->
                            <circle cx="200" cy="245" r="5" fill="currentColor" />
                            <!-- Mouth -->
                            <path d="M 185 255 Q 200 270 215 255" fill="none" stroke-width="6" />
                            <!-- Tail -->
                            <path d="M 275 260 Q 330 260 330 220 Q 330 180 300 180 Q 285 180 285 200" fill="none" stroke-width="10" />
                            
                            <!-- Zzz Animations -->
                            <path d="M 260 80 L 290 80 L 260 110 L 290 110" stroke-width="8" opacity="0" style="animation: zzzFly 3.5s infinite linear;" />
                            <path d="M 300 50 L 320 50 L 300 70 L 320 70" stroke-width="6" opacity="0" style="animation: zzzFly 3.5s infinite linear 1.2s;" />
                            <path d="M 330 20 L 345 20 L 330 35 L 345 35" stroke-width="4" opacity="0" style="animation: zzzFly 3.5s infinite linear 2.4s;" />
                        </g>
                    </svg>
                    <h3 style="font-size: 1.4rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">Nothing found here!</h3>
                    <p style="color: var(--text-secondary); max-width: 320px; text-align: center; font-size: 0.95rem; line-height: 1.5;">Looks like our database cat is taking a nap. Try searching for something else or add some new links!</p>
                </div>
            `;
      return;
    }

    container.innerHTML = links
      .map((link) => this.renderLinkCard(link))
      .join("");
  }

  renderCategoriesPage() {
    const container = document.getElementById("links-grid");
    if (!container) return;

    // Update title
    document.getElementById("view-title").innerHTML =
      `Categories <span class="count-badge">(${this.categories.length})</span>`;

    // Render categories grid
    const categoriesHTML = this.categories
      .map(
        (cat) => `
            <div class="category-card">
                <div class="category-header">
                    <div class="category-icon" style="background: linear-gradient(135deg, ${this.getCategoryColor(cat.category)} 0%, ${this.getCategoryColorDark(cat.category)} 100%);">
                        #
                    </div>
                    <button class="btn-icon-sm danger" onclick="app.deleteCategory('${cat.category}')" style="opacity: 1;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
                <h3 class="category-name">${cat.category}</h3>
                <p class="category-count">${cat.count} ${cat.count === 1 ? "link" : "links"}</p>
                <button class="btn btn-outline btn-block" onclick="app.viewCategory('${cat.category}')" style="margin-top: 1rem; font-size: 0.9rem; padding: 0.6rem 1rem;">
                    View Links
                </button>
            </div>
        `,
      )
      .join("");

    // Add "Create New Category" card at the beginning
    const createCardHTML = `
            <div class="category-card create-category-card" onclick="app.showCreateCategoryInline()">
                <div class="create-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </div>
                <h3 class="category-name">Create Category</h3>
                <p class="category-count">Add a new category</p>
            </div>
        `;

    container.innerHTML = createCardHTML + categoriesHTML;
    container.className = "cards-grid"; // Use same grid
  }

  getCategoryColor(name) {
    const colors = [
      "#2563EB",
      "#7c3aed",
      "#db2777",
      "#dc2626",
      "#ea580c",
      "#16a34a",
      "#0891b2",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getCategoryColorDark(name) {
    const colors = [
      "#1d4ed8",
      "#6d28d9",
      "#be185d",
      "#b91c1c",
      "#c2410c",
      "#15803d",
      "#0e7490",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  viewCategory(categoryName) {
    this.router.navigate("/category/" + encodeURIComponent(categoryName));
  }

  showCreateCategoryInline() {
    const modalContainer = document.getElementById("modal-container");

    modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal" style="max-width: 480px;">
                    <div class="modal-header">
                        <h2>Create Category</h2>
                        <button class="close-modal">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <form id="create-category-inline-form">
                        <div class="form-group">
                            <label>Category Name <span class="required">*</span></label>
                            <input type="text" name="categoryName" required placeholder="e.g., Work, Personal, Projects..." autofocus>
                        </div>
                        <div id="error-message"></div>
                        <button type="submit" class="btn btn-primary btn-block">Create Category</button>
                    </form>
                </div>
            </div>
        `;

    modalContainer.querySelector(".close-modal").onclick = () =>
      (modalContainer.innerHTML = "");

    document.getElementById("create-category-inline-form").onsubmit = async (
      e,
    ) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const categoryName = formData.get("categoryName").trim();

      if (!categoryName) return;

      // Check if exists
      if (
        this.categories.some(
          (c) => c.category.toLowerCase() === categoryName.toLowerCase(),
        )
      ) {
        // Show error in modal
        const errorContainer = document.getElementById("error-message");
        errorContainer.innerHTML = `
                    <div style="background: #fee2e2; color: #dc2626; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem;">
                        This category already exists!
                    </div>
                `;
        setTimeout(() => (errorContainer.innerHTML = ""), 3000);
        return;
      }

      try {
        // Add to localStorage
        const storedCategories = JSON.parse(
          localStorage.getItem("custom_categories") || "[]",
        );
        storedCategories.push(categoryName);
        localStorage.setItem(
          "custom_categories",
          JSON.stringify(storedCategories),
        );

        // Close modal
        modalContainer.innerHTML = "";

        toast.success(`Category "${categoryName}" created successfully!`);

        // Reload categories and refresh page
        await this.loadCategories();
        this.renderCategoriesPage();
      } catch (error) {
        console.error("Error creating category:", error);
        const errorContainer = document.getElementById("error-message");
        errorContainer.innerHTML = `
                    <div style="background: #fee2e2; color: #dc2626; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem;">
                        Failed to create category. Please try again.
                    </div>
                `;
      }
    };
  }

  getProfileAvatarMarkup() {
    const avatarUrl = this.user?.avatar_url;
    if (avatarUrl) {
      return `<img src="${avatarUrl}" alt="User avatar" class="settings-avatar-image" loading="lazy" decoding="async">`;
    }

    const initials = (this.user?.name || "U")
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    return `<div class="settings-avatar-initials">${initials}</div>`;
  }

  setTheme(theme) {
    this.theme = theme;
    localStorage.setItem("theme", theme);
    this.applyTheme();
  }

  async handleAvatarUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const modalContainer = document.getElementById("modal-container");
      modalContainer.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal" style="max-width: 520px;">
                        <div class="modal-header">
                            <h2>Crop profile picture</h2>
                            <button class="close-modal" type="button">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div class="modal-body" style="padding: 1.25rem 2rem 2rem;">
                            <div style="display:flex; justify-content:center; margin-bottom: 1rem;">
                                <canvas id="avatar-crop-canvas" width="280" height="280" style="max-width: 100%; border-radius: 16px; background: var(--color-slate-50);"></canvas>
                            </div>
                            <label style="display:block; margin-bottom: 0.75rem; font-weight: 600;">Zoom</label>
                            <input id="avatar-zoom" type="range" min="1" max="2.5" step="0.1" value="1" style="width: 100%;">
                            <div style="display:flex; gap: 0.75rem; margin-top: 1.25rem;">
                                <button type="button" class="btn btn-outline" data-action="cancel-avatar-crop">Cancel</button>
                                <button type="button" id="save-avatar-crop" class="btn btn-primary">Save photo</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

      const canvas = modalContainer.querySelector("#avatar-crop-canvas");
      const zoomInput = modalContainer.querySelector("#avatar-zoom");
      const drawPreview = () => {
        const ctx = canvas.getContext("2d");
        const size = 280;
        ctx.clearRect(0, 0, size, size);
        ctx.fillStyle = "var(--color-slate-50)";
        ctx.fillRect(0, 0, size, size);

        const zoom = parseFloat(zoomInput.value || 1);
        const sourceSize =
          Math.max(image.naturalWidth, image.naturalHeight) / zoom;
        const sourceX = (image.naturalWidth - sourceSize) / 2;
        const sourceY = (image.naturalHeight - sourceSize) / 2;
        ctx.drawImage(
          image,
          sourceX,
          sourceY,
          sourceSize,
          sourceSize,
          0,
          0,
          size,
          size,
        );
      };

      zoomInput.addEventListener("input", drawPreview);
      drawPreview();

      modalContainer.querySelector(".close-modal").onclick = () => {
        modalContainer.innerHTML = "";
        URL.revokeObjectURL(objectUrl);
      };
      modalContainer.querySelector(
        '[data-action="cancel-avatar-crop"]',
      ).onclick = () => {
        modalContainer.innerHTML = "";
        URL.revokeObjectURL(objectUrl);
      };
      modalContainer.querySelector("#save-avatar-crop").onclick = async () => {
        const dataUrl = canvas.toDataURL("image/png");
        try {
          await authService.updateProfile({ avatar_url: dataUrl });
          this.user = authService.getCurrentUser();
          toast.success("Profile photo updated.");
          this.renderSettingsPage();
          modalContainer.innerHTML = "";
          URL.revokeObjectURL(objectUrl);
        } catch (error) {
          toast.error(error.message || "Unable to update profile photo.");
        }
      };
    };
    image.src = objectUrl;
  }

  async removeAvatar() {
    try {
      await authService.updateProfile({ avatar_url: null });
      this.user = authService.getCurrentUser();
      this.renderSettingsPage();
      toast.success("Profile photo removed.");
    } catch (error) {
      toast.error(error.message || "Unable to remove profile photo.");
    }
  }

  renderSettingsPage() {
    const container = document.getElementById("links-grid");
    if (!container) return;

    document.getElementById("view-title").innerHTML = "Settings";

    const userName = this.user?.name || "Your name";
    const userEmail = this.user?.email || "demo@credlyst.com";

    container.innerHTML = `
            <div style="max-width: 900px; margin: 0 auto; display: grid; gap: 1.5rem;">
                <div class="settings-section">
                    <h3 class="settings-title">Profile</h3>
                    <div class="settings-card">
                        <div style="margin-bottom: 0.5rem;">
                            <h3 style="margin: 0 0 0.35rem; font-size: 1.15rem;">${userName}</h3>
                            <p style="margin: 0; color: var(--text-secondary);">${userEmail}</p>
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h3 class="settings-title">Security</h3>
                    <div class="settings-card">
                        <form id="settings-password-change-form">
                            <div class="form-group">
                                <label>New password</label>
                                <div class="password-wrapper">
    <input type="password" name="newPassword" required placeholder="••••••••">
    <button type="button" class="btn-toggle-password" data-action="toggle-password" tabindex="-1" aria-label="Toggle password visibility">
        <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    </button>
</div>
                            </div>
                            <div class="form-group">
                                <label>Confirm new password</label>
                                <div class="password-wrapper">
    <input type="password" name="confirmPassword" required placeholder="••••••••">
    <button type="button" class="btn-toggle-password" data-action="toggle-password" tabindex="-1" aria-label="Toggle password visibility">
        <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    </button>
</div>
                            </div>
                            <button type="submit" class="btn btn-primary">Change Password</button>
                        </form>
                    </div>
                </div>

                <div class="settings-section">
                    <h3 class="settings-title">Data</h3>
                    <div class="settings-card">
                        <div class="setting-item">
                            <div>
                                <strong>Export Data</strong>
                                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem;">Download all your links.</p>
                            </div>
                            <div style="display: flex; gap: 10px;">
                                <button class="btn btn-outline" onclick="app.exportData('json')">JSON</button>
                                <button class="btn btn-outline" onclick="app.exportData('csv')">CSV</button>
                                <button class="btn btn-outline" onclick="app.exportData('pdf')">PDF</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    container.className = "";
  }

  async exportData(format = "json") {
    try {
      const links = await linkManager.getAllLinks();

      if (format === "json") {
        const data = {
          links,
          categories: this.categories,
          exportDate: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `credlyst-export-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === "csv") {
        const headers = [
          "Title",
          "URL",
          "Description",
          "Category",
          "Keywords",
          "Favorite",
          "Created At",
        ];
        const csvContent = [
          headers.join(","),
          ...links.map((link) => {
            return [
              `"${(link.title || "").replace(/"/g, '""')}"`,
              `"${(link.url || "").replace(/"/g, '""')}"`,
              `"${(link.description || "").replace(/"/g, '""')}"`,
              `"${(link.category || "").replace(/"/g, '""')}"`,
              `"${(link.keywords || "").replace(/"/g, '""')}"`,
              link.favorite ? "Yes" : "No",
              `"${link.created_at}"`,
            ].join(",");
          }),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `credlyst-export-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Credlyst Links Export", 14, 20);
        let y = 35;
        links.forEach((link, i) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.setFontSize(12);
          doc.text(`${i + 1}. ${link.title || "Untitled"}`, 14, y);
          doc.setFontSize(10);
          doc.text(`URL: ${link.url}`, 14, y + 6);
          doc.text(
            `Category: ${link.category} | Favorite: ${link.favorite ? "Yes" : "No"}`,
            14,
            y + 12,
          );
          y += 24;
        });
        doc.save(
          `credlyst-export-${new Date().toISOString().split("T")[0]}.pdf`,
        );
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data");
    }
  }

  renderLinkCard(link) {
    const description = link.description || "No description provided.";
    const domain = new URL(link.url).hostname;
    const iconInitial = domain.charAt(0).toUpperCase();

    const iconEdit = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
    const iconTrash = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
    const iconCopy = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    const iconExternal = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;

    // Star icon - filled if favorite, outline if not
    const iconStar = link.favorite
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

    return `
            <div class="link-card">
                <div class="card-header">
                    <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" alt="${domain} favicon" class="link-favicon" loading="lazy" decoding="async" onerror="this.src='https://www.google.com/s2/favicons?domain=example.com&sz=64'">
                    <div class="actions">
                        <button class="btn-icon-sm favorite-btn ${link.favorite ? "active" : ""}" onclick="app.toggleFavorite('${link.id}', ${!link.favorite})" title="${link.favorite ? "Remove from favorites" : "Add to favorites"}">
                            ${iconStar}
                        </button>
                        <button class="btn-icon-sm" onclick="window.open('${link.url}', '_blank')" title="Open Link">${iconExternal}</button>
                        <button class="btn-icon-sm" onclick="app.showEditLinkModal('${link.id}')" title="Edit Link">${iconEdit}</button>
                        <button class="btn-icon-sm danger" onclick="app.deleteLink('${link.id}')">${iconTrash}</button>
                    </div>
                </div>
                <h3 class="link-title">${link.title}</h3>
                <p class="link-desc">${description}</p>
                
                <div class="link-tags">
                     <a href="/category/${encodeURIComponent(link.category)}" class="tag" style="text-decoration: none; cursor: pointer;">${link.category}</a>
                </div>
                
                <div class="url-bar">
                    <span class="url-text">${link.url}</span>
                    <button class="btn-copy" onclick="app.copyLink('${link.url}')">${iconCopy}</button>
                </div>
            </div>
        `;
  }

  async showSmartPasteModal() {
    const modalContainer = document.getElementById("modal-container");

    modalContainer.innerHTML = `
        <div class="modal-overlay">
            <div class="modal" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>Smart Paste & Auto-Categorize</h2>
                    <button class="close-modal">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div style="margin-bottom: 1rem;">
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">Paste a block of text containing one or more URLs. We'll automatically extract the URLs, fetch their content, and categorize them using AI.</p>
                </div>
                <form id="smart-paste-form">
                    <div class="form-group">
                        <textarea name="pasteText" required placeholder="Paste text with links here..." rows="6" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--surface); color: var(--text-primary); resize: vertical;"></textarea>
                    </div>
                    <div id="smart-paste-progress" style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem;"></div>
                    <button type="submit" class="btn btn-primary btn-block" id="smart-paste-submit">Extract & Categorize</button>
                </form>
            </div>
        </div>
    `;

    modalContainer.querySelector(".close-modal").onclick = () =>
      (modalContainer.innerHTML = "");

    document.getElementById("smart-paste-form").onsubmit = async (e) => {
      e.preventDefault();
      const text = e.target.pasteText.value;
      const submitBtn = document.getElementById("smart-paste-submit");
      const progressDiv = document.getElementById("smart-paste-progress");

      // Extract URLs using regex
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = text.match(urlRegex) || [];

      if (urls.length === 0) {
        toast.error("No URLs found in the pasted text.");
        return;
      }

      submitBtn.disabled = true;

      let successCount = 0;

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        progressDiv.innerHTML = `Processing ${i + 1} of ${urls.length}: <br/><span style="opacity: 0.7; font-size: 0.8rem;">${url}</span>`;

        try {
          const res = await fetch("/api/parse-link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });

          if (res.ok) {
            const metadata = await res.json();

            // Use the resolved URL if available (e.g. short links like lnkd.in -> linkedin.com/...)
            const finalUrl = metadata.resolvedUrl || url;

            // Add link to database
            await linkManager.addLink({
              title: metadata.title || new URL(finalUrl).hostname,
              url: finalUrl,
              description: metadata.description || "",
              category: metadata.category || "Uncategorized",
              keywords: "[ai_processed]",
            });
            successCount++;
          } else {
            console.error("Failed to parse URL:", url, res.statusText);
            // Fallback to basic link addition if serverless function fails entirely
            await linkManager.addLink({
              title: new URL(url).hostname,
              url: url,
              description: "",
              category: "Uncategorized",
            });
            successCount++;
          }
        } catch (error) {
          console.error("Error processing URL:", url, error);
          try {
            await linkManager.addLink({
              title: new URL(url).hostname,
              url: url,
              description: "",
              category: "Uncategorized",
            });
            successCount++;
          } catch (e) {
            // Ignore if even basic addition fails (e.g. invalid URL)
          }
        }
      }

      progressDiv.innerHTML = "";
      submitBtn.disabled = false;

      if (successCount > 0) {
        toast.success(
          `Successfully extracted and added ${successCount} ${successCount === 1 ? "link" : "links"}!`,
        );
      } else {
        toast.error("Failed to add any links.");
      }

      modalContainer.innerHTML = "";
      await this.loadCategories();
      await this.loadView();
    };
  }

  async autoCategorizeAllLinks() {
    const links = await linkManager.getAllLinks();

    // Find links that haven't been processed by AI
    // We determine this by checking if the keywords field contains '[ai_processed]'
    // Also include any links that are explicitly 'Uncategorized' to catch previous failures
    const unprocessedLinks = links.filter((link) => {
      const hasTag = link.keywords?.includes("[ai_processed]");
      const isUncategorized = link.category === "Uncategorized";
      return !hasTag || isUncategorized;
    });

    if (unprocessedLinks.length === 0) {
      toast.info("All links have already been processed by AI!");
      return;
    }

    if (
      !confirm(
        `Found ${unprocessedLinks.length} unprocessed links. Do you want to process them now with AI? This may take some time.`,
      )
    ) {
      return;
    }

    const modalContainer = document.getElementById("modal-container");
    modalContainer.innerHTML = `
        <div class="modal-overlay">
            <div class="modal" style="max-width: 500px; text-align: center;">
                <h2>✨ AI Bulk Categorization</h2>
                <div style="margin: 2rem 0;">
                    <div class="spinner-small" style="width: 40px; height: 40px; margin: 0 auto 1rem auto; border-width: 4px;"></div>
                    <p id="bulk-progress-text" style="font-size: 1.1rem; color: var(--text-primary);">Processing 1 of ${unprocessedLinks.length}...</p>
                    <p id="bulk-progress-url" style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem; word-break: break-all;"></p>
                </div>
                <div style="width: 100%; background: var(--border-color); height: 8px; border-radius: 4px; overflow: hidden;">
                    <div id="bulk-progress-bar" style="width: 0%; height: 100%; background: var(--primary-color); transition: width 0.3s ease;"></div>
                </div>
            </div>
        </div>
    `;

    let successCount = 0;

    for (let i = 0; i < unprocessedLinks.length; i++) {
      const link = unprocessedLinks[i];

      document.getElementById("bulk-progress-text").textContent =
        `Processing ${i + 1} of ${unprocessedLinks.length}...`;
      document.getElementById("bulk-progress-url").textContent = link.url;
      document.getElementById("bulk-progress-bar").style.width =
        `${(i / unprocessedLinks.length) * 100}%`;

      let success = false;
      let attempts = 0;

      while (!success && attempts < 2) {
        attempts++;
        try {
          const res = await fetch("/api/parse-link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: link.url }),
          });

          if (res.ok) {
            const metadata = await res.json();

            // Keep existing title if AI didn't provide one
            const newTitle = metadata.title || link.title;
            const newDesc = metadata.description || link.description;
            const newCategory = metadata.category || link.category;

            // Append the ai_processed tag to keywords
            let newKeywords = (link.keywords || "").trim();
            if (!newKeywords.includes("[ai_processed]")) {
              newKeywords = newKeywords
                ? `${newKeywords} [ai_processed]`
                : "[ai_processed]";
            }

            await linkManager.updateLink(link.id, {
              ...link,
              title: newTitle,
              description: newDesc,
              category: newCategory,
              keywords: newKeywords,
            });
            successCount++;
            success = true;
          } else {
            if (attempts < 2) {
              document.getElementById("bulk-progress-text").textContent =
                `Rate limit hit. Waiting 20s before retry...`;
              await new Promise((r) => setTimeout(r, 20000));
              document.getElementById("bulk-progress-text").textContent =
                `Processing ${i + 1} of ${unprocessedLinks.length}...`;
            }
          }
        } catch (error) {
          console.error("Failed to auto-categorize link:", link.url, error);
          if (attempts < 2) {
            await new Promise((r) => setTimeout(r, 5000));
          }
        }
      }

      if (!success) {
        toast.error(`Failed to categorize: ${link.url}`);
      }

      // 8-second delay to respect the 6000 Tokens Per Minute limit
      await new Promise((r) => setTimeout(r, 8000));
    }

    modalContainer.innerHTML = "";

    if (successCount > 0) {
      toast.success(
        `Successfully categorized ${successCount} ${successCount === 1 ? "link" : "links"}!`,
      );
      await this.loadCategories();
      await this.loadView();
    } else {
      toast.error("Failed to categorize any links.");
    }
  }

  async showAddLinkModal() {
    // ALWAYS load categories before building dropdown to reflect newly added categories
    await this.loadCategories();

    // Build category dropdown options
    const categoryOptions = this.categories
      .map((cat) => `<option value="${cat.category}">${cat.category}</option>`)
      .join("");

    const modalContainer = document.getElementById("modal-container");
    modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal">
                    <div class="modal-header">
                        <h2>Add New Link</h2>
                        <button class="close-modal">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <form id="add-link-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Title <span class="required">*</span></label>
                                <input type="text" name="title" required placeholder="e.g., My Portfolio">
                            </div>
                            <div class="form-group">
                                <label>Category <span class="required">*</span></label>
                                <select name="category" required>
                                    <option value="">Select a category...</option>
                                    ${categoryOptions}
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label style="display: flex; justify-content: space-between; align-items: center;">
                                <span>URL <span class="required">*</span></span>
                                <button type="button" id="btn-auto-fill" class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; height: auto;">✨ Auto-fill with AI</button>
                            </label>
                            <input type="url" name="url" required placeholder="https://example.com" id="add-link-url">
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea name="desc" placeholder="Brief description..." rows="3" id="add-link-desc"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Add Link</button>
                    </form>
                </div>
            </div>
        `;

    modalContainer.querySelector(".close-modal").onclick = () =>
      (modalContainer.innerHTML = "");

    // Auto-fill logic
    const autoFillBtn = document.getElementById("btn-auto-fill");
    autoFillBtn.onclick = async () => {
      const urlInput = document.getElementById("add-link-url");
      const url = urlInput.value.trim();
      if (!url) {
        toast.error("Please enter a URL first.");
        return;
      }

      const originalText = autoFillBtn.innerHTML;
      autoFillBtn.innerHTML = "Processing...";
      autoFillBtn.disabled = true;

      try {
        const res = await fetch("/api/parse-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (res.ok) {
          const metadata = await res.json();

          // Fill inputs
          const form = document.getElementById("add-link-form");
          if (metadata.title) form.title.value = metadata.title;
          if (metadata.description) form.desc.value = metadata.description;
          if (metadata.resolvedUrl) form.url.value = metadata.resolvedUrl;

          // Try to select category if it exists in dropdown
          if (metadata.category) {
            const categorySelect = form.category;
            const options = Array.from(categorySelect.options);
            const optionExists = options.some(
              (opt) => opt.value === metadata.category,
            );

            if (optionExists) {
              categorySelect.value = metadata.category;
            } else {
              // If it doesn't exist, we could add it dynamically or just let the user pick
              // Let's add it dynamically
              const newOption = new Option(
                metadata.category,
                metadata.category,
              );
              categorySelect.add(newOption);
              categorySelect.value = metadata.category;
            }
          }

          // Add a hidden input to mark this as AI processed
          let aiProcessedInput = form.querySelector(
            'input[name="ai_processed"]',
          );
          if (!aiProcessedInput) {
            aiProcessedInput = document.createElement("input");
            aiProcessedInput.type = "hidden";
            aiProcessedInput.name = "ai_processed";
            form.appendChild(aiProcessedInput);
          }
          aiProcessedInput.value = "true";

          toast.success("Successfully auto-filled from URL");
        } else {
          toast.error("Failed to parse URL metadata.");
        }
      } catch (error) {
        console.error("Auto-fill error:", error);
        toast.error("Failed to auto-fill.");
      } finally {
        autoFillBtn.innerHTML = originalText;
        autoFillBtn.disabled = false;
      }
    };

    document.getElementById("add-link-form").onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      if (!formData.get("category")) {
        alert("Please select a category");
        return;
      }

      const isAiProcessed = formData.get("ai_processed") === "true";

      await linkManager.addLink({
        title: formData.get("title"),
        url: formData.get("url"),
        description: formData.get("desc"),
        category: formData.get("category"),
        keywords: isAiProcessed ? "[ai_processed]" : "",
      });
      modalContainer.innerHTML = "";
      toast.success("Link added successfully!");
      await this.loadCategories();
      await this.loadView();
    };
  }

  async showEditLinkModal(id) {
    // Always refresh categories to ensure we have the latest list
    await this.loadCategories();

    const links = await linkManager.getAllLinks();
    const link = links.find((l) => l.id === id);
    if (!link) return;

    const categoryOptions = this.categories
      .map(
        (cat) =>
          `<option value="${cat.category}" ${link.category === cat.category ? "selected" : ""}>${cat.category}</option>`,
      )
      .join("");

    const modalContainer = document.getElementById("modal-container");
    modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal">
                    <div class="modal-header">
                        <h2>Edit Link</h2>
                        <button class="close-modal">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <form id="edit-link-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Title <span class="required">*</span></label>
                                <input type="text" name="title" required value="${link.title}">
                            </div>
                            <div class="form-group">
                                <label>Category <span class="required">*</span></label>
                                <select name="category" required>
                                    <option value="">Select a category...</option>
                                    ${categoryOptions}
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>URL <span class="required">*</span></label>
                            <input type="url" name="url" required value="${link.url}">
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea name="desc" rows="3">${link.description || ""}</textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Save Changes</button>
                    </form>
                </div>
            </div>
        `;

    modalContainer.querySelector(".close-modal").onclick = () =>
      (modalContainer.innerHTML = "");

    document.getElementById("edit-link-form").onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      if (!formData.get("category")) {
        toast.error("Please select a category");
        return;
      }

      try {
        await linkManager.updateLink(id, {
          ...link,
          title: formData.get("title"),
          url: formData.get("url"),
          description: formData.get("desc"),
          category: formData.get("category"),
        });

        modalContainer.innerHTML = "";
        toast.success("Link updated successfully!");
        await this.loadCategories();
        await this.loadView();
      } catch (error) {
        console.error("Failed to update link:", error);
        toast.error("Failed to update link");
      }
    };
  }

  showConfirmModal(title, message, confirmText = "Delete", type = "danger") {
    return new Promise((resolve) => {
      const modalContainer = document.getElementById("modal-container");
      const btnClass = type === "danger" ? "btn-danger" : "btn-primary";

      modalContainer.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal" style="max-width: 400px;">
                        <div class="modal-header" style="border-bottom: none; margin-bottom: 0.5rem; padding-bottom: 0;">
                            <h2>${title}</h2>
                            <button class="btn-icon close-modal">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div class="modal-body">
                            <p style="color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.5; font-size: 0.95rem;">${message}</p>
                            <div class="modal-footer">
                                <button class="btn btn-outline cancel-btn">Cancel</button>
                                <button class="btn ${btnClass} confirm-btn">${confirmText}</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

      // Focus confirm button for quick action
      const confirmBtn = modalContainer.querySelector(".confirm-btn");
      confirmBtn.focus();

      const close = () => {
        modalContainer.innerHTML = "";
        resolve(false);
      };

      modalContainer.querySelector(".close-modal").onclick = close;
      modalContainer.querySelector(".cancel-btn").onclick = close;

      confirmBtn.onclick = () => {
        modalContainer.innerHTML = "";
        resolve(true);
      };

      // Close on background click
      modalContainer.querySelector(".modal-overlay").onclick = (e) => {
        if (e.target === modalContainer.querySelector(".modal-overlay"))
          close();
      };
    });
  }

  async deleteLink(id) {
    const confirmed = await this.showConfirmModal(
      "Delete Link",
      "Are you sure you want to delete this link? This action cannot be undone.",
    );

    if (!confirmed) return;

    await linkManager.deleteLink(id);
    toast.success("Link deleted successfully!");
    await this.loadCategories();
    await this.loadView();
  }

  async toggleFavorite(id, newFavoriteState) {
    try {
      const links = await linkManager.getAllLinks();
      const link = links.find((l) => l.id === id);
      if (!link) return;

      await linkManager.updateLink(id, {
        ...link,
        favorite: newFavoriteState ? 1 : 0,
      });

      toast.success(
        newFavoriteState ? "Added to favorites!" : "Removed from favorites!",
      );
      await this.loadView();
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  }

  async copyLink(url) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy link");
    }
  }

  showManageCategoriesModal() {
    const modalContainer = document.getElementById("modal-container");

    // Render existing categories
    const categoriesList = this.categories
      .map(
        (cat) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 0.5rem;">
                <div>
                    <strong>${cat.category}</strong>
                    <span style="color: var(--text-tertiary); font-size: 0.85rem; margin-left: 0.5rem;">(${cat.count} links)</span>
                </div>
                <button class="btn-icon-sm danger" onclick="app.deleteCategory('${cat.category}')" style="opacity: 1;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `,
      )
      .join("");

    modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal">
                    <div class="modal-header">
                        <h2>Manage Categories</h2>
                        <button class="btn-icon close-modal">×</button>
                    </div>
                    
                    <div style="margin-bottom: 2rem;">
                        <h3 style="font-size: 1rem; margin-bottom: 1rem; color: var(--text-secondary);">Create New Category</h3>
                        <form id="create-category-form" style="display: flex; gap: 0.75rem;">
                            <input type="text" name="categoryName" required placeholder="Category name..." style="flex: 1; padding: 0.85rem 1rem; border: 1.5px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.95rem;">
                            <button type="submit" class="btn btn-primary">Create</button>
                        </form>
                    </div>

                    <div>
                        <h3 style="font-size: 1rem; margin-bottom: 1rem; color: var(--text-secondary);">Existing Categories</h3>
                        <div id="categories-list-modal">
                            ${categoriesList || '<p style="color: var(--text-tertiary); text-align: center; padding: 2rem;">No categories yet. Create one above!</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;

    modalContainer.querySelector(".close-modal").onclick = () =>
      (modalContainer.innerHTML = "");

    // Handle category creation
    document.getElementById("create-category-form").onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const categoryName = formData.get("categoryName").trim();

      if (!categoryName) return;

      // Check if category already exists
      if (
        this.categories.some(
          (c) => c.category.toLowerCase() === categoryName.toLowerCase(),
        )
      ) {
        alert("This category already exists!");
        return;
      }

      // Create a dummy link with this category to register it
      // (In a real app, you'd have a dedicated categories table)
      // For now, we'll just close and it will appear when a link uses it
      alert(
        `Category "${categoryName}" will be available once you add a link with it.`,
      );
      e.target.reset();

      // Alternative: You could store categories in localStorage as a workaround
      const storedCategories = JSON.parse(
        localStorage.getItem("custom_categories") || "[]",
      );
      if (!storedCategories.includes(categoryName)) {
        storedCategories.push(categoryName);
        localStorage.setItem(
          "custom_categories",
          JSON.stringify(storedCategories),
        );
        await this.loadCategories();
        this.showManageCategoriesModal(); // Refresh modal
      }
    };
  }

  async deleteCategory(categoryName) {
    const confirmed = await this.showConfirmModal(
      "Delete Category",
      `Delete category "${categoryName}"?<br><br>This will move all links in this category to "Uncategorized".`,
    );

    if (!confirmed) return;

    try {
      const links = await linkManager.getAllLinks();
      const linksToUpdate = links.filter((l) => l.category === categoryName);

      for (const link of linksToUpdate) {
        await linkManager.updateLink(link.id, {
          ...link,
          category: "Uncategorized",
        });
      }

      // Remove from localStorage
      const storedCategories = JSON.parse(
        localStorage.getItem("custom_categories") || "[]",
      );
      const updated = storedCategories.filter((c) => c !== categoryName);
      localStorage.setItem("custom_categories", JSON.stringify(updated));

      await this.loadCategories();

      // Check if we're on categories page or manage modal
      if (this.currentView === "categories-page") {
        this.renderCategoriesPage();
      } else if (this.currentView === "category:" + categoryName) {
        this.router.navigate("/categories");
      } else {
        this.showManageCategoriesModal();
      }

      await this.loadView();
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category. Please try again.");
    }
  }
}

// Helper to generate consistent colors from strings
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}

const app = new App();
window.app = app;
export default App;
