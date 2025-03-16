module.exports = {
    extends: 'next/core-web-vitals',
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'react-hooks/exhaustive-deps': 'warn' // Cambia de 'error' a 'warn'
    }
  };