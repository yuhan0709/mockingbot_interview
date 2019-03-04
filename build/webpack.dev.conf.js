// 开发配置
const path = require("path");
const merge = require("webpack-merge");
const baseWebpackConfig = require("./webpack.base.conf.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = merge(baseWebpackConfig,{
    mode: 'development',    //开发模式
    output: {
        filename: "js/[name].[hash:16].js",
    },
    // 原错误检查
    devtool: 'inline-source-map',
    plugins: [
        // 处理html
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname,"../public/index.html"),
            inject: 'body',   // 将script标签位于html文件的body底部
            minify: {
                html5: true
            },
            hash: true
        }),
        // 热更新
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer:{
        port: '3000',
        contentBase: path.join(__dirname, '../public'),
        hot: true, //开启热更新
        open: true,  // 自动打开浏览器
        proxy: {}  // 代理
    }
})