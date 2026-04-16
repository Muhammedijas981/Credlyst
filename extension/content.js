/**
 * Credlyst Extension — Content Script
 * Injected into every page alongside fuse.min.js.
 * Manages the finder UI lifecycle, fuzzy search, and auto-fill.
 *
 * Fuse global is available because finder/fuse.min.js runs first
 * in the content_scripts js array (see manifest.json).
 */

(function () {
    'use strict';

    // Guard: prevent double-injection on navigations
    if (window.__credlyst_injected) return;
    window.__credlyst_injected = true;

    let finderOpen = false;
    let finderEl = null;
    let overlayEl = null;
    let lastFocusedInput = null;

    // ─── Track last focused input before finder opens ──────────────────────
    document.addEventListener('focusin', (e) => {
        const el = e.target;
        if (
            !el.closest('#credlyst-finder') &&   // ignore our own inputs
            (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
        ) {
            lastFocusedInput = el;
        }
    }, true);

    // ─── Global keyboard shortcut: Ctrl/Cmd + Shift + F and Ctrl/Cmd + Shift + S ───────────────────
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
            if (e.key.toLowerCase() === 'f') {
                e.preventDefault();
                e.stopImmediatePropagation();
                toggleFinder();
            } else if (e.key.toLowerCase() === 's') {
                e.preventDefault();
                e.stopImmediatePropagation();
                toggleSaver({ title: document.title, url: window.location.href });
            }
        }
    }, true);

    // ─── Message from background service worker (via Commands API) ─────────
    chrome.runtime.onMessage.addListener((msg) => {
        if (msg?.type === 'TOGGLE_FINDER') toggleFinder();
        if (msg?.type === 'TOGGLE_SAVER') toggleSaver(msg.tabInfo || { title: document.title, url: window.location.href });
    });

    // ─── Finder toggle ─────────────────────────────────────────────────────
    function toggleFinder() {
        finderOpen ? closeFinder() : openFinder();
    }

    // ─── Open finder ───────────────────────────────────────────────────────
    function openFinder() {
        if (finderEl) return; // already open

        // Overlay (click-outside-to-close)
        overlayEl = document.createElement('div');
        overlayEl.id = 'credlyst-overlay';
        overlayEl.addEventListener('click', closeFinder);

        // Finder modal
        finderEl = document.createElement('div');
        finderEl.id = 'credlyst-finder';
        finderEl.setAttribute('role', 'dialog');
        finderEl.setAttribute('aria-label', 'Credlyst Quick Finder');
        finderEl.innerHTML = buildFinderHTML();
        finderEl.addEventListener('click', (e) => e.stopPropagation());

        document.body.appendChild(overlayEl);
        document.body.appendChild(finderEl);

        setupFinderLogic();
        finderOpen = true;

        // Animate in (next frame so transition fires)
        requestAnimationFrame(() => {
            overlayEl.classList.add('credlyst-visible');
            finderEl.classList.add('credlyst-visible');
            finderEl.querySelector('#credlyst-search')?.focus();
        });
    }

    // ─── Close finder ──────────────────────────────────────────────────────
    function closeFinder() {
        if (!finderEl) return;
        finderEl.classList.remove('credlyst-visible');
        overlayEl?.classList.remove('credlyst-visible');
        setTimeout(() => {
            finderEl?.remove();
            overlayEl?.remove();
            finderEl = null;
            overlayEl = null;
            finderOpen = false;
        }, 200);
    }

    // ─── Saver toggle ──────────────────────────────────────────────────────
    let saverOpen = false;
    let saverEl = null;

    function toggleSaver(tabInfo) {
        saverOpen ? closeSaver() : openSaver(tabInfo);
    }

    function openSaver(tabInfo) {
        if (saverEl) return;
        if (finderOpen) closeFinder();

        overlayEl = document.createElement('div');
        overlayEl.id = 'credlyst-overlay';
        overlayEl.addEventListener('click', closeSaver);

        saverEl = document.createElement('div');
        saverEl.id = 'credlyst-saver';
        saverEl.setAttribute('role', 'dialog');
        saverEl.setAttribute('aria-label', 'Save to Credlyst');
        saverEl.innerHTML = buildSaverHTML(tabInfo);
        saverEl.addEventListener('click', (e) => e.stopPropagation());

        document.body.appendChild(overlayEl);
        document.body.appendChild(saverEl);

        setupSaverLogic();
        saverOpen = true;

        requestAnimationFrame(() => {
            overlayEl.classList.add('credlyst-visible');
            saverEl.classList.add('credlyst-visible');
            saverEl.querySelector('#cs-title')?.focus();
        });
    }

    function closeSaver() {
        if (!saverEl) return;
        saverEl.classList.remove('credlyst-visible');
        overlayEl?.classList.remove('credlyst-visible');
        setTimeout(() => {
            saverEl?.remove();
            overlayEl?.remove();
            saverEl = null;
            overlayEl = null;
            saverOpen = false;
        }, 200);
    }

    // ─── Finder HTML skeleton ──────────────────────────────────────────────
    function buildFinderHTML() {
        return `
            <div class="credlyst-header">
                <div class="credlyst-search-row">
                    <svg class="credlyst-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                        id="credlyst-search"
                        type="text"
                        placeholder="Search your links…"
                        autocomplete="off"
                        autocorrect="off"
                        spellcheck="false"
                    />
                    <span class="credlyst-esc-hint">ESC</span>
                </div>
            </div>
            <div class="credlyst-results" id="credlyst-results" role="listbox">
                <div class="credlyst-loading" id="credlyst-loading">
                    <div class="credlyst-spinner"></div>
                    <span>Loading your links…</span>
                </div>
            </div>
            <div class="credlyst-footer">
                <span class="credlyst-hint"><kbd>↑↓</kbd> navigate</span>
                <span class="credlyst-hint"><kbd>↵</kbd> autofill</span>
                <span class="credlyst-hint"><kbd>Ctrl+C</kbd> copy</span>
                <span class="credlyst-hint-sep"></span>
                <span class="credlyst-brand">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    Credlyst
                </span>
            </div>
        `;
    }

    // ─── Saver HTML skeleton ───────────────────────────────────────────────
    function buildSaverHTML(tabInfo) {
        return `
            <div class="credlyst-header">
                <span class="credlyst-brand" style="opacity: 1; font-size: 14px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Save to Credlyst
                </span>
                <span class="credlyst-esc-hint">ESC</span>
            </div>
            <div class="credlyst-saver-body">
                <form id="credlyst-saver-form">
                    <div class="cs-group">
                        <label>Title</label>
                        <input id="cs-title" type="text" value="${esc(tabInfo.title)}" required />
                    </div>
                    <div class="cs-group">
                        <label>URL</label>
                        <input id="cs-url" type="url" value="${esc(tabInfo.url)}" required />
                    </div>
                    <div class="cs-row">
                        <div class="cs-group">
                            <label>Category</label>
                            <input id="cs-category" type="text" placeholder="e.g. Work" />
                        </div>
                        <div class="cs-group-checkbox">
                            <input type="checkbox" id="cs-favorite" />
                            <label for="cs-favorite">Favorite <svg style="display:inline;color:#f59e0b;vertical-align:text-bottom" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></label>
                        </div>
                    </div>
                    <div class="cs-group">
                        <label>Description (Optional)</label>
                        <textarea id="cs-description" rows="2" placeholder="Notes about this link..."></textarea>
                    </div>
                    <div class="cs-actions">
                        <button type="submit" id="cs-submit">Save Link</button>
                    </div>
                </form>
            </div>
        `;
    }

    // ─── Saver logic ───────────────────────────────────────────────────────
    function setupSaverLogic() {
        const form = saverEl.querySelector('#credlyst-saver-form');
        const submitBtn = saverEl.querySelector('#cs-submit');

        saverEl.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeSaver();
            }
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                form.requestSubmit();
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            const payload = {
                title: saverEl.querySelector('#cs-title').value.trim(),
                url: saverEl.querySelector('#cs-url').value.trim(),
                category: saverEl.querySelector('#cs-category').value.trim() || 'General',
                description: saverEl.querySelector('#cs-description').value.trim() || null,
                favorite: saverEl.querySelector('#cs-favorite').checked,
                keywords: ''
            };

            chrome.runtime.sendMessage({ type: 'SAVE_LINK', payload }, (res) => {
                if (chrome.runtime.lastError || !res?.success) {
                    showToast('Failed to save link. Are you logged in?');
                    submitBtn.textContent = 'Save Link';
                    submitBtn.disabled = false;
                } else {
                    showToast('✓ Link saved to Credlyst');
                    closeSaver();
                }
            });
        });
    }

    // ─── Finder logic ──────────────────────────────────────────────────────
    function setupFinderLogic() {
        const searchInput = finderEl.querySelector('#credlyst-search');
        const resultsEl = finderEl.querySelector('#credlyst-results');

        let allLinks = [];
        let filtered = [];
        let selectedIdx = -1;
        let fuseInstance = null;

        // Fetch links from background worker
        chrome.runtime.sendMessage({ type: 'FETCH_LINKS' }, (response) => {
            finderEl?.querySelector('#credlyst-loading')?.remove();

            if (chrome.runtime.lastError || !response?.success) {
                const errMsg = response?.error;
                if (errMsg === 'NOT_AUTHENTICATED') {
                    renderState(resultsEl, 'auth');
                } else {
                    renderState(resultsEl, 'error', errMsg || 'Failed to load links');
                }
                return;
            }

            allLinks = response.links || [];
            if (allLinks.length === 0) { renderState(resultsEl, 'empty'); return; }

            // Init Fuse (available from fuse.min.js loaded before this script)
            fuseInstance = new Fuse(allLinks, {
                keys: [
                    { name: 'title',       weight: 0.45 },
                    { name: 'keywords',    weight: 0.25 },
                    { name: 'url',         weight: 0.18 },
                    { name: 'description', weight: 0.08 },
                    { name: 'category',    weight: 0.04 }
                ],
                threshold: 0.4,
                includeScore: true,
                minMatchCharLength: 1,
                ignoreLocation: true
            });

            filtered = allLinks;
            selectedIdx = filtered.length > 0 ? 0 : -1;
            renderResults(resultsEl, filtered, selectedIdx);
        });

        // Live search
        searchInput?.addEventListener('input', (e) => {
            const q = e.target.value.trim();
            if (!fuseInstance) return;
            filtered = q ? fuseInstance.search(q).map(r => r.item) : allLinks;
            selectedIdx = filtered.length > 0 ? 0 : -1;
            renderResults(resultsEl, filtered, selectedIdx);
        });

        // Keyboard navigation
        finderEl.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    closeFinder();
                    break;

                case 'ArrowDown':
                    e.preventDefault();
                    if (!filtered.length) break;
                    selectedIdx = (selectedIdx + 1) % filtered.length;
                    updateSelection(resultsEl, selectedIdx);
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    if (!filtered.length) break;
                    selectedIdx = (selectedIdx - 1 + filtered.length) % filtered.length;
                    updateSelection(resultsEl, selectedIdx);
                    break;

                case 'Enter':
                    e.preventDefault();
                    if (selectedIdx >= 0 && filtered[selectedIdx]) {
                        handlePick(filtered[selectedIdx]);
                    }
                    break;

                case 'c':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (selectedIdx >= 0 && filtered[selectedIdx]) {
                            copyURL(filtered[selectedIdx].url, true);
                            closeFinder();
                        }
                    }
                    break;
            }
        });

        // Pick action: autofill if input available, else copy
        function handlePick(link) {
            if (lastFocusedInput && document.body.contains(lastFocusedInput)) {
                fillInput(lastFocusedInput, link.url);
                showToast(`✓ Inserted: ${link.title}`);
            } else {
                copyURL(link.url, false);
                showToast('Copied — no input field was focused');
            }
            chrome.runtime.sendMessage({ type: 'TRACK_ACCESS', linkId: link.id });
            closeFinder();
        }
    }

    // ─── Render functions ──────────────────────────────────────────────────

    function renderResults(container, links, selectedIdx) {
        if (!links.length) {
            container.innerHTML = stateHTML('search');
            return;
        }

        container.innerHTML = links.map((link, i) => `
            <div class="credlyst-item ${i === selectedIdx ? 'credlyst-item-selected' : ''}"
                 role="option" aria-selected="${i === selectedIdx}" data-idx="${i}">
                <div class="credlyst-item-favicon">
                    <img
                        src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(getDomain(link.url))}&sz=32"
                        width="16" height="16"
                        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
                        alt=""
                    />
                    <div class="credlyst-item-favicon-fallback" style="display:none">
                        ${esc(link.title).charAt(0).toUpperCase()}
                    </div>
                </div>
                <div class="credlyst-item-body">
                    <div class="credlyst-item-title">
                        ${link.favorite ? '<svg class="credlyst-star" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' : ''}
                        ${esc(link.title)}
                    </div>
                    <div class="credlyst-item-url">${esc(link.url)}</div>
                </div>
                <div class="credlyst-item-meta">
                    <span class="credlyst-category">${esc(link.category || 'General')}</span>
                </div>
            </div>
        `).join('');

        // Click handlers
        container.querySelectorAll('.credlyst-item').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.dataset.idx, 10);
                if (links[idx]) {
                    const link = links[idx];
                    if (lastFocusedInput && document.body.contains(lastFocusedInput)) {
                        fillInput(lastFocusedInput, link.url);
                        showToast(`✓ Inserted: ${link.title}`);
                    } else {
                        copyURL(link.url, false);
                        showToast('Copied — no input field was focused');
                    }
                    chrome.runtime.sendMessage({ type: 'TRACK_ACCESS', linkId: link.id });
                    closeFinder();
                }
            });
            el.addEventListener('mouseenter', () => {
                container.querySelectorAll('.credlyst-item').forEach(e => {
                    e.classList.remove('credlyst-item-selected');
                    e.setAttribute('aria-selected', 'false');
                });
                el.classList.add('credlyst-item-selected');
                el.setAttribute('aria-selected', 'true');
            });
        });

        scrollToSelected(container, selectedIdx);
    }

    function updateSelection(container, idx) {
        container.querySelectorAll('.credlyst-item').forEach((el, i) => {
            el.classList.toggle('credlyst-item-selected', i === idx);
            el.setAttribute('aria-selected', String(i === idx));
        });
        scrollToSelected(container, idx);
    }

    function scrollToSelected(container, idx) {
        container.querySelectorAll('.credlyst-item')[idx]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function renderState(container, type, msg) {
        container.innerHTML = stateHTML(type, msg);
    }

    function stateHTML(type, msg) {
        const configs = {
            auth: {
                icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
                title: 'Sign in to Credlyst first',
                sub: 'Click the extension icon in your toolbar'
            },
            error: {
                icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
                title: 'Could not load links',
                sub: msg || 'Check your connection and try again'
            },
            empty: {
                icon: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
                title: 'No saved links yet',
                sub: 'Add links at credlyst.ijas.space'
            },
            search: {
                icon: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
                title: 'No links matched',
                sub: 'Try a different search term'
            }
        };
        const c = configs[type] || configs.error;
        return `
            <div class="credlyst-empty">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${c.icon}</svg>
                <p>${c.title}</p>
                <small>${c.sub}</small>
            </div>`;
    }

    // ─── Auto-fill ─────────────────────────────────────────────────────────
    function fillInput(el, value) {
        try {
            el.focus();
            if (el.isContentEditable) {
                // Works for Notion, Quill, ProseMirror, etc.
                document.execCommand('selectAll', false, null);
                document.execCommand('insertText', false, value);
                return;
            }
            // React/Vue/Angular controlled inputs need the native setter
            const proto = el.tagName === 'TEXTAREA'
                ? HTMLTextAreaElement.prototype
                : HTMLInputElement.prototype;
            const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;

            if (nativeSetter) {
                nativeSetter.call(el, value);
            } else {
                el.value = value;
            }
            // Fire both events so framework state syncs
            ['input', 'change'].forEach(type => {
                el.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
            });
        } catch (err) {
            console.warn('[Credlyst] Fill failed, falling back to clipboard:', err);
            copyURL(value, false);
        }
    }

    // ─── Clipboard ─────────────────────────────────────────────────────────
    async function copyURL(url, silent) {
        try {
            await navigator.clipboard.writeText(url);
            if (!silent) showToast('Copied to clipboard!');
        } catch {
            showToast('Could not access clipboard');
        }
    }

    // ─── Toast notification ────────────────────────────────────────────────
    function showToast(message) {
        document.getElementById('credlyst-toast')?.remove();
        const toast = document.createElement('div');
        toast.id = 'credlyst-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('credlyst-toast-visible'));
        setTimeout(() => {
            toast.classList.remove('credlyst-toast-visible');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // ─── Utilities ─────────────────────────────────────────────────────────
    function getDomain(url) {
        try { return new URL(url).hostname; } catch { return ''; }
    }

    function esc(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

})();
