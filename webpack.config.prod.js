const path = require('path');
var childProcess = require('child_process');
var webpack = require('webpack');
GITBRANCH = childProcess.execSync('git branch | grep \\* | cut -d \" \" -f2').toString().trim();

module.exports = {
  entry: './src/index.js',
  output: {
    filename: "APIdaze-" + GITBRANCH + ".js",
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
  plugins: [
    new webpack.DefinePlugin({
        'process.env.__VERSION__': JSON.stringify(GITBRANCH),
        'process.env.PRODUCTION': JSON.stringify(true),
        'process.env.DEVELOPMENT': JSON.stringify(false),
    })
  ]
};
