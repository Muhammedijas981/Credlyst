import { supabase } from "../lib/supabase.js";

export class AuthService {
  constructor() {
    this.currentUser = null;
    this.accounts = this.loadStoredAccounts();
    this.initPromise = this.initAuth();
  }

  loadStoredAccounts() {
    try {
      return JSON.parse(localStorage.getItem("credlyst_accounts") || "[]");
    } catch {
      return [];
    }
  }

  saveCurrentSessionLocally(session) {
    if (!session) return;
    const account = {
      id: session.user.id,
      email: session.user.email,
      name:
        session.user.user_metadata?.name ||
        session.user.email?.split("@")[0] ||
        "User",
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    };

    let accounts = this.loadStoredAccounts();
    accounts = accounts.filter((a) => a.id !== account.id);
    accounts.unshift(account);
    this.accounts = accounts;
    localStorage.setItem("credlyst_accounts", JSON.stringify(accounts));
  }

  async initAuth() {
    // Listen for auth changes EARLY to catch events during initialization
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        this.isRecovery = true;
        if (this.recoveryCallback) this.recoveryCallback(session);
      }
      if (session) {
        this.currentUser = session.user;
        this.saveCurrentSessionLocally(session);
      } else {
        this.currentUser = null;
      }
    });

    // Get current session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      this.currentUser = session.user;
      this.saveCurrentSessionLocally(session);
    }
  }

  onPasswordRecovery(callback) {
    this.recoveryCallback = callback;
    if (this.isRecovery) {
      callback(this.currentUser);
    }
  }

  async switchAccount(accountObj) {
    const { error } = await supabase.auth.setSession({
      access_token: accountObj.access_token,
      refresh_token: accountObj.refresh_token,
    });
    if (error) throw error;

    let accounts = this.loadStoredAccounts();
    accounts = accounts.filter((a) => a.id !== accountObj.id);
    accounts.unshift(accountObj);
    this.accounts = accounts;
    localStorage.setItem("credlyst_accounts", JSON.stringify(accounts));

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
        password,
      });

      if (error) throw error;

      this.currentUser = data.user;
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || email.split("@")[0],
      };
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed");
    }
  }

  async signup(name, email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        throw new Error(
          "Please check your email to confirm your account before logging in.",
        );
      }

      // If we have a session, user is logged in immediately (email confirmation disabled)
      if (data.session) {
        this.currentUser = data.user;
        return {
          id: data.user.id,
          email: data.user.email,
          name: name,
        };
      }

      throw new Error(
        "Signup completed but no session created. Please try logging in.",
      );
    } catch (error) {
      console.error("Signup error:", error);
      throw new Error(error.message || "Signup failed");
    }
  }

  async requestPasswordReset(email) {
    try {
      const redirectTo = `${window.location.origin}/?view=reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Password reset request error:", error);
      throw new Error(error.message || "Unable to send reset email");
    }
  }

  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      if (data.user) {
        this.currentUser = data.user;
      }

      return data.user;
    } catch (error) {
      console.error("Password update error:", error);
      throw new Error(error.message || "Unable to update password");
    }
  }


  async updateProfile({ name, email, avatar_url }) {
    try {
      const metadata = { ...(this.currentUser?.user_metadata || {}) };
      const updatePayload = {};

      if (name !== undefined) {
        metadata.name = name;
      }

      if (avatar_url !== undefined) {
        metadata.avatar_url = avatar_url;
      }

      if (name !== undefined || avatar_url !== undefined) {
        updatePayload.data = metadata;
      }

      if (email) {
        updatePayload.email = email;
      }

      if (Object.keys(updatePayload).length === 0) {
        return this.currentUser;
      }

      const { data, error } = await supabase.auth.updateUser(updatePayload);
      if (error) throw error;

      if (data.user) {
        this.currentUser = data.user;
      }

      return data.user;
    } catch (error) {
      console.error("Profile update error:", error);
      throw new Error(error.message || "Unable to update profile");
    }
  }

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      this.currentUser = null;
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  getToken() {
    return supabase.auth
      .getSession()
      .then(({ data }) => data.session?.access_token);
  }

  getCurrentUser() {
    if (!this.currentUser) return null;
    return {
      id: this.currentUser.id,
      email: this.currentUser.email,
      name:
        this.currentUser.user_metadata?.name ||
        this.currentUser.email?.split("@")[0] ||
        "User",
      avatar_url: this.currentUser.user_metadata?.avatar_url || null,
      raw: this.currentUser,
    };
  }
}

export default new AuthService();
