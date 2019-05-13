const path = require('path');
var webpack = require('webpack');
var PKG_VERSION = require('./package.json').version;
var VERSIONSTR = PKG_VERSION;
var APIDAZE_JS_FILENAME = "APIdaze.js";

module.exports = {
  entry: './src/index.js',
  output: {
    filename: APIDAZE_JS_FILENAME,
    library: 'APIdaze',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'lib')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
        'process.env.VERSIONSTR': JSON.stringify(VERSIONSTR),
        'process.env.PRODUCTION': JSON.stringify(true),
        'process.env.DEVELOPMENT': JSON.stringify(false),
        'process.env.APIDAZE_JS_FILENAME': JSON.stringify(APIDAZE_JS_FILENAME)
    })
  ]
};
