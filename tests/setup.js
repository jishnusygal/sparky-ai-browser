// Jest setup for Chrome Extension testing
require('jest-chrome');

// Mock Chrome APIs for testing
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    sendMessage: jest.fn(),
    getURL: jest.fn((path) => `chrome-extension://mock-id/${path}`),
    id: 'mock-extension-id',
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
  },
  tabs: {
    query: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    sendMessage: jest.fn(),
    executeScript: jest.fn(),
  },
  scripting: {
    executeScript: jest.fn(),
  },
  action: {
    setIcon: jest.fn(),
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn(),
  },
  sidePanel: {
    open: jest.fn(),
    setOptions: jest.fn(),
  },
  identity: {
    getAuthToken: jest.fn(),
    removeCachedAuthToken: jest.fn(),
    launchWebAuthFlow: jest.fn(),
  },
};

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Mock DOM methods that might be used
Object.defineProperty(window, 'location', {
  value: {
    href: 'chrome-extension://mock-id/side_panel.html',
    origin: 'chrome-extension://mock-id',
  },
  writable: true,
});

// Setup console spies for testing console output
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test helpers
global.testHelpers = {
  // Helper to simulate Chrome message passing
  simulateMessage: (message, sender = {}) => {
    const listener = chrome.runtime.onMessage.addListener.mock.calls[0]?.[0];
    if (listener) {
      return listener(message, sender);
    }
  },
  
  // Helper to mock successful storage operations
  mockStorageSuccess: (data = {}) => {
    chrome.storage.local.get.mockResolvedValue(data);
    chrome.storage.local.set.mockResolvedValue();
  },
  
  // Helper to mock storage errors
  mockStorageError: (error = new Error('Storage error')) => {
    chrome.storage.local.get.mockRejectedValue(error);
    chrome.storage.local.set.mockRejectedValue(error);
  },
  
  // Helper to mock successful fetch
  mockFetchSuccess: (data = {}) => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    });
  },
  
  // Helper to mock fetch errors
  mockFetchError: (error = new Error('Network error')) => {
    global.fetch.mockRejectedValueOnce(error);
  },
};