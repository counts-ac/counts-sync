module.exports = {
  semi: false,
  printWidth: 120,
  singleQuote: true,
  trailingComma: 'all',
  endOfLine: 'auto',
  importOrder: [
    '<TYPES>',
    '<TYPES>@counts/',
    '<TYPES>@/',
    '<TYPES>^[.]',
    '',
    '<BUILTIN_MODULES>',
    '<THIRD_PARTY_MODULES>',
    './index.scss',
    '',
    '@counts/',
    '@/',
    '',
    '^[./].*(?<!\\.(c|le|sc)ss)$',
    '',
    '^[./].*\\.(c|le|sc)ss$',
  ],
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  overrides: [
    {
      files: ['**/*.html'],
      options: {
        singleQuote: false,
      },
    },
  ],
}
