/* eslint-disable @typescript-eslint/no-var-requires */
const nodeExternals = require('webpack-node-externals')
const paths = require('../paths')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = () => ({
  mode: process.env.NODE_ENV,
  bail: isProduction,
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  externals: [nodeExternals({ modulesFromFile: true })],
  entry: [paths.appIndex],
})
