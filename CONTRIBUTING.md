# Contributing to Sparky AI Browser 🐕

First off, thank you for considering contributing to Sparky! It's people like you that make Sparky such a great tool for autonomous web browsing.

## 🎯 Ways to Contribute

### 🐛 Reporting Bugs

This section guides you through submitting a bug report for Sparky. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

**Before Submitting A Bug Report:**
- Check the existing issues to see if the problem has already been reported
- Perform a cursory search to see if the bug has already been reported
- If you find an existing issue, add a comment with additional details

**How Do I Submit A Good Bug Report?**

Bugs are tracked as GitHub issues. Create an issue and provide the following information:

- **Use a clear and descriptive title** for the issue
- **Describe the exact steps to reproduce the problem** in as many details as possible
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** after following the steps
- **Explain which behavior you expected** to see instead and why
- **Include screenshots or GIFs** if they help explain the problem
- **Include your environment details:**
  - Chrome version
  - Operating system
  - Sparky extension version
  - Gemini API configuration (without revealing your API key)

### 💡 Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Sparky.

**Before Submitting An Enhancement Suggestion:**
- Check if the enhancement has already been suggested
- Check if the enhancement aligns with the project's goals
- Consider if this is something that would be useful to the majority of users

**How Do I Submit A Good Enhancement Suggestion?**

- **Use a clear and descriptive title** for the issue
- **Provide a step-by-step description** of the suggested enhancement
- **Provide specific examples** to demonstrate the enhancement
- **Describe the current behavior** and **explain which behavior you expected** to see instead
- **Explain why this enhancement would be useful** to most Sparky users

### 🔧 Code Contributions

#### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/sparky-ai-browser.git
   cd sparky-ai-browser
   ```

3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Setup

1. **Load the extension in Chrome for testing:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the repository folder

2. **Make your changes** following the code style guidelines

3. **Test your changes** thoroughly:
   - Test the basic functionality
   - Test edge cases
   - Ensure no existing functionality is broken

#### Pull Request Process

1. **Update documentation** if necessary
2. **Ensure your code follows the style guidelines**
3. **Write clear commit messages**
4. **Create a pull request** with:
   - Clear title and description
   - Reference any related issues
   - Screenshots/GIFs if UI changes are involved

## 📝 Style Guidelines

### JavaScript Style
- Use ES6+ features where appropriate
- Use meaningful variable and function names
- Comment complex logic
- Use async/await for asynchronous operations
- Follow the existing code formatting

### HTML/CSS Style
- Use semantic HTML5 elements
- Follow Tailwind CSS utility-first approach
- Maintain responsive design principles
- Use meaningful class names for custom CSS

### Git Commit Messages
- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Use emojis to categorize commits:
  - 🐕 `:dog:` for Sparky-specific features
  - 🐛 `:bug:` for bug fixes
  - ✨ `:sparkles:` for new features
  - 📚 `:books:` for documentation
  - 🎨 `:art:` for UI/UX improvements
  - ⚡ `:zap:` for performance improvements
  - 🔧 `:wrench:` for configuration changes

## 🏗️ Project Structure

```
sparky-ai-browser/
├── manifest.json          # Extension manifest
├── side_panel.html        # Main UI
├── side_panel.css         # UI styling
├── side_panel.js          # UI logic
├── background.js          # Service worker (The Brain)
├── content_script.js      # Page interaction (The Hands)
├── utils.js               # Shared utilities
├── README.md             # Project documentation
├── CONTRIBUTING.md       # This file
├── LICENSE               # MIT License
└── .gitignore           # Git ignore rules
```

## 🧪 Testing

Before submitting your changes, please test:

1. **Basic Functionality:**
   - Extension loads without errors
   - Side panel opens correctly
   - API key saves and loads
   - Basic task execution works

2. **Edge Cases:**
   - Invalid API key handling
   - Network errors
   - Page navigation failures
   - Complex website interactions

3. **Browser Compatibility:**
   - Test on latest Chrome version
   - Ensure Manifest V3 compliance

## 📋 Issue Labels

We use these labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested
- `wontfix` - This will not be worked on

## 🤝 Code of Conduct

### Our Pledge

We are committed to making participation in this project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances.

## 🙏 Recognition

Contributors will be recognized in our README.md file. We appreciate all contributions, big and small!

## 📞 Questions?

Don't hesitate to ask questions! You can:

1. Open an issue with the "question" label
2. Start a discussion in the repository
3. Reach out to the maintainers

Thank you for contributing to Sparky! 🐕✨