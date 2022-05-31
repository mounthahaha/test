// const path = require('path')
const webpack = require('webpack');
// 產生版本號檔案static/
const { preProcess } = require(`./src/utils/webpack`);

// end
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const proxyUrl = 'https://admin.zrhq874.com';

module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  // parallel: true,
  lintOnSave: false,
  transpileDependencies: ['vuetify'],
  chainWebpack: async config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        return options;
      });
    config.plugin('loadshReplace').use(new LodashModuleReplacementPlugin()); // 減少lodash的bundle size
  },
  configureWebpack: config => {
    preProcess();
    if (process.env.NODE_ENV === 'production') {
      config.devtool = false;
    }
    config.plugins.push(
      new webpack.ProvidePlugin({
        moment: 'moment',
      }),
    );
  },

  productionSourceMap: true,
  devServer: {
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 9982,
    https: false,
    hotOnly: false,
    proxy: {
      '/ugimg': {
        target: proxyUrl,
        xfwd: true,
      },
      '/ugimgFromBC': {
        target: proxyUrl,
        xfwd: true,
      },
      '/public': {
        target: proxyUrl,
        xfwd: true,
      },
      '/api': {
        target: proxyUrl,
        xfwd: true,
      },
    },
    // before: require('./mock'),
  },
};
