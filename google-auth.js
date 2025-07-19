// Sparky AI Browser - Google Authentication Service
// Handles Google OAuth for seamless Gemini API setup

class GoogleAuthService {
    constructor() {
        this.currentUser = null;
        this.isSignedIn = false;
    }

    /**
     * Initiate Google Sign-In process
     * @returns {Promise<Object>} User profile and auth token
     */
    async signIn() {
        try {
            // Get OAuth token using Chrome Identity API
            const token = await new Promise((resolve, reject) => {
                chrome.identity.getAuthToken({ 
                    interactive: true,
                    scopes: [
                        'https://www.googleapis.com/auth/userinfo.profile',
                        'https://www.googleapis.com/auth/userinfo.email'
                    ]
                }, (token) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(token);
                    }
                });
            });

            // Get user profile information
            const profile = await this.getUserProfile(token);
            
            // Store user data
            this.currentUser = {
                ...profile,
                token: token,
                signedInAt: new Date().toISOString()
            };
            
            this.isSignedIn = true;

            // Save user data to storage
            await chrome.storage.local.set({
                googleUser: this.currentUser,
                isGoogleSignedIn: true
            });

            return this.currentUser;
        } catch (error) {
            console.error('Google Sign-In failed:', error);
            throw new Error(`Google Sign-In failed: ${error.message}`);
        }
    }

    /**
     * Sign out the current user
     */
    async signOut() {
        try {
            if (this.currentUser?.token) {
                // Revoke the token
                await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${this.currentUser.token}`);
                
                // Remove cached token
                await new Promise((resolve) => {
                    chrome.identity.removeCachedAuthToken({ 
                        token: this.currentUser.token 
                    }, resolve);
                });
            }

            // Clear local data
            this.currentUser = null;
            this.isSignedIn = false;

            // Clear storage
            await chrome.storage.local.remove(['googleUser', 'isGoogleSignedIn', 'geminiApiKey']);

            return true;
        } catch (error) {
            console.error('Sign-out failed:', error);
            throw new Error(`Sign-out failed: ${error.message}`);
        }
    }

    /**
     * Get user profile from Google API
     * @param {string} token - OAuth token
     * @returns {Promise<Object>} User profile
     */
    async getUserProfile(token) {
        const response = await fetch(
            `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`
        );

        if (!response.ok) {
            throw new Error(`Failed to get user profile: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Check if user is currently signed in
     * @returns {Promise<boolean>}
     */
    async checkSignInStatus() {
        try {
            const result = await chrome.storage.local.get(['googleUser', 'isGoogleSignedIn']);
            
            if (result.isGoogleSignedIn && result.googleUser) {
                this.currentUser = result.googleUser;
                this.isSignedIn = true;
                
                // Verify token is still valid
                await this.verifyToken();
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error checking sign-in status:', error);
            return false;
        }
    }

    /**
     * Verify the stored token is still valid
     */
    async verifyToken() {
        if (!this.currentUser?.token) return false;

        try {
            const response = await fetch(
                `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${this.currentUser.token}`
            );

            if (!response.ok) {
                // Token is invalid, sign out
                await this.signOut();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Token verification failed:', error);
            await this.signOut();
            return false;
        }
    }

    /**
     * Get or create Gemini API key for the user
     * @returns {Promise<string>} API key
     */
    async getGeminiApiKey() {
        if (!this.isSignedIn) {
            throw new Error('User must be signed in to get API key');
        }

        try {
            // First, check if we have a stored API key
            const result = await chrome.storage.local.get(['geminiApiKey']);
            if (result.geminiApiKey) {
                return result.geminiApiKey;
            }

            // For now, guide user to create API key
            // In the future, this could be automated if Google allows it
            return await this.guidedApiKeySetup();
        } catch (error) {
            console.error('Failed to get Gemini API key:', error);
            throw error;
        }
    }

    /**
     * Guide user through API key setup
     * @returns {Promise<string>} API key
     */
    async guidedApiKeySetup() {
        return new Promise((resolve, reject) => {
            // Create a guided setup flow
            const setupUrl = `https://makersuite.google.com/app/apikey?authuser=${this.currentUser.email}`;
            
            // Open Google AI Studio in a new tab with user's account pre-selected
            chrome.tabs.create({ url: setupUrl }, () => {
                // Listen for when user returns with API key
                // This could be enhanced with a callback URL or messaging
                
                // For now, prompt user to enter the key
                setTimeout(() => {
                    const apiKey = prompt(
                        `Hi ${this.currentUser.given_name}!\\n\\n` +
                        `Please copy your API key from the Google AI Studio tab and paste it here:\\n\\n` +
                        `(The tab should have opened automatically with your Google account)`
                    );
                    
                    if (apiKey && apiKey.trim()) {
                        // Store the API key
                        chrome.storage.local.set({ geminiApiKey: apiKey.trim() });
                        resolve(apiKey.trim());
                    } else {
                        reject(new Error('API key setup cancelled or invalid'));
                    }
                }, 2000); // Give time for tab to load
            });
        });
    }

    /**
     * Get current user information
     * @returns {Object|null} Current user or null if not signed in
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Refresh the access token
     * @returns {Promise<string>} New access token
     */
    async refreshToken() {
        try {
            // Remove old token from cache
            if (this.currentUser?.token) {
                await new Promise((resolve) => {
                    chrome.identity.removeCachedAuthToken({ 
                        token: this.currentUser.token 
                    }, resolve);
                });
            }

            // Get new token
            const token = await new Promise((resolve, reject) => {
                chrome.identity.getAuthToken({ 
                    interactive: false // Don't show UI for refresh
                }, (token) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(token);
                    }
                });
            });

            // Update stored user data
            this.currentUser.token = token;
            await chrome.storage.local.set({ googleUser: this.currentUser });

            return token;
        } catch (error) {
            console.error('Token refresh failed:', error);
            throw error;
        }
    }
}

// Export for browser environment only
if (typeof window !== 'undefined') {
    window.GoogleAuthService = GoogleAuthService;
}