// App Information
export const APP_NAME = 'Credlyst';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'A beautiful, privacy-focused link management tool';

// Database
export const DB_NAME = 'CredlystDB';
export const DB_VERSION = 1;

// Default Categories
export const DEFAULT_CATEGORIES = [
    'General',
    'Work',
    'Personal',
    'Learning',
    'Projects',
    'Resources',
    'Tools',
    'Documentation',
    'Social',
    'Entertainment'
];

// Default Tag Colors
export const TAG_COLORS = [
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1'  // Indigo
];

// Pagination
export const ITEMS_PER_PAGE = 20;
export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

// Search
export const SEARCH_DEBOUNCE_MS = 300;
export const MIN_SEARCH_LENGTH = 2;

// Validation
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_KEYWORDS_LENGTH = 200;
export const MAX_TAG_NAME_LENGTH = 50;
export const MAX_CATEGORY_NAME_LENGTH = 50;

// Toast Notifications
export const TOAST_DURATION = 5000; // 5 seconds
export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// Themes
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

// View Modes
export const VIEW_MODES = {
    GRID: 'grid',
    LIST: 'list'
};

// Sort Options
export const SORT_OPTIONS = [
    { value: 'updated_at', label: 'Recently Updated', order: 'DESC' },
    { value: 'created_at', label: 'Recently Added', order: 'DESC' },
    { value: 'title', label: 'Title (A-Z)', order: 'ASC' },
    { value: 'title', label: 'Title (Z-A)', order: 'DESC' },
    { value: 'access_count', label: 'Most Accessed', order: 'DESC' }
];

// Export Formats
export const EXPORT_FORMATS = {
    JSON: 'json',
    SQL: 'sql',
    CSV: 'csv'
};

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
    SEARCH: 'ctrl+k',
    ADD_LINK: 'ctrl+n',
    TOGGLE_THEME: 'ctrl+shift+t',
    CLOSE_MODAL: 'escape'
};

// Local Storage Keys
export const STORAGE_KEYS = {
    THEME: 'credlyst_theme',
    VIEW_MODE: 'credlyst_view_mode',
    SORT_BY: 'credlyst_sort_by',
    ONBOARDING_COMPLETED: 'credlyst_onboarding_completed'
};

// API URLs (for future features)
export const API_ENDPOINTS = {
    METADATA: 'https://api.microlink.io',
    FAVICON: 'https://www.google.com/s2/favicons'
};

// Feature Flags
export const FEATURES = {
    IMPORT_EXPORT: true,
    ANALYTICS: true,
    TAGS: true,
    CATEGORIES: true,
    FAVORITES: true,
    SEARCH: true,
    DARK_MODE: true,
    LINK_PREVIEW: false, // Future feature
    CLOUD_SYNC: false,   // Future feature
    COLLABORATION: false // Future feature
};
