const path = require('path');
var childProcess = require('child_process'),
VERSION = childProcess.execSync('git rev-parse HEAD').toString();

console.log("VERSION : ", VERSION)

new webpack.DefinePlugin({
  PRODUCTION: JSON.stringify(true),
})

module.exports = {
  entry: './src/index.js',
  output: {
    filename: "APIdaze-dev.js",
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
    contentBase: path.join(__dirname, "example"),
    compress: true,
    port: 9000
  },
};
