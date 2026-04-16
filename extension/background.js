/**
 * Credlyst Extension — Background Service Worker (MV3)
 * Handles auth, token refresh, and Supabase API calls on behalf of content scripts.
 */

const SUPABASE_URL = 'https://frzmagqflmrfsyhzccim.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyem1hZ3FmbG1yZnN5aHpjY2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MDA2ODMsImV4cCI6MjA4NTA3NjY4M30.8Fi_oQk7EWCYJQZIbg71cTnvIyi4jC9aHsFKP6ZKyfc';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getStoredAuth() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['credlyst_access_token', 'credlyst_refresh_token', 'credlyst_user'], resolve);
    });
}

async function setStoredAuth(data) {
    return new Promise((resolve) => chrome.storage.local.set(data, resolve));
}

async function clearStoredAuth() {
    return new Promise((resolve) => {
        chrome.storage.local.remove(['credlyst_access_token', 'credlyst_refresh_token', 'credlyst_user'], resolve);
    });
}

// ─── Supabase REST helpers ───────────────────────────────────────────────────

async function supabaseFetch(path, options = {}, accessToken = null) {
    const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        ...options.headers
    };
    const res = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error_description || err.message || `HTTP ${res.status}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

async function refreshToken(refreshToken) {
    const data = await supabaseFetch('/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken })
    });
    return data;
}

async function getValidToken() {
    const auth = await getStoredAuth();
    if (!auth.credlyst_access_token) return null;

    // Try token — if expired, refresh
    try {
        // Decode JWT exp (no library needed — just base64 decode payload)
        const payload = JSON.parse(atob(auth.credlyst_access_token.split('.')[1]));
        const exp = payload.exp * 1000;
        const isExpired = Date.now() > exp - 60_000; // refresh 1 min early

        if (isExpired && auth.credlyst_refresh_token) {
            console.log('[Credlyst] Token expired. Refreshing...');
            const refreshed = await refreshToken(auth.credlyst_refresh_token);
            await setStoredAuth({
                credlyst_access_token: refreshed.access_token,
                credlyst_refresh_token: refreshed.refresh_token
            });
            return refreshed.access_token;
        }
        return auth.credlyst_access_token;
    } catch (e) {
        console.error('[Credlyst] Token validation failed:', e);
        return null;
    }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

async function login(email, password) {
    const data = await supabaseFetch('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    const user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || email.split('@')[0]
    };
    await setStoredAuth({
        credlyst_access_token: data.access_token,
        credlyst_refresh_token: data.refresh_token,
        credlyst_user: user
    });
    return user;
}

async function logout() {
    const token = await getValidToken();
    if (token) {
        await supabaseFetch('/auth/v1/logout', { method: 'POST' }, token).catch(() => {});
    }
    await clearStoredAuth();
}

// ─── Links ───────────────────────────────────────────────────────────────────

async function fetchLinks() {
    const token = await getValidToken();
    if (!token) throw new Error('NOT_AUTHENTICATED');

    // Fetch all user links sorted by favorites first, then access_count desc
    const data = await supabaseFetch(
        '/rest/v1/links?select=id,title,url,description,keywords,category,favorite,access_count&order=favorite.desc,access_count.desc,created_at.desc',
        { method: 'GET' },
        token
    );
    return data;
}

async function trackAccess(linkId) {
    const token = await getValidToken();
    if (!token) return;
    // Increment access_count
    await supabaseFetch(
        `/rest/v1/rpc/increment_access_count`,
        { method: 'POST', body: JSON.stringify({ link_id: linkId }) },
        token
    ).catch(() => {
        // Fallback: PATCH directly
        supabaseFetch(
            `/rest/v1/links?id=eq.${linkId}`,
            {
                method: 'PATCH',
                headers: { 'Prefer': 'return=minimal' },
                body: JSON.stringify({ last_accessed: new Date().toISOString() })
            },
            token
        ).catch(() => {});
    });
}

async function saveLink(payload) {
    const token = await getValidToken();
    if (!token) throw new Error('NOT_AUTHENTICATED');
    
    // Add user_id to payload from stored auth
    const auth = await getStoredAuth();
    if (!auth.credlyst_user?.id) throw new Error('MISSING_USER_ID');
    
    const dbPayload = {
        ...payload,
        user_id: auth.credlyst_user.id
    };

    const data = await supabaseFetch(
        '/rest/v1/links',
        { 
            method: 'POST',
            headers: { 'Prefer': 'return=minimal' },
            body: JSON.stringify(dbPayload)
        },
        token
    );
    return data;
}

// ─── Command listener (keyboard shortcut from commands API) ──────────────────

chrome.commands.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    
    if (command === 'open-quick-finder') {
        chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_FINDER' }).catch(() => {});
    } else if (command === 'save-current-link') {
        chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SAVER', tabInfo: { title: tab.title, url: tab.url } }).catch(() => {});
    }
});

// ─── Message router ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
        try {
            switch (message.type) {
                case 'LOGIN': {
                    const user = await login(message.email, message.password);
                    sendResponse({ success: true, user });
                    break;
                }
                case 'LOGOUT': {
                    await logout();
                    sendResponse({ success: true });
                    break;
                }
                case 'GET_AUTH_STATE': {
                    const auth = await getStoredAuth();
                    sendResponse({
                        isAuthenticated: !!auth.credlyst_access_token,
                        user: auth.credlyst_user || null
                    });
                    break;
                }
                case 'FETCH_LINKS': {
                    const links = await fetchLinks();
                    sendResponse({ success: true, links });
                    break;
                }
                case 'TRACK_ACCESS': {
                    await trackAccess(message.linkId);
                    sendResponse({ success: true });
                    break;
                }
                case 'SAVE_LINK': {
                    await saveLink(message.payload);
                    sendResponse({ success: true });
                    break;
                }
                default:
                    sendResponse({ error: 'Unknown message type' });
            }
        } catch (err) {
            console.error('[Credlyst Background]', err);
            sendResponse({ success: false, error: err.message });
        }
    })();
    return true; // keep message channel open for async
});
