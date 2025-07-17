// Sparky AI Browser - Content Script
// The "Hands" that interact with web pages

(function() {
    'use strict';
    
    class SparkyHands {
        constructor() {
            this.agentIdCounter = 1;
            this.elementMap = new Map(); // Maps agent-id to actual DOM elements
            this.isObserving = false;
            
            this.setupMessageListener();
            console.log('🐕 Sparky hands are ready!');
        }

        setupMessageListener() {
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                this.handleMessage(message, sender, sendResponse);
                return true; // Keep message channel open for async responses
            });
        }

        async handleMessage(message, sender, sendResponse) {
            try {
                switch (message.type) {
                    case 'OBSERVE':
                        await this.observePage();
                        break;
                        
                    case 'EXECUTE_ACTION':
                        await this.executeAction(message.payload);
                        break;
                        
                    default:
                        console.log('Unknown message type:', message.type);
                }
            } catch (error) {
                console.error('Error in content script:', error);
                await this.sendActionError(error.message);
            }
        }

        async observePage() {
            try {
                this.isObserving = true;
                
                // Clear previous mappings
                this.elementMap.clear();
                this.agentIdCounter = 1;
                
                // Create simplified DOM representation
                const simplifiedDOM = this.createSimplifiedDOM();
                
                // Send observation back to background script
                await chrome.runtime.sendMessage({
                    type: 'DOM_OBSERVATION',
                    payload: simplifiedDOM
                });
                
                this.isObserving = false;
            } catch (error) {
                console.error('Error observing page:', error);
                this.isObserving = false;
                throw error;
            }
        }

        createSimplifiedDOM() {
            const elements = [];
            
            // Define selectors for interactive and important elements
            const selectors = [
                'a[href]',
                'button',
                'input',
                'textarea', 
                'select',
                '[onclick]',
                '[role="button"]',
                '[role="link"]',
                '[role="tab"]',
                '[role="menuitem"]',
                'h1, h2, h3',
                '[data-testid]',
                '.btn, .button',
                '[type="submit"]'
            ];
            
            // Find all matching elements
            const foundElements = document.querySelectorAll(selectors.join(', '));
            
            foundElements.forEach(element => {
                // Skip hidden or non-visible elements
                if (!this.isElementVisible(element)) return;
                
                const agentId = `agent-id-${this.agentIdCounter++}`;
                this.elementMap.set(agentId, element);
                
                const elementData = this.extractElementData(element, agentId);
                if (elementData) {
                    elements.push(elementData);
                }
            });
            
            // Also include some context about the page
            const pageContext = {
                title: document.title,
                url: window.location.href,
                hasScrollbar: document.body.scrollHeight > window.innerHeight
            };
            
            return {
                pageContext,
                elements: elements.slice(0, 50) // Limit to 50 elements to avoid token limits
            };
        }

        extractElementData(element, agentId) {
            const tagName = element.tagName.toLowerCase();
            const data = {
                'agent-id': agentId,
                tag: tagName
            };
            
            // Extract text content
            let text = '';
            if (element.textContent) {
                text = element.textContent.trim().substring(0, 100); // Limit text length
            }
            if (text) {
                data.text = text;
            }
            
            // Extract attributes based on element type
            switch (tagName) {
                case 'a':
                    if (element.href) data.href = element.href;
                    break;
                    
                case 'input':
                    data.type = element.type || 'text';
                    if (element.placeholder) data.placeholder = element.placeholder;
                    if (element.value) data.value = element.value;
                    if (element.name) data.name = element.name;
                    break;
                    
                case 'textarea':
                    if (element.placeholder) data.placeholder = element.placeholder;
                    if (element.value) data.value = element.value;
                    if (element.name) data.name = element.name;
                    break;
                    
                case 'button':
                    data.type = element.type || 'button';
                    break;
                    
                case 'select':
                    if (element.name) data.name = element.name;
                    data.options = Array.from(element.options).map(opt => opt.text).slice(0, 5);
                    break;
            }
            
            // Extract common attributes
            if (element.id) data.id = element.id;
            if (element.className) data.className = element.className;
            if (element.getAttribute('data-testid')) data.testId = element.getAttribute('data-testid');
            if (element.title) data.title = element.title;
            if (element.getAttribute('aria-label')) data.ariaLabel = element.getAttribute('aria-label');
            
            return data;
        }

        isElementVisible(element) {
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);
            
            return (
                rect.width > 0 &&
                rect.height > 0 &&
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                style.opacity !== '0'
            );
        }

        async executeAction(action) {
            try {
                // Add visual indicator
                this.addVisualIndicator(action);
                
                switch (action.command) {
                    case 'CLICK':
                        await this.clickElement(action.targetId);
                        break;
                        
                    case 'TYPE':
                        await this.typeInElement(action.targetId, action.text);
                        break;
                        
                    case 'SCROLL':
                        await this.scrollPage(action.scrollDirection);
                        break;
                        
                    case 'WAIT':
                        await this.waitDelay(action.duration || 2000);
                        break;
                        
                    default:
                        throw new Error(`Unknown command: ${action.command}`);
                }
                
                await this.sendActionCompleted(`${action.command} completed successfully`);
                
            } catch (error) {
                console.error('Error executing action:', error);
                await this.sendActionError(error.message);
            }
        }

        addVisualIndicator(action) {
            if (action.targetId) {
                const element = this.elementMap.get(action.targetId);
                if (element) {
                    // Add red outline briefly
                    const originalOutline = element.style.outline;
                    element.style.outline = '3px solid #ff0000';
                    element.style.outlineOffset = '2px';
                    
                    setTimeout(() => {
                        element.style.outline = originalOutline;
                        element.style.outlineOffset = '';
                    }, 1000);
                    
                    // Scroll element into view
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }

        async clickElement(targetId) {
            const element = this.elementMap.get(targetId);
            if (!element) {
                throw new Error(`Element with ID ${targetId} not found`);
            }
            
            // Wait a moment for visual indicator
            await this.delay(500);
            
            // Try different click methods
            try {
                element.click();
            } catch (error) {
                // Fallback to dispatch event
                const event = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                element.dispatchEvent(event);
            }
            
            // Wait for potential page changes
            await this.delay(1000);
        }

        async typeInElement(targetId, text) {
            const element = this.elementMap.get(targetId);
            if (!element) {
                throw new Error(`Element with ID ${targetId} not found`);
            }
            
            // Wait a moment for visual indicator
            await this.delay(500);
            
            // Focus the element
            element.focus();
            
            // Clear existing value
            element.value = '';
            
            // Type the text
            element.value = text;
            
            // Trigger input events
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            
            await this.delay(500);
        }

        async scrollPage(direction) {
            const scrollAmount = window.innerHeight * 0.8;
            const scrollY = direction === 'DOWN' ? scrollAmount : -scrollAmount;
            
            window.scrollBy({
                top: scrollY,
                behavior: 'smooth'
            });
            
            // Wait for scroll to complete
            await this.delay(1000);
        }

        async waitDelay(duration) {
            await this.delay(duration);
        }

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async sendActionCompleted(message) {
            await chrome.runtime.sendMessage({
                type: 'ACTION_COMPLETED',
                payload: { message }
            });
        }

        async sendActionError(error) {
            await chrome.runtime.sendMessage({
                type: 'ACTION_ERROR',
                payload: { error }
            });
        }
    }

    // Initialize Sparky Hands
    if (!window.sparkyHands) {
        window.sparkyHands = new SparkyHands();
    }
})();