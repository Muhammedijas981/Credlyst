import { supabase } from '../lib/supabase.js';

export class AuthService {
    constructor() {
        this.currentUser = null;
        this.accounts = this.loadStoredAccounts();
        this.initPromise = this.initAuth();
    }

    loadStoredAccounts() {
        try {
            return JSON.parse(localStorage.getItem('credlyst_accounts') || '[]');
        } catch {
            return [];
        }
    }

    saveCurrentSessionLocally(session) {
        if (!session) return;
        const account = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            access_token: session.access_token,
            refresh_token: session.refresh_token
        };
        
        let accounts = this.loadStoredAccounts();
        accounts = accounts.filter(a => a.id !== account.id);
        accounts.unshift(account);
        this.accounts = accounts;
        localStorage.setItem('credlyst_accounts', JSON.stringify(accounts));
    }

    async initAuth() {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            this.saveCurrentSessionLocally(session);
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                this.currentUser = session.user;
                this.saveCurrentSessionLocally(session);
            } else {
                this.currentUser = null;
            }
        });
    }

    async switchAccount(accountObj) {
        const { error } = await supabase.auth.setSession({
            access_token: accountObj.access_token,
            refresh_token: accountObj.refresh_token
        });
        if (error) throw error;
        
        let accounts = this.loadStoredAccounts();
        accounts = accounts.filter(a => a.id !== accountObj.id);
        accounts.unshift(accountObj);
        this.accounts = accounts;
        localStorage.setItem('credlyst_accounts', JSON.stringify(accounts));
        
        const { data } = await supabase.auth.getSession();
        if (data.session) {
            this.currentUser = data.session.user;
        }
        return data.session;
    }

    get isAuthenticated() {
        return !!this.currentUser;
    }

    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.currentUser = data.user;
            return {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || email.split('@')[0]
            };
        } catch (error) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Login failed');
        }
    }

    async signup(name, email, password) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name
                    },
                    emailRedirectTo: window.location.origin
                }
            });

            if (error) throw error;

            // Check if email confirmation is required
            if (data.user && !data.session) {
                // Email confirmation required
                throw new Error('Please check your email to confirm your account before logging in.');
            }

            // If we have a session, user is logged in immediately (email confirmation disabled)
            if (data.session) {
                this.currentUser = data.user;
                return {
                    id: data.user.id,
                    email: data.user.email,
                    name: name
                };
            }

            throw new Error('Signup completed but no session created. Please try logging in.');
        } catch (error) {
            console.error('Signup error:', error);
            throw new Error(error.message || 'Signup failed');
        }
    }

    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            this.currentUser = null;
            window.location.reload();
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    getToken() {
        return supabase.auth.getSession().then(({ data }) => data.session?.access_token);
    }

    getCurrentUser() {
        if (!this.currentUser) return null;
        return {
            id: this.currentUser.id,
            email: this.currentUser.email,
            name: this.currentUser.user_metadata?.name || this.currentUser.email?.split('@')[0] || 'User',
            raw: this.currentUser
        };
    }
}

export default new AuthService();
