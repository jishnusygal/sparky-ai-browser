// Sparky AI Browser - Utility Functions
// Shared helper functions across the extension

/**
 * Creates a simplified DOM representation for AI processing
 * @param {Document} document - The document to analyze
 * @returns {Object} Simplified DOM structure
 */
export function createSimplifiedDOM(document = window.document) {
    const elements = [];
    let idCounter = 1;
    
    // Selectors for interactive and important elements
    const interactiveSelectors = [
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
        '[data-testid]',
        '.btn, .button',
        '[type="submit"]'
    ];
    
    const textSelectors = [
        'h1, h2, h3, h4, h5, h6',
        'p',
        '.title, .heading',
        '[role="heading"]'
    ];
    
    // Process interactive elements first
    document.querySelectorAll(interactiveSelectors.join(', ')).forEach(element => {
        if (isElementVisible(element)) {
            const elementData = extractElementInfo(element, `agent-id-${idCounter++}`);
            if (elementData) {
                elements.push(elementData);
            }
        }
    });
    
    // Add some text elements for context
    document.querySelectorAll(textSelectors.join(', ')).forEach(element => {
        if (isElementVisible(element) && elements.length < 40) {
            const elementData = extractElementInfo(element, `agent-id-${idCounter++}`);
            if (elementData) {
                elements.push(elementData);
            }
        }
    });
    
    return {
        pageContext: {
            title: document.title,
            url: window.location.href,
            hasScrollbar: document.body.scrollHeight > window.innerHeight,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        },
        elements: elements.slice(0, 50) // Limit to prevent token overflow
    };
}

/**
 * Extracts relevant information from a DOM element
 * @param {Element} element - The DOM element to analyze
 * @param {string} agentId - The unique ID for the agent to reference
 * @returns {Object|null} Element data or null if not relevant
 */
function extractElementInfo(element, agentId) {
    const tagName = element.tagName.toLowerCase();
    const data = {
        'agent-id': agentId,
        tag: tagName
    };
    
    // Extract text content (limited length)
    const textContent = element.textContent?.trim();
    if (textContent && textContent.length > 0) {
        data.text = textContent.substring(0, 100);
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
            const options = Array.from(element.options).map(opt => opt.text);
            data.options = options.slice(0, 5); // Limit options
            break;
    }
    
    // Extract common useful attributes
    if (element.id) data.id = element.id;
    if (element.className) data.className = element.className;
    if (element.getAttribute('data-testid')) data.testId = element.getAttribute('data-testid');
    if (element.title) data.title = element.title;
    if (element.getAttribute('aria-label')) data.ariaLabel = element.getAttribute('aria-label');
    
    return data;
}

/**
 * Checks if an element is visible and interactable
 * @param {Element} element - The element to check
 * @returns {boolean} True if element is visible
 */
function isElementVisible(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        rect.top < window.innerHeight &&
        rect.bottom > 0
    );
}

/**
 * Creates a delay for async operations
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after the delay
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a unique identifier
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique identifier
 */
export function generateId(prefix = 'sparky') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates if a URL is safe to navigate to
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is safe
 */
export function isValidUrl(url) {
    try {
        const urlObj = new URL(url);
        const safeProtocols = ['http:', 'https:'];
        return safeProtocols.includes(urlObj.protocol);
    } catch {
        return false;
    }
}

/**
 * Sanitizes text input for safe processing
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeText(text) {
    if (typeof text !== 'string') return '';
    
    return text
        .trim()
        .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
        .substring(0, 1000); // Limit length
}

/**
 * Formats a message for display in the UI
 * @param {string} message - Message to format
 * @param {string} level - Message level (info, error, success, warning)
 * @returns {Object} Formatted message object
 */
export function formatMessage(message, level = 'info') {
    return {
        text: sanitizeText(message),
        level: level,
        timestamp: new Date().toISOString()
    };
}

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Creates a retry mechanism for async operations
 * @param {Function} asyncFn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delayMs - Delay between retries
 * @returns {Promise} Promise that resolves with the result or rejects after max retries
 */
export async function retryAsync(asyncFn, maxRetries = 3, delayMs = 1000) {
    let lastError;
    
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await asyncFn();
        } catch (error) {
            lastError = error;
            if (i < maxRetries) {
                await delay(delayMs * (i + 1)); // Exponential backoff
            }
        }
    }
    
    throw lastError;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createSimplifiedDOM,
        delay,
        generateId,
        isValidUrl,
        sanitizeText,
        formatMessage,
        debounce,
        retryAsync
    };
}