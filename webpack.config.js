const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require('extract-text-webpack-plugin');


const glob = require('glob');
const path = require('path');

const plugins = [new ExtractTextPlugin({
    filename: (getPath) => {
        return getPath('css/[name].[hash].css').replace('\\js', '').replace('\\', '');
    },
    allChunks: true
  })];

const entry = {};

function getEntry(globPath, pathDir) {
    let files = glob.sync(globPath);
    let entries = {},
        entry, dirname, basename, pathname, extname;

    for (let i = 0; i < files.length; i++) {
        entry = files[i];
        dirname = path.dirname(entry);
        extname = path.extname(entry);
        basename = path.basename(entry, extname);
        pathname = path.join(dirname, basename);
        pathname = pathDir ? pathname.replace(new RegExp('^' + pathDir), '') : pathname;
        entries[pathname] = [entry];

        // console.log(entry, dirname, extname, basename, pathname, entries);
        // entry:     ./src/about/about.html                            ./src/home/home.html
        // dirname:   ./src/about                                       ./src/home
        // extname:   .html                                             .html
        // basename:  about                                             home
        // pathname:  \about\about                                      \home\home
        // entries:   { '\about\about': [ './src/about/about.html' ] }  { '\about\about': [ './src/about/about.html' ],'\home\home': [ './src/home/home.html' ] }
        
        // 第三次循环 ./src/index/index.html ./src/index .html index \index\index { '\about\about': ['./src/about/about.html' ],'\home\home': [ './src/home/home.html' ],'\index\index': [ './src/index/index.html' ] }
    }
    return entries;
}

let pages = Object.keys(getEntry('./src/*/*.html', 'src'));
// console.log(pages);        //\about\about,\home\home,\index\index

pages.forEach(function (pathname) {
  // console.log(pathname);                   // \about\about  \home\home  \index\index
  const fileName = pathname.split('\\')[1];
  //console.log(fileName);                    // about  home  index
  const conf = {
      filename: fileName + '.html',
      template: './src' + pathname + '.html',
      inject: 'body',
      chunks: ['vendors', 'manifest', fileName]    // 多页面入口必须定义
  };
  plugins.push(new HtmlWebpackPlugin(conf));
  entry[fileName] = `./src/${pathname}.js`;
});

module.exports = {
  entry: entry,
  output: {                                      // 踩坑之路，必须要有输出，不然htmlWebpackPlugin无法正确加载文件
    path: path.resolve(__dirname, 'dist'),
    filename: "js/[name].[hash].js",
    chunkFilename: "js/[name].chunk.js",
    publicPath: "/dist/"
    /*
      publicPath: "https://cdn.example.com/assets/", // CDN（总是 HTTPS 协议）
      publicPath: "//cdn.example.com/assets/", // CDN (协议相同)
      publicPath: "/assets/", // 相对于服务(server-relative)
      publicPath: "assets/", // 相对于 HTML 页面
      publicPath: "../assets/", // 相对于 HTML 页面
      publicPath: "", // 相对于 HTML 页面（目录相同）
     */
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),    //需要先有打包文件再启动服务器
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
          use: [
            {
                loader: 'css-loader',
                options: {
                    // If you are having trouble with urls not resolving add this setting.
                    // See https://github.com/webpack-contrib/css-loader#url
                    url: false,
                    minimize: true,
                    sourceMap: true
                }
            }, 
            {
                loader: 'sass-loader',
                options: {
                    sourceMap: true
                }
            }
          ]
        })
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      }
    ]
  },
  plugins: plugins
};