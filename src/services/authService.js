export class AuthService {
    constructor() {
        this.token = localStorage.getItem('credlyst_auth_token');
        this.currentUser = JSON.parse(localStorage.getItem('credlyst_user')) || null;
    }

    get isAuthenticated() {
        return !!this.token; // Simple check for now
    }

    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Login failed');
            }

            const data = await response.json();
            this.setSession(data);
            return data.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async signup(name, email, password) {
         try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

             if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Signup failed');
            }

            const data = await response.json();
            this.setSession(data);
            return data.user;
        } catch (error) {
             console.error('Signup error:', error);
             throw error;
        }
    }

    logout() {
        localStorage.removeItem('credlyst_auth_token');
        localStorage.removeItem('credlyst_user');
        this.token = null;
        this.currentUser = null;
        window.location.reload();
    }

    setSession(data) {
        this.token = data.token;
        this.currentUser = data.user;
        localStorage.setItem('credlyst_auth_token', data.token);
        localStorage.setItem('credlyst_user', JSON.stringify(data.user));
    }

    getToken() {
        return this.token;
    }
}

export default new AuthService();
