// Format date to relative time (e.g., "2 days ago")
export function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    return `${years} year${years > 1 ? 's' : ''} ago`;
}

// Format date to readable string
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format date and time
export function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Truncate text with ellipsis
export function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Truncate URL for display
export function truncateUrl(url, maxLength = 50) {
    if (!url) return '';
    if (url.length <= maxLength) return url;
    
    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        const path = urlObj.pathname;
        
        if (domain.length > maxLength) {
            return domain.substring(0, maxLength) + '...';
        }
        
        const remainingLength = maxLength - domain.length - 3;
        if (path.length > remainingLength) {
            return domain + path.substring(0, remainingLength) + '...';
        }
        
        return domain + path;
    } catch (_) {
        return url.substring(0, maxLength) + '...';
    }
}

// Format number with commas
export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Get domain from URL
export function getDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (_) {
        return url;
    }
}

// Get favicon URL for a domain
export function getFaviconUrl(url) {
    try {
        const urlObj = new URL(url);
        return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch (_) {
        return '';
    }
}

// Pluralize word based on count
export function pluralize(count, singular, plural = null) {
    if (count === 1) return singular;
    return plural || singular + 's';
}
