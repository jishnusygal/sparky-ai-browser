module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
    jest: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  plugins: ['jest'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    // Console statements are often needed in browser extensions for debugging
    'no-console': 'off',
    
    // Allow unused function parameters (common in event handlers)
    'no-unused-vars': ['error', { 
      'vars': 'all', 
      'args': 'none',  // Don't check function arguments
      'ignoreRestSiblings': false 
    }],
    
    // Allow lexical declarations in case blocks
    'no-case-declarations': 'off',
    
    // Other useful rules for extension development
    'no-undef': 'error',
    'no-redeclare': 'error',
    'no-unreachable': 'error'
  },
  globals: {
    chrome: 'readonly',
    browser: 'readonly',
    // Node.js globals for CommonJS files
    module: 'readonly',
    exports: 'readonly',
    require: 'readonly',
    // Jest globals
    describe: 'readonly',
    it: 'readonly',
    test: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
    jest: 'readonly'
  },
  overrides: [
    {
      // Configuration for CommonJS files
      files: ['**/*.cjs', '**/playwright.config.js'],
      parserOptions: {
        sourceType: 'script'
      },
      env: {
        node: true
      }
    },
    {
      // Configuration for test files
      files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
        node: true
      },
      globals: {
        testHelpers: 'readonly'
      }
    },
    {
      // Configuration for extension content scripts and background scripts
      files: ['background.js', 'content_script.js', 'side_panel.js'],
      parserOptions: {
        sourceType: 'script'  // These files don't use ES6 modules
      },
      globals: {
        chrome: 'readonly',
        browser: 'readonly'
      }
    },
    {
      // Configuration for utility modules
      files: ['utils.js', 'google-auth.js'],
      parserOptions: {
        sourceType: 'module'  // These files use ES6 export/import
      }
    }
  ]
};