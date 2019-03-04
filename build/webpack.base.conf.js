// 公共配置
const path = require("path");
const DIST_PATH = path.resolve(__dirname,'../dist');
const APP_PATH = path.resolve(__dirname,'../src');

module.exports = {
    entry:{
        app:'./src/index.js',
    },
    output:{
        filename:'js/[name].[hash].js',
        path: DIST_PATH
    },
    module:{
        rules:[
            {
                test:/\.js?$/,
                use:"babel-loader",
                include:APP_PATH
            },{
                test: /\.css$/,
                use: ['style-loader','css-loader']
            },{
                test: /\.(png|jpg|gif)$/,
                use: [{
                    loader: 'url-loader',
                    options:{
                        publicPath: '/',
                        name: "images/[name].[ext]",
                        limit: 1000 
                    }
                }]
            },{
                test: /\.(woff|svg|eot|woff2|tff)$/,
                use: 'url-loader',
                exclude: /node_modules/
                // exclude忽略/node_modules/的文件夹
            }
        ]
    }
}
