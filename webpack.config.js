module.exports = {
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  entry: [
    './src/client.js'
  ],
  output: {
    path: __dirname + '/src/static/js',
    filename: 'bundle.js'
  }
};
