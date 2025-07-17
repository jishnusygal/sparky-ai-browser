name: Pull Request Template
description: Template for all pull requests to Sparky AI Browser
title: "[Feature/Bug/Docs]: Brief description"
labels: []
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        # 🐕 Sparky AI Browser - Pull Request

        Thank you for contributing to Sparky! Please fill out this template to help us review your changes effectively.

  - type: dropdown
    id: pr-type
    attributes:
      label: 🏷️ Type of Change
      description: What type of change does this PR introduce?
      options:
        - 🚀 Feature (new functionality)
        - 🐛 Bug Fix (fixes an issue)
        - 📚 Documentation (updates to docs)
        - 🎨 Style (formatting, missing semi colons, etc)
        - ♻️ Refactor (code change that neither fixes bug nor adds feature)
        - ⚡ Performance (code change that improves performance)
        - ✅ Test (adding missing tests or correcting existing tests)
        - 🔧 Chore (changes to build process or auxiliary tools)
        - 💥 Breaking Change (fix or feature that would cause existing functionality to not work as expected)
      default: 0
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: 📝 Description
      description: Please describe what this PR does
      placeholder: A clear and concise description of what the pull request does...
    validations:
      required: true

  - type: textarea
    id: motivation
    attributes:
      label: 🎯 Motivation and Context
      description: Why is this change required? What problem does it solve?
      placeholder: This change is needed because...

  - type: textarea
    id: changes
    attributes:
      label: 🔧 Changes Made
      description: List the specific changes made in this PR
      placeholder: |
        - Added new feature X
        - Fixed bug Y
        - Updated documentation for Z
        - Refactored component A

  - type: textarea
    id: testing
    attributes:
      label: 🧪 Testing
      description: How has this been tested? Please describe the tests you ran.
      placeholder: |
        - [ ] Unit tests pass
        - [ ] Integration tests pass
        - [ ] Manual testing completed
        - [ ] Tested on Chrome (latest version)
        - [ ] Tested OAuth flow
        - [ ] Tested with real websites

  - type: checkboxes
    id: checklist
    attributes:
      label: ✅ Checklist
      description: Please check all applicable items
      options:
        - label: My code follows the style guidelines of this project
          required: false
        - label: I have performed a self-review of my own code
          required: false
        - label: I have commented my code, particularly in hard-to-understand areas
          required: false
        - label: I have made corresponding changes to the documentation
          required: false
        - label: My changes generate no new warnings
          required: false
        - label: I have added tests that prove my fix is effective or that my feature works
          required: false
        - label: New and existing unit tests pass locally with my changes
          required: false
        - label: Any dependent changes have been merged and published in downstream modules
          required: false

  - type: dropdown
    id: breaking-changes
    attributes:
      label: 💥 Breaking Changes
      description: Does this PR introduce any breaking changes?
      options:
        - "No breaking changes"
        - "Yes, this introduces breaking changes"
      default: 0

  - type: textarea
    id: breaking-details
    attributes:
      label: 💥 Breaking Changes Details
      description: If yes, please describe the breaking changes and migration path
      placeholder: This PR introduces breaking changes to...

  - type: textarea
    id: additional-notes
    attributes:
      label: 📎 Additional Notes
      description: Any additional information that reviewers should know
      placeholder: Additional context, screenshots, or notes...

  - type: checkboxes
    id: final-checklist
    attributes:
      label: 🚦 Final Checklist
      description: Before submitting this PR
      options:
        - label: I have read the CONTRIBUTING.md guidelines
          required: true
        - label: I have linked any related issues
          required: false
        - label: I have requested review from appropriate team members
          required: false