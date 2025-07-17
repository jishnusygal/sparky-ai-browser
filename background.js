// Sparky AI Browser - Background Service Worker
// The "Brain" that coordinates the AI agent's actions

import { createSimplifiedDOM, delay } from './utils.js';

class SparkyAgent {
    constructor() {
        this.state = 'idle'; // idle, running, finished
        this.currentGoal = '';
        this.apiKey = '';
        this.actionHistory = [];
        this.maxActions = 20; // Prevent infinite loops
        this.currentTabId = null;
        
        this.setupMessageListeners();
        this.setupActionListener();
    }

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep the message channel open for async responses
        });
    }

    setupActionListener() {
        chrome.action.onClicked.addListener(async (tab) => {
            await chrome.sidePanel.open({ tabId: tab.id });
        });
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.type) {
                case 'START_TASK':
                    await this.startTask(message.payload);
                    break;
                    
                case 'DOM_OBSERVATION':
                    await this.processDOMObservation(message.payload, sender.tab.id);
                    break;
                    
                case 'ACTION_COMPLETED':
                    await this.handleActionCompleted(message.payload);
                    break;
                    
                case 'ACTION_ERROR':
                    await this.handleActionError(message.payload);
                    break;
                    
                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Error handling message:', error);
            await this.sendStatusUpdate(`Error: ${error.message}`, 'error');
        }
    }

    async startTask(payload) {
        if (this.state === 'running') {
            await this.sendStatusUpdate('Task already running. Please wait for completion.', 'error');
            return;
        }

        this.state = 'running';
        this.currentGoal = payload.goal;
        this.apiKey = payload.apiKey;
        this.actionHistory = [];
        
        // Get active tab
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        this.currentTabId = activeTab.id;

        await this.sendStatusUpdate('🚀 Starting agentic browsing...', 'info');
        await this.sendStatusUpdate(`🎯 Goal: ${this.currentGoal}`, 'info');
        
        // Start the agentic loop
        await this.runAgenticLoop();
    }

    async runAgenticLoop() {
        try {
            for (let actionCount = 0; actionCount < this.maxActions; actionCount++) {
                if (this.state !== 'running') break;

                await this.sendStatusUpdate(`🔍 Observing page (Action ${actionCount + 1}/${this.maxActions})...`, 'info');
                
                // Step 1: Observe the current page
                await this.injectContentScriptAndObserve();
                
                // The loop will continue when we receive the DOM observation
                // We break here and let processDOMObservation continue the loop
                break;
            }
            
            if (this.actionHistory.length >= this.maxActions) {
                await this.finishTask('Maximum actions reached. Task may be too complex or impossible to complete.');
            }
        } catch (error) {
            console.error('Error in agentic loop:', error);
            await this.sendError(`Agentic loop error: ${error.message}`);
        }
    }

    async injectContentScriptAndObserve() {
        try {
            // Inject content script
            await chrome.scripting.executeScript({
                target: { tabId: this.currentTabId },
                files: ['utils.js', 'content_script.js']
            });

            // Wait a moment for script to load
            await delay(500);

            // Request observation
            await chrome.tabs.sendMessage(this.currentTabId, {
                type: 'OBSERVE'
            });
        } catch (error) {
            console.error('Error injecting content script:', error);
            await this.sendError(`Failed to observe page: ${error.message}`);
        }
    }

    async processDOMObservation(domData, tabId) {
        try {
            await this.sendStatusUpdate('🧠 Thinking about next action...', 'info');
            
            // Step 2: Think - Get decision from Gemini API
            const decision = await this.getAIDecision(domData);
            
            if (!decision) {
                await this.sendError('Failed to get AI decision');
                return;
            }

            await this.sendStatusUpdate(`💭 AI Decision: ${decision.thought}`, 'info');
            
            // Step 3: Act based on decision
            if (decision.command === 'FINISH') {
                await this.finishTask(decision.answer || 'Task completed successfully!');
                return;
            }
            
            // Record the action
            this.actionHistory.push({
                action: decision,
                timestamp: Date.now()
            });
            
            // Step 4: Execute the action
            await this.executeAction(decision, tabId);
            
        } catch (error) {
            console.error('Error processing DOM observation:', error);
            await this.sendError(`Error processing observation: ${error.message}`);
        }
    }

    async getAIDecision(domData) {
        const prompt = this.constructPrompt(domData);
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        topK: 1,
                        topP: 1,
                        maxOutputTokens: 1000,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const text = data.candidates[0]?.content?.parts[0]?.text;
            
            if (!text) {
                throw new Error('No response from Gemini API');
            }

            // Parse JSON response
            const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/) || text.match(/({[\s\S]*})/);
            if (!jsonMatch) {
                throw new Error('Could not parse JSON from AI response');
            }

            return JSON.parse(jsonMatch[1]);
        } catch (error) {
            console.error('Gemini API error:', error);
            throw error;
        }
    }

    constructPrompt(domData) {
        const historyText = this.actionHistory.length > 0 
            ? `\n\nPrevious actions taken:\n${this.actionHistory.map(h => `- ${h.action.command}: ${h.action.thought}`).join('\n')}` 
            : '';
            
        return `You are Sparky, an expert web automation agent. Your goal is to achieve the user's objective by navigating a website.

USER'S GOAL: ${this.currentGoal}

CURRENT PAGE ELEMENTS (JSON):
${JSON.stringify(domData, null, 2)}
${historyText}

Provide your response as a JSON object with this exact structure:
{
  "thought": "Your brief reasoning for the chosen command",
  "command": "CLICK|TYPE|SCROLL|WAIT|FINISH",
  "targetId": "agent-id of element (required for CLICK/TYPE)",
  "text": "text to type (required for TYPE)",
  "scrollDirection": "UP|DOWN (required for SCROLL)",
  "answer": "final answer to user's goal (required for FINISH)"
}

Rules:
1. Only use the 'agent-id' values from the provided elements
2. If you have enough information to answer the user's goal, use FINISH
3. Be methodical and take one action at a time
4. If you can't find what you need, try scrolling or looking for navigation elements
5. Always wrap your JSON in \`\`\`json code blocks

Respond with only the JSON object wrapped in code blocks.`;
    }

    async executeAction(decision, tabId) {
        try {
            const actionMessage = {
                type: 'EXECUTE_ACTION',
                payload: decision
            };

            await this.sendActionUpdate(`${decision.command}: ${decision.thought}`);
            
            // Send action to content script
            await chrome.tabs.sendMessage(tabId, actionMessage);
            
        } catch (error) {
            console.error('Error executing action:', error);
            await this.sendError(`Failed to execute action: ${error.message}`);
        }
    }

    async handleActionCompleted(payload) {
        await this.sendStatusUpdate(`✅ Action completed: ${payload.message || 'Success'}`, 'success');
        
        // Continue the agentic loop after a short delay
        await delay(1000);
        
        if (this.state === 'running' && this.actionHistory.length < this.maxActions) {
            await this.runAgenticLoop();
        }
    }

    async handleActionError(payload) {
        await this.sendStatusUpdate(`⚠️ Action failed: ${payload.error}`, 'error');
        
        // Try to continue with a shorter delay
        await delay(2000);
        
        if (this.state === 'running' && this.actionHistory.length < this.maxActions) {
            await this.runAgenticLoop();
        }
    }

    async finishTask(answer) {
        this.state = 'finished';
        await chrome.runtime.sendMessage({
            type: 'AGENT_FINISHED',
            payload: { answer }
        });
    }

    async sendStatusUpdate(status, level = 'info') {
        await chrome.runtime.sendMessage({
            type: 'AGENT_STATUS_UPDATE',
            payload: { status, level }
        });
    }

    async sendActionUpdate(action) {
        await chrome.runtime.sendMessage({
            type: 'AGENT_ACTION',
            payload: { action }
        });
    }

    async sendError(error) {
        this.state = 'idle';
        await chrome.runtime.sendMessage({
            type: 'AGENT_ERROR',
            payload: { error }
        });
    }
}

// Initialize the agent when the service worker starts
const sparkyAgent = new SparkyAgent();

// Handle extension installation
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
        console.log('🐕 Sparky AI Browser installed successfully!');
        
        // Open side panel on installation
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTab) {
            await chrome.sidePanel.open({ tabId: activeTab.id });
        }
    }
});