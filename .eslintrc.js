module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // Desactiva completamente la regla de variables no utilizadas
    '@typescript-eslint/no-unused-vars': 'off',
    'react-hooks/exhaustive-deps': 'warn'
  }
};