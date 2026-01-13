import linkManager from './linkManager.js';

class SearchEngine {
    async search(query) {
        try {
            if (!query || query.trim() === '') return [];
            return await linkManager._fetch(`/api/links?search=${encodeURIComponent(query)}`);
        } catch (error) {
            console.error('Search failed:', error);
            return [];
        }
    }

    async searchByCategory(category) {
        try {
            return await linkManager._fetch(`/api/links?category=${encodeURIComponent(category)}`);
        } catch (error) {
            console.error('Category search failed:', error);
            return [];
        }
    }

    async getFavorites() {
        try {
            return await linkManager._fetch(`/api/links?favorite=true`);
        } catch (error) {
            console.error('Favorites fetch failed:', error);
            return [];
        }
    }
}

export default new SearchEngine();
