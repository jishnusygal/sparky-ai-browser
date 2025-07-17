// Sparky AI Browser - Enhanced Content Script
// The "Hands" that interact with web pages with robust DOM scanning and visual feedback

(function() {
    'use strict';
    
    class SparkyHands {
        constructor() {
            this.agentIdCounter = 1;
            this.elementMap = new Map(); // Maps agent-id to actual DOM elements
            this.isObserving = false;
            this.visualIndicatorStyle = null;
            
            this.setupMessageListener();
            this.injectVisualStyles();
            console.log('🐕 Sparky hands are ready with enhanced DOM scanning!');
        }

        setupMessageListener() {
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                this.handleMessage(message, sender, sendResponse);
                return true; // Keep message channel open for async responses
            });
        }

        /**
         * Inject CSS styles for visual feedback
         */
        injectVisualStyles() {
            if (this.visualIndicatorStyle) return;

            this.visualIndicatorStyle = document.createElement('style');
            this.visualIndicatorStyle.textContent = `
                .sparky-highlight {
                    outline: 3px solid #ff4444 !important;
                    outline-offset: 2px !important;
                    box-shadow: 0 0 0 6px rgba(255, 68, 68, 0.3) !important;
                    background-color: rgba(255, 68, 68, 0.1) !important;
                    transition: all 0.3s ease !important;
                    z-index: 10000 !important;
                    position: relative !important;
                }
                
                .sparky-highlight::before {
                    content: "🐕 Sparky is interacting with this element";
                    position: absolute;
                    top: -35px;
                    left: 0;
                    background: #ff4444;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    white-space: nowrap;
                    z-index: 10001;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }
                
                .sparky-thinking {
                    outline: 2px dashed #ffa500 !important;
                    outline-offset: 2px !important;
                    animation: sparky-thinking-pulse 1.5s infinite;
                }
                
                @keyframes sparky-thinking-pulse {
                    0%, 100% { outline-color: #ffa500; }
                    50% { outline-color: #ff6b35; }
                }
            `;
            document.head.appendChild(this.visualIndicatorStyle);
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
                
                // Remove any existing agent IDs
                this.cleanupAgentIds();
                
                // Create enhanced simplified DOM representation
                const simplifiedDOM = this.createEnhancedSimplifiedDOM();
                
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

        /**
         * Remove any existing agent IDs from previous observations
         */
        cleanupAgentIds() {
            const existingElements = document.querySelectorAll('[data-agent-id]');
            existingElements.forEach(el => el.removeAttribute('data-agent-id'));
        }

        /**
         * Create an enhanced simplified DOM representation with proper agent IDs
         */
        createEnhancedSimplifiedDOM() {
            const elements = [];
            
            // Define comprehensive selectors for interactive elements
            const interactiveSelectors = [
                // Primary interactive elements
                'a[href]:not([href=""])',
                'button:not([disabled])',
                'input:not([disabled]):not([type="hidden"])',
                'textarea:not([disabled])',
                'select:not([disabled])',
                
                // Elements with click handlers
                '[onclick]',
                '[role="button"]:not([disabled])',
                '[role="link"]',
                '[role="tab"]',
                '[role="menuitem"]',
                '[role="option"]',
                
                // Common interactive classes and attributes
                '.btn:not([disabled])',
                '.button:not([disabled])',
                '[data-testid]',
                '[data-action]',
                '[type="submit"]:not([disabled])',
                '[type="button"]:not([disabled])',
                
                // Form elements
                'form',
                'label[for]',
                
                // Content elements that might be clickable
                '[tabindex]:not([tabindex="-1"])',
                'summary', // Details/summary elements
                
                // Navigation elements
                'nav a',
                '.nav-link',
                '.menu-item'
            ];
            
            // Also include important text elements for context
            const contextSelectors = [
                'h1, h2, h3, h4, h5, h6',
                '[role="heading"]',
                '.title, .heading',
                'main p:first-of-type', // First paragraph in main content
                '.error, .warning, .alert', // Error messages
                '[aria-live]' // Live regions
            ];
            
            // Process interactive elements first (these get agent IDs)
            const foundInteractiveElements = document.querySelectorAll(interactiveSelectors.join(', '));
            
            foundInteractiveElements.forEach(element => {
                if (!this.isElementUsable(element)) return;
                
                const agentId = `agent-id-${this.agentIdCounter++}`;
                
                // Assign the agent ID to the element
                element.setAttribute('data-agent-id', agentId);
                this.elementMap.set(agentId, element);
                
                const elementData = this.extractEnhancedElementData(element, agentId);
                if (elementData) {
                    elements.push(elementData);
                }
            });
            
            // Add some context elements (these don't get agent IDs, just for context)
            const contextElements = document.querySelectorAll(contextSelectors.join(', '));
            let contextCount = 0;
            
            contextElements.forEach(element => {
                if (contextCount >= 10) return; // Limit context elements
                if (!this.isElementVisible(element)) return;
                
                const elementData = this.extractEnhancedElementData(element, null);
                if (elementData && elementData.text && elementData.text.length > 10) {
                    elementData.isContext = true;
                    elements.push(elementData);
                    contextCount++;
                }
            });
            
            // Enhanced page context
            const pageContext = {
                title: document.title,
                url: window.location.href,
                domain: window.location.hostname,
                hasScrollbar: document.body.scrollHeight > window.innerHeight,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    scrollTop: window.pageYOffset,
                    scrollLeft: window.pageXOffset
                },
                forms: document.forms.length,
                interactiveElements: elements.filter(el => el['agent-id']).length,
                contextElements: elements.filter(el => el.isContext).length
            };
            
            return {
                pageContext,
                elements: elements.slice(0, 60), // Increased limit for better coverage
                timestamp: Date.now()
            };
        }

        /**
         * Enhanced element data extraction with comprehensive attribute capture
         */
        extractEnhancedElementData(element, agentId) {
            const tagName = element.tagName.toLowerCase();
            const data = {
                tag: tagName
            };
            
            // Add agent ID if provided
            if (agentId) {
                data['agent-id'] = agentId;
            }
            
            // Extract and clean text content
            let text = this.getCleanText(element);
            if (text) {
                data.text = text;
            }
            
            // Extract attributes based on element type
            switch (tagName) {
                case 'a':
                    if (element.href && element.href !== window.location.href) {
                        data.href = element.href;
                    }
                    if (element.target) data.target = element.target;
                    if (element.download) data.download = element.download;
                    break;
                    
                case 'input':
                    data.type = element.type || 'text';
                    if (element.placeholder) data.placeholder = element.placeholder;
                    if (element.value && element.type !== 'password') data.value = element.value;
                    if (element.name) data.name = element.name;
                    if (element.required) data.required = true;
                    if (element.checked !== undefined) data.checked = element.checked;
                    if (element.min) data.min = element.min;
                    if (element.max) data.max = element.max;
                    break;
                    
                case 'textarea':
                    if (element.placeholder) data.placeholder = element.placeholder;
                    if (element.value) data.value = element.value.substring(0, 100);
                    if (element.name) data.name = element.name;
                    if (element.required) data.required = true;
                    break;
                    
                case 'button':
                    data.type = element.type || 'button';
                    if (element.form) data.hasForm = true;
                    break;
                    
                case 'select':
                    if (element.name) data.name = element.name;
                    if (element.multiple) data.multiple = true;
                    const options = Array.from(element.options).map(opt => ({
                        value: opt.value,
                        text: opt.text,
                        selected: opt.selected
                    }));
                    data.options = options.slice(0, 10); // Limit options
                    break;
                    
                case 'form':
                    if (element.action) data.action = element.action;
                    if (element.method) data.method = element.method;
                    data.inputCount = element.querySelectorAll('input, textarea, select').length;
                    break;
            }
            
            // Extract common useful attributes
            if (element.id) data.id = element.id;
            if (element.className) data.className = element.className.substring(0, 50);
            if (element.getAttribute('data-testid')) data.testId = element.getAttribute('data-testid');
            if (element.title) data.title = element.title;
            if (element.getAttribute('aria-label')) data.ariaLabel = element.getAttribute('aria-label');
            if (element.getAttribute('role')) data.role = element.getAttribute('role');
            
            // Position information for better targeting
            const rect = element.getBoundingClientRect();
            data.position = {
                top: Math.round(rect.top),
                left: Math.round(rect.left),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                visible: this.isElementVisible(element)
            };
            
            return data;
        }

        /**
         * Get clean, meaningful text from an element
         */
        getCleanText(element) {
            let text = '';
            
            // Try different text extraction methods
            if (element.getAttribute('aria-label')) {
                text = element.getAttribute('aria-label');
            } else if (element.alt) {
                text = element.alt;
            } else if (element.title) {
                text = element.title;
            } else if (element.placeholder) {
                text = element.placeholder;
            } else if (element.value && element.tagName.toLowerCase() !== 'input') {
                text = element.value;
            } else {
                // Get direct text content, not from children
                const clonedElement = element.cloneNode(true);
                const children = clonedElement.querySelectorAll('*');
                children.forEach(child => child.remove());
                text = clonedElement.textContent || element.textContent;
            }
            
            return text ? text.trim().substring(0, 150) : '';
        }

        /**
         * Check if element is usable for interaction
         */
        isElementUsable(element) {
            return this.isElementVisible(element) && 
                   !element.disabled && 
                   !element.readOnly &&
                   !element.hidden &&
                   element.offsetParent !== null;
        }

        /**
         * Enhanced visibility check
         */
        isElementVisible(element) {
            if (!element) return false;
            
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);
            
            return (
                rect.width > 0 &&
                rect.height > 0 &&
                style.display !== 'none' &&
                style.visibility !== 'hidden' &&
                style.opacity !== '0' &&
                rect.top < window.innerHeight + 100 && // Allow some off-screen elements
                rect.bottom > -100 &&
                rect.left < window.innerWidth + 100 &&
                rect.right > -100
            );
        }

        async executeAction(action) {
            try {
                // Add enhanced visual indicator
                await this.addEnhancedVisualIndicator(action);
                
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

        /**
         * Enhanced visual indicator with better feedback
         */
        async addEnhancedVisualIndicator(action) {
            if (action.targetId) {
                const element = this.elementMap.get(action.targetId);
                if (element) {
                    // Remove any existing highlights
                    document.querySelectorAll('.sparky-highlight, .sparky-thinking').forEach(el => {
                        el.classList.remove('sparky-highlight', 'sparky-thinking');
                    });
                    
                    // Scroll element into view
                    element.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'center'
                    });
                    
                    // Add thinking state
                    element.classList.add('sparky-thinking');
                    await this.delay(500);
                    
                    // Switch to action state
                    element.classList.remove('sparky-thinking');
                    element.classList.add('sparky-highlight');
                    
                    // Remove highlight after action
                    setTimeout(() => {
                        element.classList.remove('sparky-highlight');
                    }, 2000);
                }
            }
        }

        async clickElement(targetId) {
            const element = this.elementMap.get(targetId);
            if (!element) {
                throw new Error(`Element with ID ${targetId} not found`);
            }
            
            // Wait for element to be ready
            await this.delay(300);
            
            // Try multiple click methods for robustness
            try {
                // Method 1: Native click
                element.click();
            } catch (error) {
                try {
                    // Method 2: Dispatch click event
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        detail: 1
                    });
                    element.dispatchEvent(clickEvent);
                } catch (secondError) {
                    // Method 3: Focus and trigger
                    element.focus();
                    if (element.tagName.toLowerCase() === 'input' && element.type === 'submit') {
                        element.form?.submit();
                    } else {
                        throw new Error(`Could not click element: ${error.message}`);
                    }
                }
            }
            
            // Wait for potential page changes
            await this.delay(800);
        }

        async typeInElement(targetId, text) {
            const element = this.elementMap.get(targetId);
            if (!element) {
                throw new Error(`Element with ID ${targetId} not found`);
            }
            
            // Wait for element to be ready
            await this.delay(300);
            
            // Focus the element
            element.focus();
            
            // Clear existing value
            if (element.value !== undefined) {
                element.value = '';
            }
            
            // Type character by character for more realistic behavior
            for (let i = 0; i < text.length; i++) {
                element.value = text.substring(0, i + 1);
                
                // Trigger input events
                element.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Small delay between characters
                await this.delay(50);
            }
            
            // Trigger final events
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.dispatchEvent(new Event('blur', { bubbles: true }));
            
            await this.delay(300);
        }

        async scrollPage(direction) {
            const scrollAmount = window.innerHeight * 0.8;
            const currentScroll = window.pageYOffset;
            const scrollY = direction === 'DOWN' ? scrollAmount : -scrollAmount;
            
            window.scrollBy({
                top: scrollY,
                behavior: 'smooth'
            });
            
            // Wait for scroll to complete and content to load
            await this.delay(1500);
            
            // Check if we actually scrolled
            const newScroll = window.pageYOffset;
            if (Math.abs(newScroll - currentScroll) < 50) {
                throw new Error(`Could not scroll ${direction.toLowerCase()}`);
            }
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