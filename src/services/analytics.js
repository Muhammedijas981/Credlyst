import authService from './authService.js';

class Analytics {
    async getFullReport() {
        try {
            const token = authService.getToken();
            if (!token) return null;

            const response = await fetch('/api/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Analytics error:', error);
            return null;
        }
    }
}

export default new Analytics();
