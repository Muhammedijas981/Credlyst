import { supabase } from '../lib/supabase.js';
import authService from './authService.js';

class LinkManager {
    constructor() {
        this.tableName = 'links';
    }

    async getAllLinks(filters = {}) {
        try {
            const user = authService.getCurrentUser();
            if (!user) throw new Error('Not authenticated');

            let query = supabase
                .from(this.tableName)
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            // Apply filters
            if (filters.search) {
                query = query.or(`title.ilike.%${filters.search}%,url.ilike.%${filters.search}%,description.ilike.%${filters.search}%,keywords.ilike.%${filters.search}%`);
            }

            if (filters.category && filters.category !== 'all') {
                query = query.eq('category', filters.category);
            }

            if (filters.favorite === true) {
                query = query.eq('favorite', true);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Failed to get links:', error);
            return [];
        }
    }

    async addLink(linkData) {
        try {
            const user = authService.getCurrentUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from(this.tableName)
                .insert([{
                    user_id: user.id,
                    title: linkData.title,
                    url: linkData.url,
                    description: linkData.description || '',
                    keywords: linkData.keywords || '',
                    category: linkData.category || 'General',
                    favorite: linkData.favorite || false
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to add link:', error);
            throw error;
        }
    }

    async updateLink(id, linkData) {
        try {
            const user = authService.getCurrentUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from(this.tableName)
                .update({
                    title: linkData.title,
                    url: linkData.url,
                    description: linkData.description,
                    keywords: linkData.keywords,
                    category: linkData.category,
                    favorite: linkData.favorite,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to update link:', error);
            throw error;
        }
    }

    async deleteLink(id) {
        try {
            const user = authService.getCurrentUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from(this.tableName)
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Failed to delete link:', error);
            throw error;
        }
    }

    async getStats() {
        try {
            const user = authService.getCurrentUser();
            if (!user) throw new Error('Not authenticated');

            const { data: allLinks } = await supabase
                .from(this.tableName)
                .select('category, favorite')
                .eq('user_id', user.id);

            const total = allLinks?.length || 0;
            const favorites = allLinks?.filter(l => l.favorite).length || 0;
            const categories = new Set(allLinks?.map(l => l.category)).size || 0;

            return { total, favorites, categories };
        } catch (error) {
            console.error('Failed to get stats:', error);
            return { total: 0, favorites: 0, categories: 0 };
        }
    }

    async getCategories() {
        try {
            const user = authService.getCurrentUser();
            if (!user) throw new Error('Not authenticated');

            const { data } = await supabase
                .from(this.tableName)
                .select('category')
                .eq('user_id', user.id);

            const categoryCounts = {};
            data?.forEach(link => {
                categoryCounts[link.category] = (categoryCounts[link.category] || 0) + 1;
            });

            return Object.entries(categoryCounts).map(([category, count]) => ({
                category,
                count
            }));
        } catch (error) {
            console.error('Failed to get categories:', error);
            return [];
        }
    }
}

export default new LinkManager();
