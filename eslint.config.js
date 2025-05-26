import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  unocss: true,
  pnpm: true,
  rules: {
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/no-array-index-key': 'off',
  },
})
