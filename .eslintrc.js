module.exports = {
  env: {
    node: true,
    browser: true,
    'cypress/globals': true,
    es6: true,
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
