const path = require('path');
const resolveAppPath = relativePath => path.resolve(__dirname, relativePath);
/**
 * @type {import("webpack").Configuration}
 */
const opts = {
    mode: 'development',
    devtool: 'source-map',
    entry: {
        app: __dirname + '/src/index.ts'
    },
    output: {
        path: __dirname + '/dist',
        filename: 'app.js'
    },
    devServer: {
        contentBase: resolveAppPath('public'),
        publicPath: '/'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    optimization: {
        usedExports: true
    },

    module: {
        rules: [
            { test: /\.ts(x?)?/, exclude: /node_modules/, use: 'ts-loader' }
            // {
            //   enforce: 'pre',
            //   test: /\.js$/,
            //   loader: 'source-map-loader'
            // }
        ]
    }
};
module.exports = opts;
