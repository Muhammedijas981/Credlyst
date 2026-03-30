import authService from './authService.js';
import linkManager from './linkManager.js';

class Analytics {
    async getFullReport() {
        try {
            const token = authService.getToken();
            if (!token) return null;

            return await linkManager.getStats();
        } catch (error) {
            console.error('Analytics error:', error);
            return null;
        }
    }
}

export default new Analytics();
