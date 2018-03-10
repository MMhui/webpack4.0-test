const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require('extract-text-webpack-plugin');


module.exports = {
  entry: {
    "about/about": './src/about/about.js',
    "home/home": './src/home/home.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "js/[name].[hash].js",
    chunkFilename: "js/[name].chunk.js",
    publicPath: "../dist/"
  },
  devServer: {
  	contentBase: require('path').join(__dirname, "dist"),
    compress: true,
    port: 8080,
    host: "localhost"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: true }
          }
        ]
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: (getPath) => {
        return getPath('css/[name].min.css').replace('\\js', '').replace('\\', '');
    },
    allChunks: true
    }),
    new HtmlWebpackPlugin({
      template: './src/about/about.html',
      filename: 'about/about.html',
      chunks: ['about']
    }),
    new HtmlWebpackPlugin({
      template: './src/home/home.html',
      filename: 'home/home.html',
      chunks: ['home']
    })
  ]
};