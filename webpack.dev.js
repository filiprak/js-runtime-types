const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './docs/src/index.js',
    module: {
        rules: [
            {test: /\.js$/, use: 'babel-loader'},
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({inject: true, template: './docs/src/index.html'}),
    ],
    resolve: {
        extensions: ['.js', '.json'],
    },
};
