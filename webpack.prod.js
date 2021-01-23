const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = [
    {
        entry: {
            'js-runtime-types': './src/index.js',
        },
        module: {
            rules: [
                {test: /\.js$/, use: 'babel-loader'},
            ],
        },
        resolve: {
            extensions: ['.js', '.json'],
        },
        output: {
            filename: '[name].min.js',
        },
    },
    {
        entry: {
            'docs': './docs/src/index.js',
        },
        module: {
            rules: [
                {test: /\.js$/, use: 'babel-loader'},
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                inject: true,
                hash: true,
                template: './docs/src/index.html',
            }),
        ],
        resolve: {
            extensions: ['.js', '.json'],
        },
        output: {
            path: path.resolve(__dirname, './docs'),
            filename: 'dist/[name].min.js',
        },
    },
];
