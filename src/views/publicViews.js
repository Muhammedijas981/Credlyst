/**
 * Public static page templates for Credlyst.
 * Used by both client-side App.js rendering and build-time zero-dependency prerendering.
 */

export function renderLandingPage() {
  return `
            <div class="landing-page">
                <!-- Header -->
                <header class="landing-header">
                    <div class="header-container">
                        <div class="header-left" style="cursor: pointer;" onclick="app.router.navigate('/')">
                            <img src="/logo.png" alt="Credlyst logo" class="header-logo" decoding="async">
                            <span class="header-brand">Credlyst</span>
                        </div>
                        <div class="header-right">
                            <a href="/login" class="btn-signin" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center;">Sign In</a>
                            <a href="/signup" class="btn-getstarted" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center;">Get Started</a>
                        </div>
                    </div>
                </header>

                <!-- Hero Section -->
                <header class="hero-section">
                    <div class="container hero-container">
                        <div class="hero-brand-pill">
                            <div class="icon-circle"><img src="/logo.png" alt="Credlyst icon" style="width: 16px;" decoding="async"></div>
                            <div class="pill-text"><strong>Credlyst</strong> <span class="divider">|</span> Your Personal Link Vault</div>
                        </div>
                        
                        <h1 class="hero-title">Save, search, and manage your links effortlessly</h1>
                        <p class="hero-subtitle">A focused link management platform for job seekers, developers, and anyone who needs fast access to URLs. Use it on the web or from your browser extension.</p>
                        
                        <div class="hero-cta-group">
                            <a href="/signup" class="btn btn-primary btn-lg icon-btn" style="text-decoration: none;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 9.5V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-5.5"/><path d="M2.5 14.5l6-6"/><path d="M14.5 8.5l-6 6"/></svg>
                                Start Organizing
                            </a>
                            <a href="/signup" class="btn btn-white btn-lg icon-btn" style="text-decoration: none;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                Create Account
                            </a>
                            <button class="btn btn-white btn-lg icon-btn" onclick="document.querySelector('.features-section')?.scrollIntoView({ behavior: 'smooth' })">
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
                                <h2>Link Management</h2>
                                <p>Organize by title and URL, search instantly, and keep your most-used links at your fingertips.</p>
                                <div class="card-tags">
                                    <span class="tag">Add</span><span class="tag">Edit</span><span class="tag">Delete</span><span class="tag">Copy</span>
                                </div>
                            </div>
                            <!-- Card 2 -->
                            <div class="feature-card">
                                <div class="card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
                                <h2>Secure & Private</h2>
                                <p>Your data stays yours. Strong access controls and private-by-default storage.</p>
                                <div class="card-tags">
                                    <span class="tag">Privacy</span><span class="tag">Encrypted</span><span class="tag">Control</span>
                                </div>
                            </div>
                            <!-- Card 3 -->
                            <div class="feature-card">
                                <div class="card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>
                                <h2>Lightning Fast</h2>
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
                                        <img src="https://ui-avatars.com/api/?name=Aishwarya+N&background=0D8ABC&color=fff&size=64" alt="Aishwarya N. avatar" loading="lazy" decoding="async">
                                    </div>
                                    <div class="profile-info">
                                        <h3>Aishwarya N.</h3>
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

export function renderLoginPage() {
  return `
            <div class="auth-page">
                <div class="auth-card">
                    <div class="auth-header" style="text-align: center;">
                        <img src="/logo.png" alt="Credlyst logo" style="width: 48px; height: 48px; margin-bottom: 1rem; cursor: pointer;" onclick="app.router.navigate('/')" decoding="async">
                        <h1 class="auth-title">Welcome back</h1>
                        <p>Please enter your details to sign in.</p>
                    </div>
                    <form id="login-form">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" required placeholder="name@company.com">
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <div class="password-wrapper">
    <input type="password" name="password" required placeholder="••••••••">
    <button type="button" class="btn-toggle-password" data-action="toggle-password" tabindex="-1" aria-label="Toggle password visibility">
        <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    </button>
</div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Sign in</button>
                    </form>
                    <div class="auth-footer" style="display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.75rem;">
                        <a href="/forgot-password" class="btn-link" style="text-decoration: none; text-align: center;">Forgot password?</a>
                        <a href="/signup" class="btn-link" style="text-decoration: none; text-align: center;">Don't have an account? Sign up</a>
                    </div>
                </div>
            </div>
        `;
}

export function renderSignupPage() {
  return `
            <div class="auth-page">
                <div class="auth-card">
                    <div class="auth-header" style="text-align: center;">
                        <img src="/logo.png" alt="Credlyst logo" style="width: 48px; height: 48px; margin-bottom: 1rem; cursor: pointer;" onclick="app.router.navigate('/')" decoding="async">
                        <h1 class="auth-title">Create an account</h1>
                        <p>Start organizing your links today.</p>
                    </div>
                    <form id="signup-form">
                         <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" name="name" required placeholder="e.g. John Doe">
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" required placeholder="name@company.com">
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <div class="password-wrapper">
    <input type="password" name="password" required placeholder="••••••••">
    <button type="button" class="btn-toggle-password" data-action="toggle-password" tabindex="-1" aria-label="Toggle password visibility">
        <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    </button>
</div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Create account</button>
                    </form>
                    <div class="auth-footer">
                        <a href="/login" class="btn-link" style="text-decoration: none;">Already have an account? Log in</a>
                    </div>
                </div>
            </div>
        `;
}

export function renderForgotPasswordPage() {
  return `
            <div class="auth-page">
                <div class="auth-card">
                    <div class="auth-header" style="text-align: center;">
                        <img src="/logo.png" alt="Credlyst logo" style="width: 48px; height: 48px; margin-bottom: 1rem; cursor: pointer;" onclick="app.router.navigate('/')" decoding="async">
                        <h1 class="auth-title">Reset your password</h1>
                        <p>Enter the email linked to your account and we’ll send a recovery link.</p>
                    </div>
                    <form id="forgot-password-form">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" required placeholder="name@company.com">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Send reset link</button>
                    </form>
                    <div class="auth-footer">
                        <a href="/login" class="btn-link" style="text-decoration: none;">Back to sign in</a>
                    </div>
                </div>
            </div>
        `;
}

export function renderResetPasswordPage() {
  return `
            <div class="auth-page">
                <div class="auth-card">
                    <div class="auth-header" style="text-align: center;">
                        <img src="/logo.png" alt="Credlyst logo" style="width: 48px; height: 48px; margin-bottom: 1rem; cursor: pointer;" onclick="app.router.navigate('/')" decoding="async">
                        <h1 class="auth-title">Choose a new password</h1>
                        <p>Use the link from your email and set a new password below.</p>
                    </div>
                    <form id="reset-password-form">
                        <div class="form-group">
                            <label>New password</label>
                            <div class="password-wrapper">
    <input type="password" name="password" required placeholder="••••••••">
    <button type="button" class="btn-toggle-password" data-action="toggle-password" tabindex="-1" aria-label="Toggle password visibility">
        <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    </button>
</div>
                        </div>
                        <div class="form-group">
                            <label>Confirm password</label>
                            <div class="password-wrapper">
    <input type="password" name="confirmPassword" required placeholder="••••••••">
    <button type="button" class="btn-toggle-password" data-action="toggle-password" tabindex="-1" aria-label="Toggle password visibility">
        <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    </button>
</div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Update password</button>
                    </form>
                    <div class="auth-footer">
                        <a href="/login" class="btn-link" style="text-decoration: none;">Back to sign in</a>
                    </div>
                </div>
            </div>
        `;
}
