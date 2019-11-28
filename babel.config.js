module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: 'cover 99.5% in GB',
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
  ],
}
