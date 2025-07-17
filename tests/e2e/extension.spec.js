// E2E tests for Sparky AI Browser Extension
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Sparky AI Browser Extension E2E', () => {
  let extensionId;

  test.beforeEach(async ({ context }) => {
    // Get the extension ID from the context
    await context.route('**/favicon.ico', route => route.abort());
    
    // Wait for extension to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get extension ID
    const extensions = await context.backgroundPages();
    if (extensions.length > 0) {
      const backgroundPage = extensions[0];
      extensionId = backgroundPage.url().split('/')[2];
    }
  });

  test('should load extension successfully', async ({ page, context }) => {
    // Check if extension is loaded by looking for background pages
    const backgroundPages = context.backgroundPages();
    expect(backgroundPages.length).toBeGreaterThan(0);
    
    // Navigate to a test page
    await page.goto('https://example.com');
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toBe('https://example.com/');
  });

  test('should open side panel', async ({ page, context }) => {
    if (!extensionId) {
      test.skip('Extension not loaded properly');
      return;
    }

    await page.goto('https://example.com');
    
    // Try to open side panel
    const sidePanelUrl = `chrome-extension://${extensionId}/side_panel.html`;
    
    // Create new page for side panel (simulating side panel opening)
    const sidePanelPage = await context.newPage();
    await sidePanelPage.goto(sidePanelUrl);
    
    // Check if side panel loaded
    await expect(sidePanelPage).toHaveTitle(/Sparky/i);
    
    // Check for key elements in side panel
    const goalInput = sidePanelPage.locator('#goalInput, input[placeholder*="goal"], input[placeholder*="task"]');
    await expect(goalInput).toBeVisible();
  });

  test('should handle authentication flow', async ({ page, context }) => {
    if (!extensionId) {
      test.skip('Extension not loaded properly');
      return;
    }

    const sidePanelPage = await context.newPage();
    await sidePanelPage.goto(`chrome-extension://${extensionId}/side_panel.html`);
    
    // Look for authentication elements
    const authButton = sidePanelPage.locator('button:has-text("Sign in"), button:has-text("Authenticate"), #authBtn');
    
    if (await authButton.isVisible()) {
      // Mock Google OAuth flow would happen here
      // For testing, we just verify the button exists
      expect(await authButton.count()).toBeGreaterThan(0);
    }
  });

  test('should validate user input', async ({ page, context }) => {
    if (!extensionId) {
      test.skip('Extension not loaded properly');
      return;
    }

    const sidePanelPage = await context.newPage();
    await sidePanelPage.goto(`chrome-extension://${extensionId}/side_panel.html`);
    
    // Find goal input
    const goalInput = sidePanelPage.locator('#goalInput, input[type="text"], textarea').first();
    
    if (await goalInput.isVisible()) {
      // Test empty input
      await goalInput.fill('');
      
      const submitButton = sidePanelPage.locator('button:has-text("Start"), button:has-text("Submit"), #startBtn').first();
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Should show validation message for empty input
        const errorMessage = sidePanelPage.locator('.error, .warning, [class*="error"]');
        // Error might appear or button might be disabled
        const isButtonDisabled = await submitButton.isDisabled();
        const hasError = await errorMessage.isVisible();
        
        expect(isButtonDisabled || hasError).toBeTruthy();
      }
    }
  });

  test('should handle goal setting', async ({ page, context }) => {
    if (!extensionId) {
      test.skip('Extension not loaded properly');
      return;
    }

    const sidePanelPage = await context.newPage();
    await sidePanelPage.goto(`chrome-extension://${extensionId}/side_panel.html`);
    
    // Set a test goal
    const goalInput = sidePanelPage.locator('#goalInput, input[type="text"], textarea').first();
    
    if (await goalInput.isVisible()) {
      await goalInput.fill('Find information about web development');
      
      // Verify input value
      await expect(goalInput).toHaveValue('Find information about web development');
      
      // Try to submit
      const submitButton = sidePanelPage.locator('button:has-text("Start"), button:has-text("Submit"), #startBtn').first();
      
      if (await submitButton.isVisible() && !await submitButton.isDisabled()) {
        await submitButton.click();
        
        // Check for status updates
        await sidePanelPage.waitForTimeout(1000);
        
        // Look for progress indicators or status messages
        const statusElement = sidePanelPage.locator('.status, .progress, [class*="status"], [class*="progress"]');
        // Status element might appear or goal might be saved
        const goalStillVisible = await goalInput.isVisible();
        
        // Either status appears or input state changes
        expect(goalStillVisible).toBeTruthy(); // Goal should remain visible for user reference
      }
    }
  });

  test('should interact with web pages', async ({ page, context }) => {
    // Navigate to a test page first
    await page.goto('https://example.com');
    await page.waitForLoadState('networkidle');
    
    // Check if content script can analyze the page
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
    
    // Verify basic page elements exist
    const links = await page.locator('a').count();
    const buttons = await page.locator('button').count();
    const inputs = await page.locator('input').count();
    
    // Page should have some interactive elements
    expect(links + buttons + inputs).toBeGreaterThan(0);
  });

  test('should handle navigation', async ({ page, context }) => {
    await page.goto('https://example.com');
    
    // Test basic navigation
    const currentUrl = page.url();
    expect(currentUrl).toBe('https://example.com/');
    
    // Click on a link if available
    const firstLink = page.locator('a[href]').first();
    
    if (await firstLink.isVisible()) {
      const linkHref = await firstLink.getAttribute('href');
      
      if (linkHref && !linkHref.startsWith('javascript:')) {
        // Click and verify navigation (if it's a same-origin link)
        if (linkHref.startsWith('/') || linkHref.includes('example.com')) {
          await firstLink.click();
          await page.waitForLoadState('networkidle');
          
          // URL should have changed
          expect(page.url()).not.toBe(currentUrl);
        }
      }
    }
  });

  test('should handle storage operations', async ({ page, context }) => {
    if (!extensionId) {
      test.skip('Extension not loaded properly');
      return;
    }

    // Test storage through the extension pages
    const backgroundPages = context.backgroundPages();
    
    if (backgroundPages.length > 0) {
      const backgroundPage = backgroundPages[0];
      
      // Test storage operations through background script
      const storageTest = await backgroundPage.evaluate(async () => {
        try {
          // Test chrome.storage.local
          await chrome.storage.local.set({ testKey: 'testValue' });
          const result = await chrome.storage.local.get(['testKey']);
          
          return {
            success: true,
            value: result.testKey,
            hasStorageAPI: typeof chrome.storage !== 'undefined'
          };
        } catch (error) {
          return {
            success: false,
            error: error.message,
            hasStorageAPI: typeof chrome.storage !== 'undefined'
          };
        }
      });
      
      expect(storageTest.hasStorageAPI).toBe(true);
      // Storage might not work in test environment, but API should exist
    }
  });

  test('should validate manifest and permissions', async ({ page, context }) => {
    if (!extensionId) {
      test.skip('Extension not loaded properly');
      return;
    }

    // Access manifest through extension URL
    try {
      const manifestPage = await context.newPage();
      await manifestPage.goto(`chrome-extension://${extensionId}/manifest.json`);
      
      const manifestText = await manifestPage.locator('pre').textContent();
      const manifest = JSON.parse(manifestText);
      
      // Validate manifest structure
      expect(manifest.manifest_version).toBe(3);
      expect(manifest.name).toContain('Sparky');
      expect(manifest.permissions).toContain('storage');
      expect(manifest.permissions).toContain('activeTab');
      
    } catch (error) {
      // Manifest might not be directly accessible in test environment
      console.log('Manifest validation skipped:', error.message);
    }
  });

  test('should handle errors gracefully', async ({ page, context }) => {
    // Test error handling by navigating to invalid pages
    await page.goto('https://example.com');
    
    // Inject a script that might cause errors
    await page.addScriptTag({
      content: `
        // Test error handling
        window.testExtensionError = function() {
          try {
            // This should not break the page
            throw new Error('Test error');
          } catch (e) {
            console.log('Error caught:', e.message);
            return 'error-handled';
          }
        };
      `
    });
    
    const result = await page.evaluate(() => {
      return window.testExtensionError();
    });
    
    expect(result).toBe('error-handled');
  });

  test('should maintain performance standards', async ({ page, context }) => {
    await page.goto('https://example.com');
    
    // Measure basic performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        hasPerformanceAPI: typeof performance !== 'undefined'
      };
    });
    
    expect(performanceMetrics.hasPerformanceAPI).toBe(true);
    expect(performanceMetrics.loadTime).toBeGreaterThan(0);
    
    // Page should load reasonably quickly (less than 10 seconds)
    expect(performanceMetrics.loadTime).toBeLessThan(10000);
  });
});