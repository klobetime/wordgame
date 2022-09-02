module.exports = {
  root: true,
  env: {
    node: true,
    amd: true,
    es2021: true,
    browser: true,
    jest: true,
  },
  globals: {
    BigInt: true,
  },
  ignorePatterns: ['node_modules', 'build', 'coverage', '.eslintrc.js'],
  extends: [
    'eslint:recommended',
    'google',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsdoc/recommended',
  ],
  plugins: ['@typescript-eslint', 'prettier', 'jest'],
  parser: '@typescript-eslint/parser',
  rules: {
    // formatting rules
    'linebreak-style': ['error', 'unix'],
    'operator-linebreak': ['error', 'after'],
    'max-len': ['error', {code: 128, tabWidth: 2, ignoreUrls: true }],
    'indent': ['error', 2],

    // coding rules
    'arrow-body-style': ['error', 'always'],
    'object-curly-spacing': ['error', 'always'],
    'no-plusplus': 'off',
    'prefer-destructuring': 'off',
    'comma-dangle': ['error', {
      'arrays': 'always-multiline',
      'objects': 'always-multiline',
      'imports': 'always-multiline',
      'exports': 'always-multiline',
      'functions': 'never'
    }],
    'guard-for-in': 'off',

    'no-console': 'warn',
    'no-alert': 'warn',

    'prettier/prettier': [
      'warn',
      {
        endOfLine: 'auto',
      },
    ],
  },
  overrides: [
    {
      files: ['**'],
      rules: {
        // deprecated by eslint
        'valid-jsdoc': 'off',
        'require-jsdoc': 'off',
      },
    },
    {
      files: ['tests/**'],
      plugins: ['jest'],
      extends: [
        'plugin:jest/all',
      ],
      rules: {
        'jest/unbound-method': 'error',
        'jest/no-hooks': 'off',
        'jest/prefer-expect-assertions': 'off',
        'jest/no-done-callback': 'off',
        'jest/no-disabled-tests': 'off',
        'jest/max-expects': 'off',
      },
    },
  ],
};
