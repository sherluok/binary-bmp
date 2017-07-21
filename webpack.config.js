const path = require('path');

module.exports = {
  entry:  path.resolve(__dirname, 'src', 'Bmp.js'),
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'Bmp.min.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [{
          // https://webpack.js.org/loaders/expose-loader/
          // 通过 module.exports=Bmp 暴露给浏览器的 window.Bmp
          loader: 'expose-loader',
          options: 'Bmp',
        }, {
          loader: 'babel-loader',
        }],
      },
    ],
  },
};
