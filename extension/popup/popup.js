/**
 * Credlyst Extension — Popup Script
 * Handles login, logout, and displaying user stats in the extension popup.
 */

const views = {
    loading: document.getElementById('view-loading'),
    login: document.getElementById('view-login'),
    dashboard: document.getElementById('view-dashboard'),
};

function showView(name) {
    Object.values(views).forEach(v => { v.classList.remove('active'); v.style.display = 'none'; });
    if (views[name]) { views[name].style.display = 'block'; views[name].classList.add('active'); }
}

// ─── Initialize ──────────────────────────────────────────────────────────────
async function init() {
    showView('loading');
    chrome.runtime.sendMessage({ type: 'GET_AUTH_STATE' }, (response) => {
        if (chrome.runtime.lastError) {
            showView('login');
            return;
        }
        if (response?.isAuthenticated && response?.user) {
            showDashboard(response.user);
        } else {
            showView('login');
        }
    });
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function showDashboard(user) {
    showView('dashboard');

    const name = user.name || user.email?.split('@')[0] || 'User';
    document.getElementById('user-avatar').textContent = name.charAt(0).toUpperCase();
    document.getElementById('user-name').textContent = name;
    document.getElementById('user-email').textContent = user.email || '';

    loadStats();
}

function loadStats() {
    chrome.runtime.sendMessage({ type: 'FETCH_LINKS' }, (response) => {
        if (chrome.runtime.lastError || !response?.success) return;
        const links = response.links || [];
        document.getElementById('stat-total').textContent = links.length;
        document.getElementById('stat-favorites').textContent = links.filter(l => l.favorite).length;
        const cats = new Set(links.map(l => l.category).filter(Boolean));
        document.getElementById('stat-categories').textContent = cats.size;
    });
}

// ─── Login ───────────────────────────────────────────────────────────────────
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');
const loginBtnText = document.getElementById('login-btn-text');
const loginSpinner = document.getElementById('login-spinner');
const loginError = document.getElementById('login-error');

loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) return;

    // Loading state
    loginBtn.disabled = true;
    loginBtnText.textContent = 'Signing in…';
    loginSpinner.classList.remove('hidden');
    loginError.classList.add('hidden');

    chrome.runtime.sendMessage({ type: 'LOGIN', email, password }, (response) => {
        loginBtn.disabled = false;
        loginBtnText.textContent = 'Sign in';
        loginSpinner.classList.add('hidden');

        if (chrome.runtime.lastError) {
            showError('Extension error. Please try again.');
            return;
        }
        if (response?.success && response?.user) {
            showDashboard(response.user);
        } else {
            showError(response?.error || 'Invalid email or password.');
        }
    });
});

function showError(msg) {
    loginError.textContent = msg;
    loginError.classList.remove('hidden');
    // Shake animation
    loginBtn.style.animation = 'none';
    requestAnimationFrame(() => {
        loginBtn.style.animation = 'shake 0.3s ease';
    });
}

// ─── Logout ──────────────────────────────────────────────────────────────────
document.getElementById('logout-btn')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'LOGOUT' }, () => {
        showView('login');
        // Clear form
        loginForm?.reset();
        loginError.classList.add('hidden');
    });
});

// ─── Toggle password visibility ───────────────────────────────────────────────
document.getElementById('toggle-password')?.addEventListener('click', () => {
    const pwdInput = document.getElementById('password');
    const eyeShow = document.getElementById('eye-show');
    const eyeHide = document.getElementById('eye-hide');
    const isPassword = pwdInput.type === 'password';
    pwdInput.type = isPassword ? 'text' : 'password';
    eyeShow.classList.toggle('hidden', isPassword);
    eyeHide.classList.toggle('hidden', !isPassword);
});

// ─── Shake animation for error ────────────────────────────────────────────────
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-4px); }
        40% { transform: translateX(4px); }
        60% { transform: translateX(-3px); }
        80% { transform: translateX(3px); }
    }
`;
document.head.appendChild(shakeStyle);

// ─── Start ───────────────────────────────────────────────────────────────────
init();
