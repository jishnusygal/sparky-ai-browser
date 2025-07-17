# 🐕 Sparky - Agentic AI Browser

**An intelligent Chrome extension that autonomously navigates the web to accomplish your goals**

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green?style=for-the-badge)
![AI Powered](https://img.shields.io/badge/AI-Powered-orange?style=for-the-badge)
![License MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## 🎯 What is Sparky?

Sparky is an innovative Chrome extension that acts as your personal AI web browsing assistant. Simply tell Sparky what you want to accomplish in natural language (like "Find the current weather in Tallinn, Estonia"), and watch as it autonomously navigates websites, clicks buttons, fills forms, and extracts information to complete your task.

## 🧠 The Brain & Hands Architecture

Sparky operates on a unique **"Brain and Hands"** model:

- **🧠 The Brain (LLM)**: Powered by Google's Gemini API, the brain analyzes the current webpage and decides what action to take next
- **🤲 The Hands (Content Script)**: Executes the brain's decisions by actually interacting with web pages - clicking, typing, scrolling

## ✨ Features

- **Natural Language Goals**: Tell Sparky what you want in plain English
- **Autonomous Navigation**: Sparky navigates websites independently
- **Visual Feedback**: See exactly what Sparky is doing with visual indicators
- **Real-time Status**: Watch Sparky's thought process and actions in real-time
- **Safe & Secure**: Uses Manifest V3 with proper permissions
- **Modern UI**: Clean, intuitive interface with Tailwind CSS styling

## 🚀 Quick Start

### Prerequisites

- Google Chrome browser
- [Gemini API key](https://makersuite.google.com/app/apikey) (free to obtain)

### Installation

1. **Clone this repository**:
   ```bash
   git clone https://github.com/jishnusygal/sparky-ai-browser.git
   cd sparky-ai-browser
   ```

2. **Load the extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top right)
   - Click "Load unpacked" and select the `sparky-ai-browser` folder

3. **Set up your API key**:
   - Click the Sparky extension icon to open the side panel
   - Enter your Gemini API key
   - The key will be saved securely for future use

### Usage

1. **Open the side panel** by clicking the Sparky extension icon
2. **Enter your goal** in natural language (e.g., "Search for the latest news about AI")
3. **Click "Start Task"** and watch Sparky work!
4. **Monitor progress** in the status area
5. **Get your result** in the final answer section

## 📁 Project Structure

```
sparky-ai-browser/
├── manifest.json          # Extension manifest (Manifest V3)
├── side_panel.html        # Main UI interface
├── side_panel.css         # UI styling
├── side_panel.js          # UI logic and communication
├── background.js          # Service worker (The Brain)
├── content_script.js      # Page interaction script (The Hands)
├── utils.js               # Shared utility functions
└── README.md             # This file
```

## 🔧 Technical Details

### Core Components

1. **Background Service Worker** (`background.js`)
   - Orchestrates the AI agent's decision-making process
   - Manages communication between components
   - Handles Gemini API calls for AI decisions

2. **Content Script** (`content_script.js`)
   - Injected into web pages to observe and interact
   - Creates simplified DOM representations
   - Executes AI-decided actions (click, type, scroll)

3. **Side Panel UI** (`side_panel.html`, `side_panel.js`)
   - User interface for goal input and status monitoring
   - Real-time feedback and result display

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

- Your API key is stored locally in Chrome's secure storage
- No browsing data is sent to external servers (except Gemini API for decisions)
- Uses Chrome's latest Manifest V3 security standards
- All interactions happen locally in your browser

## 📝 Example Use Cases

- **Weather Checking**: "Find the current weather in Tokyo, Japan"
- **News Research**: "Get the latest news about renewable energy"
- **Price Comparison**: "Find the price of iPhone 15 on Amazon"
- **Information Gathering**: "What are the top 5 movies on IMDb this week?"
- **Form Filling**: "Fill out the contact form with my details"

## 🔧 Configuration

### Gemini API Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and paste it into Sparky's side panel
4. The key will be saved for future sessions

### Customization

You can modify the behavior by editing:

- **Maximum actions** (`background.js`): Change the `maxActions` limit
- **AI prompt** (`background.js`): Customize the system prompt for different behaviors
- **Element selectors** (`content_script.js`): Add support for more element types
- **UI styling** (`side_panel.css`): Customize the appearance

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

1. Clone the repository
2. Make your changes
3. Test in Chrome by loading the unpacked extension
4. Submit a pull request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google's Gemini API for providing the AI capabilities
- Chrome Extensions team for Manifest V3
- Tailwind CSS for the beautiful styling
- The open-source community for inspiration

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/jishnusygal/sparky-ai-browser/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide as much detail as possible for faster resolution

## 🗺️ Roadmap

- [ ] Support for more AI models (OpenAI GPT, Claude)
- [ ] Task templates for common workflows
- [ ] Browser automation recording/playback
- [ ] Multi-tab task execution
- [ ] Task scheduling and automation
- [ ] Integration with productivity tools

---

**Made with ❤️ for autonomous web browsing**

*Sparky - Because the web should work for you, not against you!* 🐕