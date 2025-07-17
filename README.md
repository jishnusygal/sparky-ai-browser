# 🐕 Sparky - Agentic AI Browser

**An intelligent Chrome extension that autonomously navigates the web to accomplish your goals**

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green?style=for-the-badge)
![AI Powered](https://img.shields.io/badge/AI-Powered-orange?style=for-the-badge)
![OAuth Ready](https://img.shields.io/badge/Google-OAuth-red?style=for-the-badge&logo=google)
![License MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## 🎯 What is Sparky?

Sparky is an innovative Chrome extension that acts as your personal AI web browsing assistant. Simply tell Sparky what you want to accomplish in natural language (like "Find the current weather in Tallinn, Estonia"), and watch as it autonomously navigates websites, clicks buttons, fills forms, and extracts information to complete your task.

## 🧠 The Brain & Hands Architecture

Sparky operates on a unique **"Brain and Hands"** model:

- **🧠 The Brain (LLM)**: Powered by Google's Gemini API, the brain analyzes the current webpage and decides what action to take next
- **🤲 The Hands (Content Script)**: Executes the brain's decisions by actually interacting with web pages - clicking, typing, scrolling

## ✨ Features

- **🔐 One-Click Google Sign-In**: Automated API setup with Google OAuth - no manual API key needed!
- **Natural Language Goals**: Tell Sparky what you want in plain English
- **Autonomous Navigation**: Sparky navigates websites independently
- **Visual Feedback**: See exactly what Sparky is doing with visual indicators
- **Real-time Status**: Watch Sparky's thought process and actions in real-time
- **Safe & Secure**: Uses Manifest V3 with proper permissions and secure OAuth
- **Modern UI**: Clean, intuitive interface with Tailwind CSS styling
- **Fallback Options**: Manual API key entry for advanced users

## 🚀 Quick Start

### Prerequisites

- Google Chrome browser
- Google account (for easiest setup)
- *Optional*: [Gemini API key](https://makersuite.google.com/app/apikey) for manual setup

### Installation

1. **Clone this repository**:
   ```bash
   git clone https://github.com/jishnusygal/sparky-ai-browser.git
   cd sparky-ai-browser
   ```

2. **Set up Google OAuth** (for one-click sign-in):
   - Follow the [OAuth Setup Guide](OAUTH_SETUP.md) to configure Google authentication
   - Update `manifest.json` with your Google OAuth client ID

3. **Load the extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top right)
   - Click "Load unpacked" and select the `sparky-ai-browser` folder

### Usage - Two Ways to Get Started!

#### 🎉 Option 1: Google Sign-In (Recommended)
1. **Open the side panel** by clicking the Sparky extension icon
2. **Click "Sign in with Google"** - that's it!
3. **Enter your goal** (e.g., "Search for the latest news about AI")
4. **Click "Start Task"** and watch Sparky work!

#### 🔧 Option 2: Manual API Key
1. **Open the side panel** and click "Enter API key manually"
2. **Get your API key** from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. **Paste the key** and enter your goal
4. **Start your task** and see Sparky in action!

## 📁 Project Structure

```
sparky-ai-browser/
├── manifest.json          # Extension manifest with OAuth config
├── side_panel.html        # Main UI with Google Sign-In
├── side_panel.css         # UI styling and animations
├── side_panel.js          # UI logic with OAuth integration
├── google-auth.js         # Google OAuth authentication service
├── background.js          # Service worker (The Brain)
├── content_script.js      # Page interaction script (The Hands)
├── utils.js               # Shared utility functions
├── OAUTH_SETUP.md        # Google OAuth configuration guide
├── CONTRIBUTING.md       # Contribution guidelines
└── README.md             # This file
```

## 🔧 Technical Details

### Core Components

1. **Google OAuth Service** (`google-auth.js`)
   - Handles Google Sign-In and token management
   - Automated Gemini API key setup
   - Secure token storage and refresh

2. **Background Service Worker** (`background.js`)
   - Orchestrates the AI agent's decision-making process
   - Manages communication between components
   - Handles Gemini API calls for AI decisions

3. **Content Script** (`content_script.js`)
   - Injected into web pages to observe and interact
   - Creates simplified DOM representations
   - Executes AI-decided actions (click, type, scroll)

4. **Side Panel UI** (`side_panel.html`, `side_panel.js`)
   - Google OAuth integration with fallback to manual setup
   - Real-time status updates and user profile display
   - Intuitive goal input and result display

### AI Decision Process

1. **Observe**: Scan the current webpage and create a simplified representation
2. **Think**: Send page data to Gemini API for next action decision
3. **Act**: Execute the AI's decision (click, type, scroll, or finish)
4. **Repeat**: Continue until the goal is accomplished

### Supported Actions

- **CLICK**: Click on buttons, links, or interactive elements
- **TYPE**: Enter text into input fields or textareas
- **SCROLL**: Scroll up or down on the page
- **WAIT**: Pause for page loading or processing
- **FINISH**: Complete the task and return results

## 🛡️ Privacy & Security

- **OAuth Security**: Uses Google's secure OAuth 2.0 flow
- **Local Storage**: API keys and tokens stored securely in Chrome's storage
- **No Data Collection**: No browsing data sent to external servers (except Gemini API)
- **Manifest V3**: Latest Chrome security standards
- **Token Management**: Automatic token refresh and secure revocation

## 📝 Example Use Cases

- **Weather Checking**: "Find the current weather in Tokyo, Japan"
- **News Research**: "Get the latest news about renewable energy"
- **Price Comparison**: "Find the price of iPhone 15 on Amazon"
- **Information Gathering**: "What are the top 5 movies on IMDb this week?"
- **Social Media**: "Check the latest posts about AI on Twitter"
- **Research**: "Find academic papers about machine learning published this year"

## 🔧 Configuration

### Google OAuth Setup (Recommended)

1. Follow the detailed [OAuth Setup Guide](OAUTH_SETUP.md)
2. Configure your Google Cloud project
3. Update `manifest.json` with your client ID
4. Users can sign in with one click!

### Manual Gemini API Setup (Fallback)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Use "Enter API key manually" option in Sparky
4. The key will be saved for future sessions

### Customization

You can modify the behavior by editing:

- **Maximum actions** (`background.js`): Change the `maxActions` limit
- **AI prompt** (`background.js`): Customize the system prompt for different behaviors
- **Element selectors** (`content_script.js`): Add support for more element types
- **UI styling** (`side_panel.css`): Customize the appearance
- **OAuth settings** (`manifest.json`): Configure authentication scopes

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

1. Clone the repository
2. Set up Google OAuth (see [OAUTH_SETUP.md](OAUTH_SETUP.md))
3. Make your changes
4. Test in Chrome by loading the unpacked extension
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google's Gemini API for providing the AI capabilities
- Google Cloud Platform for OAuth infrastructure
- Chrome Extensions team for Manifest V3
- Tailwind CSS for the beautiful styling
- The open-source community for inspiration

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/jishnusygal/sparky-ai-browser/issues) page
2. Review the [OAuth Setup Guide](OAUTH_SETUP.md) for authentication issues
3. Create a new issue if your problem isn't already reported
4. Provide as much detail as possible for faster resolution

## 🗺️ Roadmap

- [x] **Google OAuth Integration** - One-click sign-in ✅
- [ ] **Multi-AI Model Support** - OpenAI GPT, Claude integration
- [ ] **Task Templates** - Pre-built workflows for common tasks
- [ ] **Browser Automation Recording** - Record and replay workflows
- [ ] **Multi-tab Task Execution** - Handle complex multi-page tasks
- [ ] **Task Scheduling** - Automated recurring tasks
- [ ] **Productivity Integrations** - Connect with popular tools

## 🎉 What's New in v1.1.0

- **🔐 Google OAuth Integration**: One-click sign-in with automatic API setup
- **🎨 Improved UI**: New authentication flow with user profiles
- **🔒 Enhanced Security**: Secure token management and automatic refresh
- **📚 Comprehensive Documentation**: Detailed OAuth setup guide
- **🛠️ Developer Experience**: Better development workflow and debugging

---

**Made with ❤️ for autonomous web browsing**

*Sparky - Because the web should work for you, not against you!* 🐕

### ⚡ Quick Links
- [🔐 OAuth Setup Guide](OAUTH_SETUP.md)
- [🤝 Contributing Guide](CONTRIBUTING.md)
- [📋 Project Issues](https://github.com/jishnusygal/sparky-ai-browser/issues)
- [🚀 Latest Releases](https://github.com/jishnusygal/sparky-ai-browser/releases)