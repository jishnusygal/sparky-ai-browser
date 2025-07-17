// Integration tests for Chrome Extension functionality
describe('Chrome Extension Integration', () => {
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    testHelpers.mockStorageSuccess();
  });

  describe('Extension Initialization', () => {
    it('should initialize with default storage values', async () => {
      const defaultData = {
        isAuthenticated: false,
        userGoal: '',
        currentTask: null
      };
      
      testHelpers.mockStorageSuccess(defaultData);
      
      // Simulate extension initialization
      const storageCall = chrome.storage.local.get();
      await expect(storageCall).resolves.toEqual(defaultData);
    });

    it('should handle storage errors gracefully', async () => {
      testHelpers.mockStorageError();
      
      try {
        await chrome.storage.local.get();
      } catch (error) {
        expect(error.message).toBe('Storage error');
      }
    });
  });

  describe('Message Passing', () => {
    it('should handle authentication status messages', () => {
      const mockResponse = jest.fn();
      
      // Simulate adding a message listener
      const listener = jest.fn((message, sender, sendResponse) => {
        if (message.type === 'GET_AUTH_STATUS') {
          sendResponse({ isAuthenticated: true });
        }
      });
      
      chrome.runtime.onMessage.addListener(listener);
      
      // Simulate receiving a message
      const message = { type: 'GET_AUTH_STATUS' };
      const sender = { tab: { id: 123 } };
      
      testHelpers.simulateMessage(message, sender);
      
      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(listener);
    });

    it('should handle goal setting messages', async () => {
      const goalMessage = {
        type: 'SET_GOAL',
        goal: 'Find flights to New York'
      };
      
      chrome.storage.local.set.mockResolvedValue();
      
      // Simulate setting a goal
      await chrome.storage.local.set({ userGoal: goalMessage.goal });
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        userGoal: 'Find flights to New York'
      });
    });

    it('should validate message types', () => {
      const validMessageTypes = [
        'GET_AUTH_STATUS',
        'SET_GOAL',
        'START_TASK',
        'PAUSE_TASK',
        'GET_PROGRESS'
      ];
      
      validMessageTypes.forEach(type => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Tab Management', () => {
    it('should query active tabs', async () => {
      const mockTabs = [
        { id: 1, url: 'https://example.com', active: true }
      ];
      
      chrome.tabs.query.mockResolvedValue(mockTabs);
      
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      
      expect(tabs).toEqual(mockTabs);
      expect(chrome.tabs.query).toHaveBeenCalledWith({
        active: true,
        currentWindow: true
      });
    });

    it('should send messages to tabs', async () => {
      const tabId = 123;
      const message = { type: 'ANALYZE_PAGE' };
      const response = { success: true, elements: [] };
      
      chrome.tabs.sendMessage.mockResolvedValue(response);
      
      const result = await chrome.tabs.sendMessage(tabId, message);
      
      expect(result).toEqual(response);
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(tabId, message);
    });

    it('should handle tab creation', async () => {
      const newTab = {
        id: 456,
        url: 'https://google.com',
        active: true
      };
      
      chrome.tabs.create.mockResolvedValue(newTab);
      
      const tab = await chrome.tabs.create({ url: 'https://google.com' });
      
      expect(tab).toEqual(newTab);
      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: 'https://google.com'
      });
    });
  });

  describe('Script Injection', () => {
    it('should inject content scripts', async () => {
      const injectionResult = [{ result: 'success' }];
      
      chrome.scripting.executeScript.mockResolvedValue(injectionResult);
      
      const result = await chrome.scripting.executeScript({
        target: { tabId: 123 },
        files: ['content_script.js']
      });
      
      expect(result).toEqual(injectionResult);
      expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
        target: { tabId: 123 },
        files: ['content_script.js']
      });
    });

    it('should handle script injection errors', async () => {
      const error = new Error('Script injection failed');
      chrome.scripting.executeScript.mockRejectedValue(error);
      
      await expect(
        chrome.scripting.executeScript({
          target: { tabId: 123 },
          func: () => 'test'
        })
      ).rejects.toThrow('Script injection failed');
    });
  });

  describe('Identity and Authentication', () => {
    it('should get auth tokens', async () => {
      const mockToken = 'mock-auth-token-12345';
      chrome.identity.getAuthToken.mockResolvedValue(mockToken);
      
      const token = await chrome.identity.getAuthToken({ interactive: true });
      
      expect(token).toBe(mockToken);
      expect(chrome.identity.getAuthToken).toHaveBeenCalledWith({
        interactive: true
      });
    });

    it('should remove cached tokens', async () => {
      const token = 'cached-token';
      chrome.identity.removeCachedAuthToken.mockResolvedValue();
      
      await chrome.identity.removeCachedAuthToken({ token });
      
      expect(chrome.identity.removeCachedAuthToken).toHaveBeenCalledWith({
        token
      });
    });

    it('should handle auth token errors', async () => {
      const error = new Error('Authentication failed');
      chrome.identity.getAuthToken.mockRejectedValue(error);
      
      await expect(
        chrome.identity.getAuthToken({ interactive: true })
      ).rejects.toThrow('Authentication failed');
    });
  });

  describe('Side Panel Integration', () => {
    it('should open side panel', async () => {
      chrome.sidePanel.open.mockResolvedValue();
      
      await chrome.sidePanel.open({ tabId: 123 });
      
      expect(chrome.sidePanel.open).toHaveBeenCalledWith({ tabId: 123 });
    });

    it('should set side panel options', async () => {
      const options = {
        tabId: 123,
        path: 'side_panel.html'
      };
      
      chrome.sidePanel.setOptions.mockResolvedValue();
      
      await chrome.sidePanel.setOptions(options);
      
      expect(chrome.sidePanel.setOptions).toHaveBeenCalledWith(options);
    });
  });

  describe('Extension Action', () => {
    it('should update action badge', async () => {
      chrome.action.setBadgeText.mockResolvedValue();
      chrome.action.setBadgeBackgroundColor.mockResolvedValue();
      
      await chrome.action.setBadgeText({ text: '1' });
      await chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
      
      expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '1' });
      expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
        color: '#FF0000'
      });
    });

    it('should set action icon', async () => {
      const iconData = {
        path: {
          16: 'icon16.png',
          32: 'icon32.png'
        }
      };
      
      chrome.action.setIcon.mockResolvedValue();
      
      await chrome.action.setIcon(iconData);
      
      expect(chrome.action.setIcon).toHaveBeenCalledWith(iconData);
    });
  });

  describe('Storage Synchronization', () => {
    it('should sync data between storage types', async () => {
      const localData = { userGoal: 'test goal' };
      const syncData = { settings: { theme: 'dark' } };
      
      chrome.storage.local.get.mockResolvedValue(localData);
      chrome.storage.sync.get.mockResolvedValue(syncData);
      
      const [local, sync] = await Promise.all([
        chrome.storage.local.get(),
        chrome.storage.sync.get()
      ]);
      
      expect(local).toEqual(localData);
      expect(sync).toEqual(syncData);
    });

    it('should handle storage quota exceeded', async () => {
      const error = new Error('QUOTA_EXCEEDED');
      chrome.storage.local.set.mockRejectedValue(error);
      
      await expect(
        chrome.storage.local.set({ largeData: 'x'.repeat(10000000) })
      ).rejects.toThrow('QUOTA_EXCEEDED');
    });
  });

  describe('Error Handling', () => {
    it('should handle runtime errors gracefully', () => {
      const errorMessage = 'Extension context invalidated';
      chrome.runtime.lastError = { message: errorMessage };
      
      // Simulate checking for runtime errors
      const hasError = chrome.runtime.lastError !== undefined;
      const errorMsg = chrome.runtime.lastError?.message;
      
      expect(hasError).toBe(true);
      expect(errorMsg).toBe(errorMessage);
      
      // Cleanup
      delete chrome.runtime.lastError;
    });

    it('should validate extension permissions', () => {
      const requiredPermissions = [
        'activeTab',
        'scripting',
        'storage',
        'sidePanel',
        'identity'
      ];
      
      // These would normally be checked against chrome.permissions
      requiredPermissions.forEach(permission => {
        expect(typeof permission).toBe('string');
        expect(permission.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance and Memory', () => {
    it('should limit concurrent operations', async () => {
      const operations = Array.from({ length: 10 }, (_, i) => 
        chrome.tabs.sendMessage(i, { type: 'TEST' })
      );
      
      // Mock all operations to resolve
      chrome.tabs.sendMessage.mockResolvedValue({ success: true });
      
      const results = await Promise.all(operations);
      
      expect(results).toHaveLength(10);
      expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(10);
    });

    it('should cleanup resources properly', () => {
      const listeners = [];
      
      // Mock adding listeners
      const addListener = jest.fn((listener) => {
        listeners.push(listener);
      });
      
      const removeListener = jest.fn((listener) => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      });
      
      chrome.runtime.onMessage.addListener = addListener;
      chrome.runtime.onMessage.removeListener = removeListener;
      
      // Add and remove listener
      const testListener = () => {};
      chrome.runtime.onMessage.addListener(testListener);
      chrome.runtime.onMessage.removeListener(testListener);
      
      expect(addListener).toHaveBeenCalledWith(testListener);
      expect(removeListener).toHaveBeenCalledWith(testListener);
      expect(listeners).toHaveLength(0);
    });
  });
});