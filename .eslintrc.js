module.exports = {
  env: {
    browser: true,
    'cypress/globals': true,
  },
  extends: [
    'eslint:recommended',
    'prettier',
  ],
  plugins: [
    'import',
    'cypress',
  ],
  parser: 'babel-eslint',
  rules: {
  }
};
