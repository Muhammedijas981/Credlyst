// URL Validation
export function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Validate link data
export function validateLinkData(data) {
    const errors = [];

    if (!data.title || data.title.trim() === '') {
        errors.push('Title is required');
    }

    if (!data.url || data.url.trim() === '') {
        errors.push('URL is required');
    } else if (!isValidUrl(data.url)) {
        errors.push('Invalid URL format');
    }

    if (data.title && data.title.length > 200) {
        errors.push('Title must be less than 200 characters');
    }

    if (data.description && data.description.length > 1000) {
        errors.push('Description must be less than 1000 characters');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// Validate tag name
export function validateTagName(name) {
    if (!name || name.trim() === '') {
        return { isValid: false, error: 'Tag name is required' };
    }

    if (name.length > 50) {
        return { isValid: false, error: 'Tag name must be less than 50 characters' };
    }

    // Check for special characters
    if (!/^[a-zA-Z0-9\s-_]+$/.test(name)) {
        return { isValid: false, error: 'Tag name can only contain letters, numbers, spaces, hyphens, and underscores' };
    }

    return { isValid: true };
}

// Validate color hex code
export function validateColor(color) {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
}

// Email validation (for future features)
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
