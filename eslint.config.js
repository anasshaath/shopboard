import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['**/node_modules/**', '**/dist/**'] },
  {
    ...js.configs.recommended,
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  },
  {
    files: ['src/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['eslint.config.js'],
    languageOptions: { globals: globals.node },
  },
]
