'use strict'
const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}

const proxyUrl = 'https://admin.zrhq874.com/api';
const title = 'Admin' // page title

//自动导入element ui
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')


const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave:false,
  devServer: {
    port: 8080,
    // open: true,
    proxy: {
      [process.env.VUE_APP_BASE_API]: {
        target: proxyUrl, 
        changeOrigin: true, // 将基于名称的虚拟托管网站的选项，如果不配置，请求会报404  如果接口跨域，需要进行这个参数配置
        ws: true, // true / false，是否代理websockets
        secure: false, // 如果是https接口，需要配置这个参数
        pathRewrite: {
          ['^' + process.env.VUE_APP_BASE_API]: ''
        }
      }
    }
  },
  configureWebpack:{
     // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: title,
    plugins: [
      //auto import element ui
      AutoImport({
        resolvers: [ElementPlusResolver({importStyle: false})],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ]
  },
  chainWebpack(config) {
    // 设置 svg-sprite-loader
    // 首先把原来svg应用的loader(file-loader)先排除 file-loader，但是这个loader不对svg文件不做任何操作，只是把资源移动到打包之后的文件中
    config.module.rule('svg').exclude.add(resolve('src/icons')).end()
    // 专门增加一个icons的规则
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  }
  
})
