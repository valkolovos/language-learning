module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Make unused variables errors instead of warnings
    '@typescript-eslint/no-unused-vars': 'error',
    // Make missing dependencies errors
    'react-hooks/exhaustive-deps': 'error',
    // Temporarily disable no-console for development
    'no-console': 'off',
    // Additional strict rules for better code quality
    'prefer-const': 'error',
    'no-var': 'error'
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
};
