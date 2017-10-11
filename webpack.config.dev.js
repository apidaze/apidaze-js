const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

var childProcess = require('child_process');
var webpack = require('webpack');
var PKG_VERSION = require('./package.json').version;
var GITBRANCH = childProcess.execSync('git branch | grep \\* | cut -d \" \" -f2').toString().trim();
var VERSIONSTR = PKG_VERSION + "-dev-" + GITBRANCH;
var APIDAZE_JS_FILENAME = "APIdaze-" + VERSIONSTR + ".js";

module.exports = {
  entry: './src/index.js',
  output: {
    filename: "APIdaze-" + VERSIONSTR + ".js",
    library: 'APIdaze',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist')
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
  devServer: {
    contentBase: path.join(__dirname, "samples"),
    compress: true,
    host: "0.0.0.0",
    disableHostCheck: true,
    port: 9000
  },
  plugins: [
    new webpack.DefinePlugin({
        'process.env.GITBRANCH': JSON.stringify(GITBRANCH),
        'process.env.VERSIONSTR': JSON.stringify(VERSIONSTR),
        'process.env.PRODUCTION': JSON.stringify(false),
        'process.env.DEVELOPMENT': JSON.stringify(true),
        'process.env.APIDAZE_JS_FILENAME': JSON.stringify(APIDAZE_JS_FILENAME)
    })
  ]
};
