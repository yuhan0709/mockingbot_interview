// 生产配置

const merge = require("webpack-merge");
const path = require("path");
const baseWebpcakConfig = require("./webpack.base.conf");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
 
module.exports = merge(baseWebpcakConfig,{
    mode:'production',
    plugins:[
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname,"../public/index.html"),
            minify:{
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            }
        }),
        new CleanWebpackPlugin(['../dist'],{allowExternal:true})
    ]
})