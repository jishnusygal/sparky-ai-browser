# 🔐 Google OAuth Setup Guide for Sparky

This guide will help you set up Google OAuth integration for Sparky, enabling users to sign in with their Google account and automatically access the Gemini API.

## 🎯 Overview

The Google OAuth integration provides:
- **One-click authentication** - Users sign in with their Google account
- **Automated API setup** - Streamlined Gemini API key management
- **Secure token handling** - No manual API key copying required
- **Better user experience** - From install to first task in seconds

## 📋 Prerequisites

1. **Google Cloud Console access** - You'll need a Google account
2. **Chrome Extension** - Basic understanding of Chrome extension development
3. **Domain/Extension ID** - For OAuth redirect configuration

## 🚀 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"** or select an existing project
3. Enter project name: `sparky-ai-browser` (or your preferred name)
4. Note your **Project ID** - you'll need this later

### Step 2: Enable Required APIs

1. In Google Cloud Console, go to **"APIs & Services" > "Library"**
2. Enable these APIs:
   - **Google+ API** (for user profile)
   - **Gemini API** (for AI functionality)
   - **OAuth2 API** (for authentication)

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services" > "OAuth consent screen"**
2. Choose **"External"** for user type (unless you have Google Workspace)
3. Fill in the required information:
   - **App name**: "Sparky AI Browser"
   - **User support email**: Your email
   - **Developer contact**: Your email
   - **App domain**: (leave blank for extension)
   - **Logo**: Upload the Sparky logo (optional)

4. **Scopes**: Add these scopes:
   ```
   https://www.googleapis.com/auth/userinfo.profile
   https://www.googleapis.com/auth/userinfo.email
   ```

5. **Test users**: Add your email and any beta testers

### Step 4: Create OAuth Credentials

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials" > "OAuth client ID"**
3. Choose **"Chrome extension"** as application type
4. **Name**: "Sparky AI Browser OAuth"
5. **Application ID**: Enter your Chrome extension ID
   - If you don't have it yet, you can use a placeholder and update later
   - Format: `abcdefghijklmnopqrstuvwxyzabcdef` (32 characters)

6. Click **"Create"**
7. **Copy the Client ID** - you'll need this for the manifest.json

### Step 5: Update Extension Manifest

1. Open `manifest.json` in your Sparky project
2. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual client ID:

```json
{
  "oauth2": {
    "client_id": "1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  }
}
```

### Step 6: Get Chrome Extension ID

1. Load your extension in Chrome (**chrome://extensions/**)
2. Enable **"Developer mode"**
3. Click **"Load unpacked"** and select your Sparky folder
4. **Copy the Extension ID** (long string under the extension name)
5. Go back to Google Cloud Console > Credentials
6. Edit your OAuth client and update the **Application ID** with the real extension ID

### Step 7: Test Authentication

1. **Reload the extension** in Chrome
2. Open Sparky side panel
3. Click **"Sign in with Google"**
4. Complete the OAuth flow
5. Verify that user profile appears in the UI

## 🔧 Development Configuration

For development and testing, you may want to set up additional configurations:

### Local Development
```json
{
  "oauth2": {
    "client_id": "your-dev-client-id.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  }
}
```

### Production Build
```json
{
  "oauth2": {
    "client_id": "your-prod-client-id.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  }
}
```

## 🔒 Security Best Practices

### 1. Client ID Security
- **Never commit** real client IDs to public repositories
- Use environment variables or config files for different environments
- Use different client IDs for development and production

### 2. Scope Limitation
- Request only the minimum necessary scopes
- Current scopes are: `profile` and `email`
- Avoid requesting unnecessary permissions

### 3. Token Management
- Tokens are automatically managed by Chrome's identity API
- Tokens are stored securely in Chrome's internal storage
- Implement proper token refresh logic (already included)

## 🐛 Troubleshooting

### Common Issues

#### "Unauthorized" Error
- **Cause**: Incorrect client ID or extension ID mismatch
- **Solution**: Verify client ID in manifest.json matches Google Cloud Console

#### "Scope Not Authorized" Error
- **Cause**: Requested scopes not configured in OAuth consent screen
- **Solution**: Add required scopes in Google Cloud Console

#### "Extension Not Found" Error
- **Cause**: Extension ID in Google Cloud doesn't match actual extension
- **Solution**: Update Application ID in OAuth credentials

#### "Sign-in Popup Blocked"
- **Cause**: Browser blocking popup windows
- **Solution**: User needs to allow popups for Chrome extensions

### Debug Steps

1. **Check Browser Console**:
   - Open Chrome DevTools in side panel
   - Look for authentication errors
   - Verify network requests to Google APIs

2. **Verify Permissions**:
   - Check manifest.json has `"identity"` permission
   - Verify host permissions include Google domains

3. **Test Token**:
   ```javascript
   // In DevTools console
   chrome.identity.getAuthToken({interactive: true}, (token) => {
     console.log('Token:', token);
   });
   ```

## 📚 Additional Resources

- [Chrome Identity API Documentation](https://developer.chrome.com/docs/extensions/reference/identity/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)

## 🎉 What's Next?

Once OAuth is configured:

1. **Test the complete flow**: Sign in → API setup → Run a task
2. **Gather user feedback**: How smooth is the onboarding?
3. **Monitor usage**: Track authentication success rates
4. **Iterate and improve**: Based on user experience

## 💡 Pro Tips

- **Use descriptive names** for your Google Cloud project and OAuth client
- **Set up monitoring** for authentication failures
- **Document any custom scopes** you add in the future
- **Keep backup configurations** for different environments
- **Test with multiple Google accounts** to ensure compatibility

---

**Need help?** Open an issue in the repository with:
- Your error message
- Steps you've taken
- Screenshot of the issue
- Chrome version and OS

The Google OAuth integration transforms Sparky from a developer tool into a consumer-ready product! 🚀