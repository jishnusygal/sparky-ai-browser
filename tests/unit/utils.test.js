// Unit tests for utils.js
import {
  delay,
  generateId,
  isValidUrl,
  sanitizeText,
  formatMessage,
  debounce,
  retryAsync,
  createSimplifiedDOM
} from '../utils.js';

describe('Utils Functions', () => {
  
  describe('delay', () => {
    it('should wait for the specified time', async () => {
      const start = Date.now();
      await delay(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(90); // Allow some margin
    });

    it('should return a promise', () => {
      const result = delay(50);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should use default prefix when none provided', () => {
      const id = generateId();
      expect(id).toMatch(/^sparky-/);
    });

    it('should use custom prefix when provided', () => {
      const id = generateId('test');
      expect(id).toMatch(/^test-/);
    });

    it('should include timestamp and random string', () => {
      const id = generateId('prefix');
      const parts = id.split('-');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('prefix');
      expect(parseInt(parts[1])).toBeGreaterThan(0);
      expect(parts[2]).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe('isValidUrl', () => {
    it('should accept valid HTTPS URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://www.google.com/search?q=test')).toBe(true);
    });

    it('should accept valid HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('should reject invalid protocols', () => {
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
      expect(isValidUrl('chrome://extensions')).toBe(false);
    });

    it('should reject malformed URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('http://')).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(isValidUrl(null)).toBe(false);
      expect(isValidUrl(undefined)).toBe(false);
    });
  });

  describe('sanitizeText', () => {
    it('should remove dangerous characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeText(input);
      expect(result).toBe('scriptalert(xss)/script');
    });

    it('should trim whitespace', () => {
      expect(sanitizeText('  hello world  ')).toBe('hello world');
    });

    it('should limit text length', () => {
      const longText = 'a'.repeat(2000);
      const result = sanitizeText(longText);
      expect(result.length).toBe(1000);
    });

    it('should handle non-string input', () => {
      expect(sanitizeText(123)).toBe('');
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
      expect(sanitizeText({})).toBe('');
    });

    it('should remove HTML entities', () => {
      expect(sanitizeText('Hello & goodbye')).toBe('Hello  goodbye');
      expect(sanitizeText('Quote: "test"')).toBe('Quote: test');
    });
  });

  describe('formatMessage', () => {
    it('should create formatted message with default level', () => {
      const message = formatMessage('Test message');
      expect(message.text).toBe('Test message');
      expect(message.level).toBe('info');
      expect(message.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should accept custom message levels', () => {
      const levels = ['error', 'warning', 'success'];
      levels.forEach(level => {
        const message = formatMessage('Test', level);
        expect(message.level).toBe(level);
      });
    });

    it('should sanitize message text', () => {
      const message = formatMessage('<script>alert(1)</script>');
      expect(message.text).toBe('scriptalert(1)/script');
    });

    it('should include current timestamp', () => {
      const before = new Date().toISOString();
      const message = formatMessage('Test');
      const after = new Date().toISOString();
      
      expect(message.timestamp >= before).toBe(true);
      expect(message.timestamp <= after).toBe(true);
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    afterEach(() => {
      jest.clearAllTimers();
    });

    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments correctly', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);
      
      debouncedFn('arg1', 'arg2');
      jest.advanceTimersByTime(100);
      
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('retryAsync', () => {
    it('should return result on first success', async () => {
      const successFn = jest.fn().mockResolvedValue('success');
      const result = await retryAsync(successFn, 3, 10);
      
      expect(result).toBe('success');
      expect(successFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success');
      
      const result = await retryAsync(mockFn, 3, 10);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should throw last error after max retries', async () => {
      const error = new Error('persistent failure');
      const mockFn = jest.fn().mockRejectedValue(error);
      
      await expect(retryAsync(mockFn, 2, 10)).rejects.toThrow('persistent failure');
      expect(mockFn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should use exponential backoff', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('fail'));
      
      const start = Date.now();
      try {
        await retryAsync(mockFn, 2, 50);
      } catch (e) {
        // Expected to fail
      }
      const duration = Date.now() - start;
      
      // Should take at least 50ms + 100ms (exponential backoff)
      expect(duration).toBeGreaterThanOrEqual(140);
    });
  });

  describe('createSimplifiedDOM', () => {
    let mockDocument;

    beforeEach(() => {
      // Create a mock document
      mockDocument = {
        title: 'Test Page',
        querySelectorAll: jest.fn(),
        body: {
          scrollHeight: 1000
        }
      };

      // Mock window object
      global.window = {
        location: { href: 'https://example.com' },
        innerHeight: 800,
        innerWidth: 1200,
        getComputedStyle: jest.fn(() => ({
          display: 'block',
          visibility: 'visible',
          opacity: '1'
        }))
      };
    });

    it('should extract page context', () => {
      mockDocument.querySelectorAll.mockReturnValue([]);
      
      const result = createSimplifiedDOM(mockDocument);
      
      expect(result.pageContext).toEqual({
        title: 'Test Page',
        url: 'https://example.com',
        hasScrollbar: true,
        viewport: {
          width: 1200,
          height: 800
        }
      });
    });

    it('should process interactive elements', () => {
      const mockButton = {
        tagName: 'BUTTON',
        textContent: 'Click me',
        getBoundingClientRect: () => ({ width: 100, height: 30, top: 100, bottom: 130 }),
        type: 'button',
        id: 'test-button',
        className: 'btn primary',
        getAttribute: jest.fn(),
        title: '',
      };

      mockDocument.querySelectorAll.mockImplementation((selector) => {
        if (selector.includes('button')) {
          return [mockButton];
        }
        return [];
      });

      const result = createSimplifiedDOM(mockDocument);
      
      expect(result.elements).toHaveLength(1);
      expect(result.elements[0]).toMatchObject({
        tag: 'button',
        text: 'Click me',
        type: 'button',
        id: 'test-button',
        className: 'btn primary'
      });
    });

    it('should limit number of elements', () => {
      const mockElements = Array.from({ length: 100 }, (_, i) => ({
        tagName: 'BUTTON',
        textContent: `Button ${i}`,
        getBoundingClientRect: () => ({ width: 100, height: 30, top: 100, bottom: 130 }),
        getAttribute: jest.fn(),
      }));

      mockDocument.querySelectorAll.mockReturnValue(mockElements);
      
      const result = createSimplifiedDOM(mockDocument);
      
      expect(result.elements.length).toBeLessThanOrEqual(50);
    });
  });
});