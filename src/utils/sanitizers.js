// Sanitize HTML to prevent XSS attacks
export function sanitizeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Sanitize URL
export function sanitizeUrl(url) {
    try {
        const urlObj = new URL(url);
        // Only allow http and https protocols
        if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
            return '';
        }
        return urlObj.href;
    } catch (_) {
        return '';
    }
}

// Strip HTML tags
export function stripHtmlTags(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

// Sanitize input for SQL (already handled by parameterized queries, but useful for display)
export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
}

// Clean keywords (remove duplicates, trim, lowercase)
export function cleanKeywords(keywords) {
    if (!keywords) return '';
    
    const keywordArray = keywords
        .split(',')
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0);
    
    // Remove duplicates
    const uniqueKeywords = [...new Set(keywordArray)];
    
    return uniqueKeywords.join(', ');
}
