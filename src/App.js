import linkManager from './services/linkManager.js';
import searchEngine from './services/searchEngine.js';
import authService from './services/authService.js';
import toast from './utils/toast.js';

class App {
    constructor() {
        this.currentPage = 'landing';
        this.currentView = 'all'; // all, favorites, recent, or category:{name}
        this.theme = localStorage.getItem('theme') || 'light';
        this.user = authService.currentUser || { name: 'Sarah D.', plan: 'Free Plan' };
        this.categories = [];
    }

    async init() {
        try {
            await authService.initPromise;
            
            if (authService.isAuthenticated) {
                this.currentPage = 'dashboard';
                this.user = authService.getCurrentUser();
            }

            this.applyTheme();
            this.render();
            this.hideLoading();
            this.setupEventListeners();

        } catch (error) {
            console.error('App init failed:', error);
            this.renderError(error);
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.opacity = '0';
        setTimeout(() => loading?.remove(), 300);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
    }

    render() {
        const app = document.getElementById('app');
        
        switch (this.currentPage) {
            case 'landing':
                app.innerHTML = this.renderLandingPage();
                break;
            case 'login':
                app.innerHTML = this.renderLoginPage();
                break;
            case 'signup':
                app.innerHTML = this.renderSignupPage();
                break;
            case 'dashboard':
                app.innerHTML = this.renderDashboard();
                break;
        }

        this.setupDynamicListeners();
    }

    // --- VIEW RENDERERS ---

    renderLandingPage() {
        return `
            <div class="landing-page">
                <!-- Header -->
                <header class="landing-header">
                    <div class="header-container">
                        <div class="header-left">
                            <img src="/logo.png" alt="Credlyst" class="header-logo">
                            <span class="header-brand">Credlyst</span>
                        </div>
                        <div class="header-right">
                            <button class="btn-signin" data-action="nav-login">Sign In</button>
                            <button class="btn-getstarted" data-action="nav-signup">Get Started</button>
                        </div>
                    </div>
                </header>

                <!-- Hero Section -->
                <header class="hero-section">
                    <div class="container hero-container">
                        <div class="hero-brand-pill">
                            <div class="icon-circle"><img src="/logo.png" style="width: 16px;"></div>
                            <div class="pill-text"><strong>Credlyst</strong> <span class="divider">|</span> Your Personal Link Vault</div>
                        </div>
                        
                        <h1 class="hero-title">Save, search, and manage your links effortlessly</h1>
                        <p class="hero-subtitle">A focused link management platform for job seekers, developers, and anyone who needs fast access to URLs. Use it on the web or from your browser extension.</p>
                        
                        <div class="hero-cta-group">
                            <button class="btn btn-primary btn-lg icon-btn" data-action="nav-signup">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 9.5V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-5.5"/><path d="M2.5 14.5l6-6"/><path d="M14.5 8.5l-6 6"/></svg>
                                Start Organizing
                            </button>
                            <button class="btn btn-white btn-lg icon-btn" data-action="nav-signup">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                Create Account
                            </button>
                            <button class="btn btn-white btn-lg icon-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                Take a Tour
                            </button>
                        </div>
                    </div>
                </header>

                <!-- Features Grid -->
                <section class="features-section">
                    <div class="container">
                        <div class="features-grid">
                            <!-- Card 1 -->
                            <div class="feature-card">
                                <div class="card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg></div>
                                <h3>Link Management</h3>
                                <p>Organize by title and URL, search instantly, and keep your most-used links at your fingertips.</p>
                                <div class="card-tags">
                                    <span class="tag">Add</span><span class="tag">Edit</span><span class="tag">Delete</span><span class="tag">Copy</span>
                                </div>
                            </div>
                            <!-- Card 2 -->
                            <div class="feature-card">
                                <div class="card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
                                <h3>Secure & Private</h3>
                                <p>Your data stays yours. Strong access controls and private-by-default storage.</p>
                                <div class="card-tags">
                                    <span class="tag">Privacy</span><span class="tag">Encrypted</span><span class="tag">Control</span>
                                </div>
                            </div>
                            <!-- Card 3 -->
                            <div class="feature-card">
                                <div class="card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>
                                <h3>Lightning Fast</h3>
                                <p>Snappy search and instant actions so you never lose your flow.</p>
                                <div class="card-tags">
                                    <span class="tag">Instant search</span><span class="tag">Quick actions</span><span class="tag">Extension</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Testimonial Section -->
                <section class="testimonial-section">
                    <div class="container split-layout">
                        <div class="testimonial-text">
                            <div class="badge-pill-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Loved by busy people</div>
                            <h2>"Credlyst keeps my interview prep links and docs one click away."</h2>
                            <p>Designed for speed and clarity—whether you're preparing for interviews, coding, or managing research. Real-time feedback with toasts for every action.</p>
                            <div class="toast-tags">
                                <span class="toast-tag success"><span class="dot green"></span> Toast: Success</span>
                                <span class="toast-tag error"><span class="dot red"></span> Toast: Error</span>
                                <span class="toast-tag info"><span class="dot blue"></span> Toast: Info</span>
                            </div>
                        </div>
                        <div class="testimonial-card-wrapper">
                            <div class="testimonial-card">
                                <div class="profile-header">
                                    <div class="profile-img">
                                        <img src="https://ui-avatars.com/api/?name=Aishwarya+N&background=0D8ABC&color=fff&size=64" alt="Profile">
                                    </div>
                                    <div class="profile-info">
                                        <h4>Aishwarya N.</h4>
                                        <span>Frontend Engineer</span>
                                    </div>
                                </div>
                                <p class="quote">"Search is instant, the extension is a lifesaver."</p>
                            </div>
                        </div>
                    </div>
                </section>

                <footer class="simple-footer">
                    <div class="container">
                        <div class="footer-dot"></div>
                        <span>Built by Creator</span>
                    </div>
                </footer>
            </div>
        `;
    }

    renderLoginPage() {
        return `
            <div class="auth-page">
                <div class="auth-card">

                    <div class="auth-header">
                        <h2>Welcome back</h2>
                        <p>Please enter your details to sign in.</p>
                    </div>
                    <form id="login-form">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" required placeholder="name@company.com" value="demo@credlyst.com">
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" name="password" required placeholder="••••••••" value="password123">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Sign in</button>
                    </form>
                    <div class="auth-footer">
                        <span class="btn-link" data-action="nav-signup">Don't have an account? Sign up</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderSignupPage() {
        return `
            <div class="auth-page">
                <div class="auth-card">
                    <div class="auth-header">
                        <h2>Create an account</h2>
                        <p>Start organizing your links today.</p>
                    </div>
                    <form id="signup-form">
                         <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" name="name" required placeholder="Sarah Doe">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" required placeholder="name@company.com">
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" name="password" required placeholder="••••••••">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Create account</button>
                    </form>
                    <div class="auth-footer">
                        <span class="btn-link" data-action="nav-login">Already have an account? Log in</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderDashboard() {
        // SVG Icons
        const iconDashboard = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`;
        const iconHeart = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
        const iconClock = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
        const iconSettings = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
        const iconSearch = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
        const iconMenu = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
        const iconPlus = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
        const iconUser = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
        const iconCategory = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>`;

        // Dynamic categories list
        const categoriesHTML = this.categories.map(cat => `
            <a href="#" class="nav-item tag-item" data-category="${cat.category}">
                <span>#</span> ${cat.category} <small>(${cat.count})</small>
            </a>
        `).join('');

        return `
            <div class="dashboard-wrapper">
                <!-- SIDEBAR -->
                <aside class="sidebar" id="sidebar">
                    <div class="sidebar-top">
                        <div class="logo-area">
                            <img src="/logo.png" alt="Credlyst Logo" class="logo-image">
                            <span class="logo-text">Credlyst</span>
                        </div>
                        
                        <nav class="nav-menu">
                            <a href="#" class="nav-item ${this.currentView === 'all' ? 'active' : ''}" data-view="all">
                                ${iconDashboard}
                                <span>All Links</span>
                            </a>
                            <a href="#" class="nav-item ${this.currentView === 'favorites' ? 'active' : ''}" data-view="favorites">
                                ${iconHeart}
                                <span>Favorites</span>
                            </a>
                            <a href="#" class="nav-item ${this.currentView === 'recent' ? 'active' : ''}" data-view="recent">
                                ${iconClock}
                                <span>Recent</span>
                            </a>
                            <a href="#" class="nav-item ${this.currentView === 'categories-page' ? 'active' : ''}" data-view="categories-page">
                                ${iconCategory}
                                <span>Categories</span>
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
                        <div class="mobile-logo-left">
                            <img src="/logo.png" alt="Credlyst" class="mobile-app-logo">
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
                        <button class="btn btn-primary" id="add-link-btn">+ Add New Link</button>
                    </header>

                    <div class="content-scroll">
                        <div class="section-header">
                            <h2 id="view-title">All Links <span class="count-badge" id="total-count">...</span></h2>
                        </div>
                        
                        <div id="links-grid" class="cards-grid">
                            <div class="loading-state">Loading links...</div>
                        </div>
                    </div>
                </main>

                <!-- MOBILE BOTTOM NAVIGATION -->
                <nav class="mobile-nav">
                    <div class="mobile-nav-items">
                        <a href="#" class="mobile-nav-item ${this.currentView === 'all' ? 'active' : ''}" data-view="all">
                            ${iconDashboard}
                            <span>All</span>
                        </a>
                        <a href="#" class="mobile-nav-item ${this.currentView === 'favorites' ? 'active' : ''}" data-view="favorites">
                            ${iconHeart}
                            <span>Favorites</span>
                        </a>
                        <a href="#" class="mobile-nav-item ${this.currentView === 'categories-page' ? 'active' : ''}" data-view="categories-page">
                            ${iconCategory}
                            <span>Categories</span>
                        </a>
                        <a href="#" class="mobile-nav-item ${this.currentView === 'recent' ? 'active' : ''}" data-view="recent">
                            ${iconClock}
                            <span>Recent</span>
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
         document.getElementById('loading').innerHTML = `
            <div style="text-align:center; padding:2rem">
                <h2>Error</h2><p>${error.message}</p>
                <button onclick="location.reload()">Reload</button>
            </div>`;
    }

    // --- EVENT LISTENERS ---

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (action === 'nav-login') {
                this.currentPage = 'login';
                this.render();
            }
            if (action === 'nav-signup') {
                this.currentPage = 'signup';
                this.render();
            }
        });
    }

    setupDynamicListeners() {
        // Landing & Auth
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
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
                    
                    await authService.login(e.target.email.value, e.target.password.value);
                    this.user = authService.getCurrentUser();
                    
                    // Show success toast
                    toast.success('Welcome back! Redirecting to dashboard...');
                    
                    // Redirect to dashboard after short delay
                    setTimeout(() => {
                        this.currentPage = 'dashboard';
                        this.render();
                    }, 800);
                } catch (error) {
                    // Show error toast
                    toast.error(error.message || 'Login failed. Please try again.');
                    
                    // Reset button
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            });
        }

        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
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
                    
                    await authService.signup(e.target.name.value, e.target.email.value, e.target.password.value);
                    this.user = authService.getCurrentUser();
                    
                    // Show success toast
                    toast.success('Account created successfully! Redirecting...');
                    
                    // Redirect to dashboard after short delay
                    setTimeout(() => {
                        this.currentPage = 'dashboard';
                        this.render();
                    }, 800);
                } catch (error) {
                    // Show error toast
                    toast.error(error.message || 'Signup failed. Please try again.');
                    
                    // Reset button
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            });
        }

        // Dashboard
        if (this.currentPage === 'dashboard') {
            this.hydrateDashboard();
            
            // Logout
            document.getElementById('logout-btn')?.addEventListener('click', () => {
                authService.logout();
            });
            
            // Add Link (Desktop)
            document.getElementById('add-link-btn')?.addEventListener('click', () => this.showAddLinkModal());
            
            // Mobile FAB
            document.getElementById('mobile-add-btn')?.addEventListener('click', () => this.showAddLinkModal());
            
            // Mobile Profile Dropdown Toggle
            const mobileProfileToggle = document.getElementById('mobile-profile-toggle');
            const mobileProfileDropdown = document.getElementById('mobile-profile-dropdown');
            const profileOverlay = document.getElementById('profile-overlay');
            
            if (mobileProfileToggle && mobileProfileDropdown && profileOverlay) {
                const toggleDropdown = () => {
                    mobileProfileDropdown.classList.toggle('hidden');
                    profileOverlay.classList.toggle('hidden');
                };
                
                mobileProfileToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleDropdown();
                });
                
                profileOverlay.addEventListener('click', toggleDropdown);
                
                // Close when clicking outside (fallback)
                document.addEventListener('click', (e) => {
                    if (!mobileProfileDropdown.classList.contains('hidden') && 
                        !mobileProfileDropdown.contains(e.target) && 
                        !mobileProfileToggle.contains(e.target)) {
                        toggleDropdown();
                    }
                });
            }
            
            // Mobile Logout
            document.getElementById('mobile-logout-btn')?.addEventListener('click', () => {
                authService.logout();
            });
            
            // Search
            const searchInput = document.getElementById('global-search');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.handleSearch(e.target.value);
                });
            }

            // Navigation items (All/Favorites/Recent) - works for both desktop and mobile
            document.querySelectorAll('[data-view]').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.currentView = e.currentTarget.dataset.view;
                    this.loadView();
                    
                    // Update active states
                    document.querySelectorAll('[data-view]').forEach(el => el.classList.remove('active'));
                    document.querySelectorAll(`[data-view="${this.currentView}"]`).forEach(el => el.classList.add('active'));
                });
            });

            // Category filter
            document.querySelectorAll('[data-category]').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.currentView = 'category:' + e.currentTarget.dataset.category;
                    this.loadView();
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

    async loadCategories() {
        try {
            let dbCategories = [];
            
            // Fetch from Supabase
            try {
                dbCategories = await linkManager.getCategories();
            } catch (err) {
                console.warn('Failed to fetch categories from Supabase:', err);
            }
            
            // Get custom categories from localStorage
            const customCategories = JSON.parse(localStorage.getItem('custom_categories') || '[]');
            
            // Remove duplicates from localStorage
            const uniqueCustomCategories = [...new Set(customCategories)];
            if (uniqueCustomCategories.length !== customCategories.length) {
                localStorage.setItem('custom_categories', JSON.stringify(uniqueCustomCategories));
            }
            
            // Merge: add custom categories that don't exist in DB yet
            const mergedCategories = [...dbCategories];
            uniqueCustomCategories.forEach(customCat => {
                if (!mergedCategories.some(c => c.category === customCat)) {
                    mergedCategories.push({ category: customCat, count: 0 });
                }
            });
            
            this.categories = mergedCategories;
            
            // Update sidebar if already rendered
            const categoriesList = document.getElementById('categories-list');
            if (categoriesList) {
                const categoriesHTML = this.categories.map(cat => `
                    <a href="#" class="nav-item tag-item" data-category="${cat.category}">
                        <span>#</span> ${cat.category} <small>(${cat.count})</small>
                    </a>
                `).join('');
                categoriesList.innerHTML = categoriesHTML || '<p style="padding: 0 1rem; color: var(--text-tertiary); font-size: 0.85rem;">No categories yet</p>';
                
                // Re-attach listeners
                document.querySelectorAll('[data-category]').forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.currentView = 'category:' + e.currentTarget.dataset.category;
                        this.loadView();
                    });
                });
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    async loadView() {
        let links = [];
        let title = 'All Links';

        try {
            if (this.currentView === 'all') {
                links = await linkManager.getAllLinks();
                title = 'All Links';
                this.renderLinksList(links);
            } else if (this.currentView === 'favorites') {
                links = await searchEngine.getFavorites();
                title = 'Favorites';
                this.renderLinksList(links);
            } else if (this.currentView === 'recent') {
                links = await linkManager.getAllLinks();
                links = links.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 20);
                title = 'Recent';
                this.renderLinksList(links);
            } else if (this.currentView === 'categories-page') {
                title = 'Categories';
                this.renderCategoriesPage();
                return;
            } else if (this.currentView === 'settings') {
                title = 'Settings';
                this.renderSettingsPage();
                return;
            } else if (this.currentView.startsWith('category:')) {
                const category = this.currentView.replace('category:', '');
                links = await searchEngine.searchByCategory(category);
                title = `# ${category}`;
                this.renderLinksList(links);
            }

            document.getElementById('view-title').innerHTML = `${title} <span class="count-badge">(${links.length})</span>`;

            // Update active state in sidebar
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            const activeItem = document.querySelector(`[data-view="${this.currentView}"]`) || 
                              document.querySelector(`[data-category="${this.currentView.replace('category:', '')}"]`);
            if (activeItem) activeItem.classList.add('active');

        } catch (error) {
            console.error('Failed to load view:', error);
            this.renderLinksList([]);
        }
    }
    
    handleSearch(query) {
        if (!query.trim()) {
            this.loadView();
            return;
        }
        searchEngine.search(query).then(results => {
             document.getElementById('view-title').innerHTML = `Search Results <span class="count-badge">(${results.length})</span>`;
             this.renderLinksList(results);
        });
    }

    renderLinksList(links) {
        const container = document.getElementById('links-grid');
        if (!container) return;

        if (links.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>No links found.</p></div>`;
            return;
        }
        
        container.innerHTML = links.map(link => this.renderLinkCard(link)).join('');
    }

    renderCategoriesPage() {
        const container = document.getElementById('links-grid');
        if (!container) return;

        // Update title
        document.getElementById('view-title').innerHTML = `Categories <span class="count-badge">(${this.categories.length})</span>`;

        // Render categories grid
        const categoriesHTML = this.categories.map(cat => `
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
                <p class="category-count">${cat.count} ${cat.count === 1 ? 'link' : 'links'}</p>
                <button class="btn btn-outline btn-block" onclick="app.viewCategory('${cat.category}')" style="margin-top: 1rem; font-size: 0.9rem; padding: 0.6rem 1rem;">
                    View Links
                </button>
            </div>
        `).join('');

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
        container.className = 'cards-grid'; // Use same grid
    }

    getCategoryColor(name) {
        const colors = ['#2563EB', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#16a34a', '#0891b2'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    getCategoryColorDark(name) {
        const colors = ['#1d4ed8', '#6d28d9', '#be185d', '#b91c1c', '#c2410c', '#15803d', '#0e7490'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    viewCategory(categoryName) {
        this.currentView = 'category:' + categoryName;
        this.loadView();
    }

    showCreateCategoryInline() {
        const modalContainer = document.getElementById('modal-container');
        
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
        
        modalContainer.querySelector('.close-modal').onclick = () => modalContainer.innerHTML = '';
        
        document.getElementById('create-category-inline-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const categoryName = formData.get('categoryName').trim();
            
            console.log('Creating category:', categoryName);
            
            if (!categoryName) return;
            
            // Check if exists
            if (this.categories.some(c => c.category.toLowerCase() === categoryName.toLowerCase())) {
                // Show error in modal
                const errorContainer = document.getElementById('error-message');
                errorContainer.innerHTML = `
                    <div style="background: #fee2e2; color: #dc2626; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem;">
                        This category already exists!
                    </div>
                `;
                setTimeout(() => errorContainer.innerHTML = '', 3000);
                return;
            }
            
            try {
                // Add to localStorage
                const storedCategories = JSON.parse(localStorage.getItem('custom_categories') || '[]');
                storedCategories.push(categoryName);
                localStorage.setItem('custom_categories', JSON.stringify(storedCategories));
                
                console.log('Category saved to localStorage:', storedCategories);
                
                // Close modal
                modalContainer.innerHTML = '';
                
                toast.success(`Category "${categoryName}" created successfully!`);
                
                // Reload categories and refresh page
                await this.loadCategories();
                this.renderCategoriesPage();
                
                console.log('Categories page refreshed');
            } catch (error) {
                console.error('Error creating category:', error);
                const errorContainer = document.getElementById('error-message');
                errorContainer.innerHTML = `
                    <div style="background: #fee2e2; color: #dc2626; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem;">
                        Failed to create category. Please try again.
                    </div>
                `;
            }
        };
    }

    renderSettingsPage() {
        const container = document.getElementById('links-grid');
        if (!container) return;

        // Update title
        document.getElementById('view-title').innerHTML = `Settings`;

        container.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto;">
                <!-- Profile Settings -->
                <div class="settings-section">
                    <h3 class="settings-title">Profile Information</h3>
                    <div class="settings-card">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" value="${this.user.name}" readonly style="background: var(--color-slate-50);">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" value="${this.user.email || 'demo@credlyst.com'}" readonly style="background: var(--color-slate-50);">
                        </div>
                        <div class="form-group">
                            <label>Plan</label>
                            <input type="text" value="Free Plan" readonly style="background: var(--color-slate-50);">
                        </div>
                    </div>
                </div>

                <!-- Preferences -->
                <div class="settings-section">
                    <h3 class="settings-title">Preferences</h3>
                    <div class="settings-card">
                        <div class="setting-item">
                            <div>
                                <strong>Theme</strong>
                                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem;">Choose your preferred color scheme</p>
                            </div>
                            <select style="width: auto; min-width: 150px;">
                                <option value="light" selected>Light</option>
                                <option value="dark">Dark</option>
                                <option value="auto">Auto</option>
                            </select>
                        </div>
                        <div class="setting-item">
                            <div>
                                <strong>Default View</strong>
                                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem;">Page to show when you open the app</p>
                            </div>
                            <select style="width: auto; min-width: 150px;">
                                <option value="all" selected>All Links</option>
                                <option value="favorites">Favorites</option>
                                <option value="recent">Recent</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Data Management -->
                <div class="settings-section">
                    <h3 class="settings-title">Data Management</h3>
                    <div class="settings-card">
                        <div class="setting-item">
                            <div>
                                <strong>Export Data</strong>
                                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem;">Download all your links as JSON</p>
                            </div>
                            <button class="btn btn-outline" onclick="app.exportData()">Export</button>
                        </div>
                        <div class="setting-item">
                            <div>
                                <strong>Clear All Data</strong>
                                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem;">Permanently delete all links and categories</p>
                            </div>
                            <button class="btn btn-outline" style="color: #dc2626; border-color: #dc2626;" onclick="app.clearAllData()">Clear Data</button>
                        </div>
                    </div>
                </div>

                <!-- About -->
                <div class="settings-section">
                    <h3 class="settings-title">About</h3>
                    <div class="settings-card">
                        <div style="text-align: center; padding: 2rem;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">🔗</div>
                            <h2 style="margin-bottom: 0.5rem;">Credlyst</h2>
                            <p style="color: var(--text-secondary); margin-bottom: 1rem;">Version 1.0.0</p>
                            <p style="color: var(--text-secondary); font-size: 0.95rem;">A beautiful, privacy-focused link management tool</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.className = ''; // Remove grid class
    }

    async exportData() {
        try {
            const links = await linkManager.getAllLinks();
            const data = {
                links,
                categories: this.categories,
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `credlyst-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data');
        }
    }

    async clearAllData() {

        const confirmed = await this.showConfirmModal(
            'Clear All Data', 
            'Are you sure you want to delete ALL your links and categories?<br><br><b>This action cannot be undone and will permanently delete everything.</b>',
            'Delete Everything'
        );
        
        if (!confirmed) return;
        
        try {
            const links = await linkManager.getAllLinks();
            for (const link of links) {
                await linkManager.deleteLink(link.id);
            }
            
            localStorage.removeItem('custom_categories');
            
            await this.loadCategories();
            this.currentView = 'all';
            this.loadView();
            
            alert('All data has been cleared successfully.');
        } catch (error) {
            console.error('Clear data failed:', error);
            alert('Failed to clear data');
        }
    }


    renderLinkCard(link) {
        const description = link.description || 'No description provided.';
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
                    <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" alt="${domain}" class="link-favicon" onerror="this.src='https://www.google.com/s2/favicons?domain=example.com&sz=64'">
                    <div class="actions">
                        <button class="btn-icon-sm favorite-btn ${link.favorite ? 'active' : ''}" onclick="app.toggleFavorite(${link.id}, ${!link.favorite})" title="${link.favorite ? 'Remove from favorites' : 'Add to favorites'}">
                            ${iconStar}
                        </button>
                        <button class="btn-icon-sm" onclick="window.open('${link.url}', '_blank')" title="Open Link">${iconExternal}</button>
                        <button class="btn-icon-sm" onclick="app.showEditLinkModal(${link.id})" title="Edit Link">${iconEdit}</button>
                        <button class="btn-icon-sm danger" onclick="app.deleteLink(${link.id})">${iconTrash}</button>
                    </div>
                </div>
                <h3 class="link-title">${link.title}</h3>
                <p class="link-desc">${description}</p>
                
                <div class="link-tags">
                     <span class="tag">${link.category}</span>
                </div>
                
                <div class="url-bar">
                    <span class="url-text">${link.url}</span>
                    <button class="btn-copy" onclick="app.copyLink('${link.url}')">${iconCopy}</button>
                </div>
            </div>
        `;
    }
    
    async showAddLinkModal() {
        // Build category dropdown options
        const categoryOptions = this.categories.map(cat => 
            `<option value="${cat.category}">${cat.category}</option>`
        ).join('');

        const modalContainer = document.getElementById('modal-container');
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
                            <label>URL <span class="required">*</span></label>
                            <input type="url" name="url" required placeholder="https://example.com">
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea name="desc" placeholder="Brief description..." rows="3"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Add Link</button>
                    </form>
                </div>
            </div>
        `;
        
        modalContainer.querySelector('.close-modal').onclick = () => modalContainer.innerHTML = '';
        
        document.getElementById('add-link-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            if (!formData.get('category')) {
                alert('Please select a category');
                return;
            }
            
            await linkManager.addLink({
                title: formData.get('title'),
                url: formData.get('url'),
                description: formData.get('desc'),
                category: formData.get('category'),
            });
            modalContainer.innerHTML = '';
            toast.success('Link added successfully!');
            await this.loadCategories();
            await this.loadView();
        };
    }

    async showEditLinkModal(id) {
        // Always refresh categories to ensure we have the latest list
        await this.loadCategories();
        console.log('Categories loaded for edit:', this.categories);

        const links = await linkManager.getAllLinks();
        const link = links.find(l => l.id === id);
        if (!link) return;

        const categoryOptions = this.categories.map(cat => 
            `<option value="${cat.category}" ${link.category === cat.category ? 'selected' : ''}>${cat.category}</option>`
        ).join('');

        const modalContainer = document.getElementById('modal-container');
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
                            <textarea name="desc" rows="3">${link.description || ''}</textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Save Changes</button>
                    </form>
                </div>
            </div>
        `;
        
        modalContainer.querySelector('.close-modal').onclick = () => modalContainer.innerHTML = '';
        
        document.getElementById('edit-link-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
             if (!formData.get('category')) {
                toast.error('Please select a category');
                return;
            }

            try {
                await linkManager.updateLink(id, {
                    ...link,
                    title: formData.get('title'),
                    url: formData.get('url'),
                    description: formData.get('desc'),
                     category: formData.get('category')
                });
                
                modalContainer.innerHTML = '';
                toast.success('Link updated successfully!');
                await this.loadCategories(); 
                await this.loadView();
            } catch (error) {
                console.error('Failed to update link:', error);
                toast.error('Failed to update link');
            }
        };
    }

    showConfirmModal(title, message, confirmText = 'Delete', type = 'danger') {
        return new Promise((resolve) => {
            const modalContainer = document.getElementById('modal-container');
            const btnClass = type === 'danger' ? 'btn-danger' : 'btn-primary';
            
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
            const confirmBtn = modalContainer.querySelector('.confirm-btn');
            confirmBtn.focus();

            const close = () => {
                modalContainer.innerHTML = '';
                resolve(false);
            };

            modalContainer.querySelector('.close-modal').onclick = close;
            modalContainer.querySelector('.cancel-btn').onclick = close;
            
            confirmBtn.onclick = () => {
                modalContainer.innerHTML = '';
                resolve(true);
            };
            
            // Close on background click
            modalContainer.querySelector('.modal-overlay').onclick = (e) => {
                if (e.target === modalContainer.querySelector('.modal-overlay')) close();
            };
        });
    }

    async deleteLink(id) {
        const confirmed = await this.showConfirmModal(
            'Delete Link', 
            'Are you sure you want to delete this link? This action cannot be undone.'
        );
        
        if (!confirmed) return;
        
        await linkManager.deleteLink(id);
        toast.success('Link deleted successfully!');
        await this.loadCategories();
        await this.loadView();
    }

    async toggleFavorite(id, newFavoriteState) {
        try {
            const links = await linkManager.getAllLinks();
            const link = links.find(l => l.id === id);
            if (!link) return;

            await linkManager.updateLink(id, {
                ...link,
                favorite: newFavoriteState ? 1 : 0
            });

            toast.success(newFavoriteState ? 'Added to favorites!' : 'Removed from favorites!');
            await this.loadView();
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    }

    async copyLink(url) {
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('Failed to copy link');
        }
    }

    showManageCategoriesModal() {
        const modalContainer = document.getElementById('modal-container');
        
        // Render existing categories
        const categoriesList = this.categories.map(cat => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 0.5rem;">
                <div>
                    <strong>${cat.category}</strong>
                    <span style="color: var(--text-tertiary); font-size: 0.85rem; margin-left: 0.5rem;">(${cat.count} links)</span>
                </div>
                <button class="btn-icon-sm danger" onclick="app.deleteCategory('${cat.category}')" style="opacity: 1;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `).join('');

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
        
        modalContainer.querySelector('.close-modal').onclick = () => modalContainer.innerHTML = '';
        
        // Handle category creation
        document.getElementById('create-category-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const categoryName = formData.get('categoryName').trim();
            
            if (!categoryName) return;
            
            // Check if category already exists
            if (this.categories.some(c => c.category.toLowerCase() === categoryName.toLowerCase())) {
                alert('This category already exists!');
                return;
            }
            
            // Create a dummy link with this category to register it
            // (In a real app, you'd have a dedicated categories table)
            // For now, we'll just close and it will appear when a link uses it
            alert(`Category "${categoryName}" will be available once you add a link with it.`);
            e.target.reset();
            
            // Alternative: You could store categories in localStorage as a workaround
            const storedCategories = JSON.parse(localStorage.getItem('custom_categories') || '[]');
            if (!storedCategories.includes(categoryName)) {
                storedCategories.push(categoryName);
                localStorage.setItem('custom_categories', JSON.stringify(storedCategories));
                await this.loadCategories();
                this.showManageCategoriesModal(); // Refresh modal
            }
        };
    }

    async deleteCategory(categoryName) {

        const confirmed = await this.showConfirmModal(
            'Delete Category', 
            `Delete category "${categoryName}"?<br><br>This will move all links in this category to "Uncategorized".`
        );
        
        if (!confirmed) return;
        
        try {
            const links = await linkManager.getAllLinks();
            const linksToUpdate = links.filter(l => l.category === categoryName);
            
            for (const link of linksToUpdate) {
                await linkManager.updateLink(link.id, {
                    ...link,
                    category: 'Uncategorized'
                });
            }
            
            // Remove from localStorage
            const storedCategories = JSON.parse(localStorage.getItem('custom_categories') || '[]');
            const updated = storedCategories.filter(c => c !== categoryName);
            localStorage.setItem('custom_categories', JSON.stringify(updated));
            
            await this.loadCategories();
            
            // Check if we're on categories page or manage modal
            if (this.currentView === 'categories-page') {
                this.renderCategoriesPage();
            } else {
                this.showManageCategoriesModal();
            }
            
            await this.loadView();
        } catch (error) {
            console.error('Failed to delete category:', error);
            alert('Failed to delete category. Please try again.');
        }
    }
}

// Helper to generate consistent colors from strings
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}

const app = new App();
window.app = app;
export default App;
