const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common');
const resolveAppPath = relativePath => path.resolve(__dirname, relativePath);
/**
 * @type {import("webpack").Configuration}
 */
const opts = {
    // mode: 'development',
    devtool: 'source-map',
    devServer: {
        // contentBase: path.join(__dirname, 'public'),
        compress: false,
        port: 8080,
        disableHostCheck: true,
        inline: true
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].[contenthash].bundle.js',
        chunkFilename: '[name].[contenthash].bundle.js'
    }
};
module.exports = merge(common, opts);
