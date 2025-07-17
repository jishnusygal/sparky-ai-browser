// Sparky AI Browser - Side Panel Logic with Google OAuth
// Handles UI interactions, authentication, and communication with background script

class SidePanelUI {
    constructor() {
        this.isTaskRunning = false;
        this.googleAuth = new GoogleAuthService();
        this.currentUser = null;
        this.authMode = 'google'; // 'google' or 'manual'
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeAuthentication();
    }

    initializeElements() {
        // Authentication elements
        this.googleSignInBtn = document.getElementById('googleSignInBtn');
        this.signOutBtn = document.getElementById('signOutBtn');
        this.showManualSetupBtn = document.getElementById('showManualSetup');
        this.showGoogleSignInBtn = document.getElementById('showGoogleSignIn');
        
        // Sections
        this.googleSignInSection = document.getElementById('googleSignInSection');
        this.userProfileSection = document.getElementById('userProfileSection');
        this.manualApiKeySection = document.getElementById('manualApiKeySection');
        
        // User profile elements
        this.userAvatar = document.getElementById('userAvatar');
        this.userName = document.getElementById('userName');
        this.userEmail = document.getElementById('userEmail');
        
        // Form elements
        this.apiKeyInput = document.getElementById('apiKey');
        this.goalInput = document.getElementById('goalInput');
        this.startTaskBtn = document.getElementById('startTaskBtn');
        this.startTaskBtnText = document.getElementById('startTaskBtnText');
        
        // Status elements
        this.statusArea = document.getElementById('statusArea');
        this.finalAnswerArea = document.getElementById('finalAnswerArea');
    }

    setupEventListeners() {
        // Authentication buttons
        this.googleSignInBtn.addEventListener('click', () => this.handleGoogleSignIn());
        this.signOutBtn.addEventListener('click', () => this.handleSignOut());
        this.showManualSetupBtn.addEventListener('click', () => this.showManualSetup());
        this.showGoogleSignInBtn.addEventListener('click', () => this.showGoogleSignIn());

        // Task management
        this.startTaskBtn.addEventListener('click', () => this.handleStartTask());

        // API key management (manual mode)
        if (this.apiKeyInput) {
            this.apiKeyInput.addEventListener('input', () => this.saveApiKey());
        }

        // Keyboard shortcuts
        this.goalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey && this.startTaskBtn.disabled === false) {
                this.handleStartTask();
            }
        });

        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleBackgroundMessage(message);
        });
    }

    async initializeAuthentication() {
        try {
            // Check if user is already signed in
            const isSignedIn = await this.googleAuth.checkSignInStatus();
            
            if (isSignedIn) {
                this.currentUser = this.googleAuth.getCurrentUser();
                this.showUserProfile();
                this.addStatusUpdate('✅ Welcome back! You\\'re signed in and ready to go.', 'success');
            } else {
                // Check for manual API key
                await this.loadSavedApiKey();
                this.showGoogleSignIn();
            }
        } catch (error) {
            console.error('Error initializing authentication:', error);
            this.showGoogleSignIn();
            this.addStatusUpdate('Welcome to Sparky! Sign in with Google for the easiest setup.', 'info');
        }
    }

    async handleGoogleSignIn() {
        try {
            this.addStatusUpdate('🔐 Signing in with Google...', 'info');
            this.googleSignInBtn.disabled = true;
            this.googleSignInBtn.innerHTML = '<span>⏳</span><span>Signing in...</span>';

            const user = await this.googleAuth.signIn();
            this.currentUser = user;
            
            this.addStatusUpdate(`👋 Welcome ${user.given_name || user.name}! Setting up your API access...`, 'success');
            
            // Attempt to get/setup API key
            try {
                await this.googleAuth.getGeminiApiKey();
                this.addStatusUpdate('✅ API access configured! You\\'re ready to start using Sparky.', 'success');
            } catch (apiError) {
                this.addStatusUpdate('⚠️ API setup needed. Please follow the guidance to complete setup.', 'info');
            }
            
            this.showUserProfile();
            
        } catch (error) {
            console.error('Google Sign-In failed:', error);
            this.addStatusUpdate(`❌ Sign-in failed: ${error.message}`, 'error');
            this.resetGoogleSignInButton();
        }
    }

    async handleSignOut() {
        try {
            this.addStatusUpdate('👋 Signing out...', 'info');
            await this.googleAuth.signOut();
            this.currentUser = null;
            this.showGoogleSignIn();
            this.addStatusUpdate('✅ Signed out successfully.', 'success');
            this.clearResults();
        } catch (error) {
            console.error('Sign-out failed:', error);
            this.addStatusUpdate(`❌ Sign-out failed: ${error.message}`, 'error');
        }
    }

    showGoogleSignIn() {
        this.authMode = 'google';
        this.googleSignInSection.classList.remove('hidden');
        this.userProfileSection.classList.add('hidden');
        this.manualApiKeySection.classList.add('hidden');
        this.resetGoogleSignInButton();
        this.updateStartButton();
    }

    showUserProfile() {
        if (!this.currentUser) return;

        this.googleSignInSection.classList.add('hidden');
        this.userProfileSection.classList.remove('hidden');
        this.manualApiKeySection.classList.add('hidden');

        // Update profile display
        this.userAvatar.src = this.currentUser.picture || '';
        this.userName.textContent = this.currentUser.name || 'User';
        this.userEmail.textContent = this.currentUser.email || '';

        this.updateStartButton();
    }

    showManualSetup() {
        this.authMode = 'manual';
        this.googleSignInSection.classList.add('hidden');
        this.userProfileSection.classList.add('hidden');
        this.manualApiKeySection.classList.remove('hidden');
        this.updateStartButton();
        
        // Focus on API key input
        setTimeout(() => this.apiKeyInput.focus(), 100);
    }

    resetGoogleSignInButton() {
        this.googleSignInBtn.disabled = false;
        this.googleSignInBtn.innerHTML = `
            <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Sign in with Google</span>
        `;
    }

    updateStartButton() {
        const hasAuth = this.currentUser || (this.authMode === 'manual' && this.apiKeyInput?.value?.trim());
        
        if (hasAuth) {
            this.startTaskBtn.disabled = false;
            this.startTaskBtnText.textContent = 'Start Task';
        } else {
            this.startTaskBtn.disabled = true;
            if (this.authMode === 'google') {
                this.startTaskBtnText.textContent = 'Sign in to start';
            } else {
                this.startTaskBtnText.textContent = 'Enter API key to start';
            }
        }
    }

    async loadSavedApiKey() {
        try {
            const result = await chrome.storage.local.get(['geminiApiKey']);
            if (result.geminiApiKey && this.apiKeyInput) {
                this.apiKeyInput.value = result.geminiApiKey;
                this.updateStartButton();
            }
        } catch (error) {
            console.error('Error loading API key:', error);
        }
    }

    async saveApiKey() {
        try {
            if (this.apiKeyInput?.value) {
                await chrome.storage.local.set({
                    geminiApiKey: this.apiKeyInput.value
                });
                this.updateStartButton();
            }
        } catch (error) {
            console.error('Error saving API key:', error);
        }
    }

    async handleStartTask() {
        const goal = this.goalInput.value.trim();

        // Validation
        if (!goal) {
            this.showError('Please enter a goal for Sparky to accomplish.');
            return;
        }

        let apiKey = null;

        // Get API key based on auth mode
        if (this.currentUser) {
            // Google authenticated user
            try {
                apiKey = await this.googleAuth.getGeminiApiKey();
            } catch (error) {
                this.showError('Failed to get API access. Please try signing in again.');
                return;
            }
        } else if (this.authMode === 'manual') {
            // Manual API key entry
            apiKey = this.apiKeyInput.value.trim();
            if (!apiKey) {
                this.showError('Please enter your Gemini API key.');
                return;
            }
        } else {
            this.showError('Please sign in or enter an API key to continue.');
            return;
        }

        // Disable UI while task is running
        this.setTaskRunning(true);
        this.clearResults();
        this.addStatusUpdate('🐕 Sparky is getting ready...', 'info');

        try {
            // Send message to background script to start the task
            await chrome.runtime.sendMessage({
                type: 'START_TASK',
                payload: {
                    goal: goal,
                    apiKey: apiKey
                }
            });
        } catch (error) {
            console.error('Error starting task:', error);
            this.showError('Failed to start task. Please try again.');
            this.setTaskRunning(false);
        }
    }

    handleBackgroundMessage(message) {
        switch (message.type) {
            case 'AGENT_STATUS_UPDATE':
                this.addStatusUpdate(message.payload.status, message.payload.level || 'info');
                break;

            case 'AGENT_FINISHED':
                this.handleTaskFinished(message.payload);
                break;

            case 'AGENT_ERROR':
                this.handleTaskError(message.payload.error);
                break;

            case 'AGENT_ACTION':
                this.addStatusUpdate(`🎯 ${message.payload.action}`, 'action');
                break;

            default:
                console.log('Unknown message type:', message.type);
        }
    }

    handleTaskFinished(payload) {
        this.setTaskRunning(false);
        this.addStatusUpdate('✅ Task completed successfully!', 'success');
        
        if (payload.answer) {
            this.showFinalAnswer(payload.answer);
        }
    }

    handleTaskError(error) {
        this.setTaskRunning(false);
        this.addStatusUpdate(`❌ Error: ${error}`, 'error');
    }

    setTaskRunning(isRunning) {
        this.isTaskRunning = isRunning;
        
        // Update button state
        if (isRunning) {
            this.startTaskBtn.classList.add('loading');
            this.startTaskBtn.innerHTML = '<span>⏳</span><span>Working...</span>';
            this.startTaskBtn.disabled = true;
        } else {
            this.startTaskBtn.classList.remove('loading');
            this.startTaskBtn.innerHTML = '<span>🚀</span><span id="startTaskBtnText">Start Task</span>';
            this.startTaskBtnText = document.getElementById('startTaskBtnText');
            this.updateStartButton();
        }

        // Update input states
        if (this.apiKeyInput) this.apiKeyInput.disabled = isRunning;
        this.goalInput.disabled = isRunning;
        
        // Disable auth buttons while task is running
        this.googleSignInBtn.disabled = isRunning;
        if (this.signOutBtn) this.signOutBtn.disabled = isRunning;
    }

    addStatusUpdate(message, level = 'info') {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const statusElement = document.createElement('div');
        statusElement.className = 'status-update mb-2 last:mb-0';
        
        let className = '';
        switch (level) {
            case 'error':
                className = 'error-text';
                break;
            case 'success':
                className = 'success-text';
                break;
            case 'action':
                className = 'text-blue-600 font-medium';
                break;
            default:
                className = 'text-gray-700';
        }

        statusElement.innerHTML = `
            <div class="${className}">
                <span class="text-xs text-gray-400">[${timestamp}]</span> ${message}
            </div>
        `;

        this.statusArea.appendChild(statusElement);
        
        // Auto-scroll to bottom
        this.statusArea.scrollTop = this.statusArea.scrollHeight;

        // Remove placeholder text if it exists
        const placeholder = this.statusArea.querySelector('.text-amber-500');
        if (placeholder) {
            placeholder.remove();
        }
    }

    showFinalAnswer(answer) {
        this.finalAnswerArea.innerHTML = `
            <div class="success-text">
                <strong>🎉 Mission Accomplished!</strong><br>
                ${answer}
            </div>
        `;
    }

    showError(message) {
        this.addStatusUpdate(`❌ ${message}`, 'error');
    }

    clearResults() {
        this.statusArea.innerHTML = '';
        this.finalAnswerArea.innerHTML = '<div class="text-gray-400 italic">Your result will appear here...</div>';
    }
}

// Initialize the UI when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SidePanelUI();
});

// Handle side panel opening
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'OPEN_SIDE_PANEL') {
        // Panel is already open, just focus on goal input
        document.getElementById('goalInput').focus();
    }
});