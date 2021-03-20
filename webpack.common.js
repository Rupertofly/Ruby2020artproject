const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
/** @type {import("webpack").Configuration} */
const opts = {
    entry: {
        app: __dirname + '/src/index.ts'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].[contenthash].bundle.js',
        chunkFilename: '[name].[contenthash].bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.scss']
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },

    module: {
        rules: [
            { test: /\.ts(x?)?/, exclude: /node_modules/, use: 'ts-loader' },
            {
                test: /\.pug$/,
                use: 'pug-loader'
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ template: './src/index.pug', title: 'webpack' })
    ]
};
module.exports = opts;
