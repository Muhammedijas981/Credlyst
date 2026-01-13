import authService from './authService.js';

class LinkManager {
    constructor() {
        this.basePath = '/api/links';
    }

    async _fetch(endpoint, options = {}) {
        const token = authService.getToken();
        if (!token) throw new Error('Unauthorized');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        const response = await fetch(endpoint, { ...options, headers });
        if (!response.ok) {
            if (response.status === 401) authService.logout();
            const err = await response.json();
            throw new Error(err.error || 'API Error');
        }
        return response.json();
    }

    async getAllLinks() {
        try {
            return await this._fetch(this.basePath);
        } catch (error) {
            console.error('Failed to get links:', error);
            return [];
        }
    }

    async addLink(linkData) {
        return await this._fetch(this.basePath, {
            method: 'POST',
            body: JSON.stringify(linkData)
        });
    }

    // New update method properly integrated
    async updateLink(id, linkData) {
         return await this._fetch(`${this.basePath}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(linkData)
        });
    }

    async deleteLink(id) {
         return await this._fetch(`${this.basePath}/${id}`, {
            method: 'DELETE'
        });
    }
}

export default new LinkManager();
