// Sparky AI Browser - Side Panel Logic
// Handles UI interactions and communication with background script

class SidePanelUI {
    constructor() {
        this.isTaskRunning = false;
        this.initializeElements();
        this.setupEventListeners();
        this.loadSavedApiKey();
    }

    initializeElements() {
        this.apiKeyInput = document.getElementById('apiKey');
        this.goalInput = document.getElementById('goalInput');
        this.startTaskBtn = document.getElementById('startTaskBtn');
        this.statusArea = document.getElementById('statusArea');
        this.finalAnswerArea = document.getElementById('finalAnswerArea');
    }

    setupEventListeners() {
        // Start Task button
        this.startTaskBtn.addEventListener('click', () => this.handleStartTask());

        // Save API key on input
        this.apiKeyInput.addEventListener('input', () => this.saveApiKey());

        // Enter key in goal input to start task
        this.goalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.handleStartTask();
            }
        });

        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleBackgroundMessage(message);
        });
    }

    async loadSavedApiKey() {
        try {
            const result = await chrome.storage.local.get(['geminiApiKey']);
            if (result.geminiApiKey) {
                this.apiKeyInput.value = result.geminiApiKey;
            }
        } catch (error) {
            console.error('Error loading API key:', error);
        }
    }

    async saveApiKey() {
        try {
            await chrome.storage.local.set({
                geminiApiKey: this.apiKeyInput.value
            });
        } catch (error) {
            console.error('Error saving API key:', error);
        }
    }

    async handleStartTask() {
        const goal = this.goalInput.value.trim();
        const apiKey = this.apiKeyInput.value.trim();

        // Validation
        if (!goal) {
            this.showError('Please enter a goal for Sparky to accomplish.');
            return;
        }

        if (!apiKey) {
            this.showError('Please enter your Gemini API key.');
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
            this.startTaskBtn.innerHTML = '<span>🚀</span><span>Start Task</span>';
            this.startTaskBtn.disabled = false;
        }

        // Update input states
        this.apiKeyInput.disabled = isRunning;
        this.goalInput.disabled = isRunning;
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