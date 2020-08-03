module.exports = {
  rules: [
    {
      test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
      loader: require.resolve('url-loader'),
      options: {
        limit: 10000,
        name: 'assets/media/[name].[hash:8].[ext]',
      },
    },
    {
      test: /\.(ts|tsx)$/,
      exclude: [/node_modules/],
      loader: require.resolve('ts-loader'),
    },
    {
      test: /\.(sass|scss)$/,
      use: [
        require.resolve('style-loader'),
        {
          loader: require.resolve('css-loader'),
          options: {
            importLoaders: 2,
            sourceMap: this.isEnvProduction && this.shouldUseSourceMap,
          },
        },
        {
          loader: require.resolve('sass-loader'),
          options: {
            sourceMap: true,
          },
        },
      ],
      // Don't consider CSS imports dead code even if the
      // containing package claims to have no side effects.
      // Remove this when webpack adds a warning or an error for this.
      // See https://github.com/webpack/webpack/issues/6571
      sideEffects: true,
    },
    {
      loader: require.resolve('file-loader'),
      // Exclude `js` files to keep "css" loader working as it injects
      // its runtime that would otherwise be processed through "file" loader.
      // Also exclude `html` and `json` extensions so they get processed
      // by webpacks internal loaders.
      exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
      options: {
        name: 'assets/media/[name].[hash:8].[ext]',
      },
    },
  ],
}
