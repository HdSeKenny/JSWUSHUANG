const SvgStore = require('webpack-svgstore-plugin')

require('dotenv').config()

const appConfig = require('./src/app.config')
const { DEV_CLIENT_HOST, DEV_CLIENT_PORT } = appConfig.config
const { SERVER_API_BASE_URL, NODE_ENV } = process.env

/** @type import('@vue/cli-service').ProjectOptions */
const _allConfigs = {
  assetsDir: './src/assets/',
  configureWebpack: {
    plugins: [
      // svg icons
      new SvgStore({
        prefix: 'icon--',
        svgoOptions: {
          plugins: [{ cleanupIDs: false }, { collapseGroups: false }, { removeTitle: true }]
        }
      })
    ]
  },
  // https://github.com/neutrinojs/webpack-chain/tree/v4#getting-started
  chainWebpack(config) {
    // We provide the app's title in Webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    config.set('name', appConfig.title)

    // Set up all the aliases we use in our app.
    config.resolve.alias.clear().merge(require('./aliases.config').webpack)

    // Don't allow importing .vue files without the extension, as
    // it's necessary for some Vetur autocompletions.
    config.resolve.extensions.delete('.vue')

    // Only enable performance hints for production builds,
    // outside of tests.
    config.performance.hints(process.env.NODE_ENV === 'production' && !process.env.VUE_APP_TEST && 'warning')
  },

  css: {
    sourceMap: true,
    loaderOptions: {
      // pass options to sass-loader
      // @/ is an alias to src/
      // so this assumes you have a file named `src/variables.sass`
      // Note: this option is named as "data" in sass-loader v7
      // sass: {
      //   prependData: `@import "~@/variables.sass"`
      // },
      // by default the `sass` option will apply to both syntaxes
      // because `scss` syntax is also processed by sass-loader underlyingly
      // but when configuring the `data` option
      // `scss` syntax requires an semicolon at the end of a statement, while `sass` syntax requires none
      // in that case, we can target the `scss` syntax separately using the `scss` option
      scss: {
        prependData: `@import "src/design/_colors.scss";`
      }
    }
 
  },

  devServer: {
    public: `${DEV_CLIENT_HOST || '127.0.0.1'}:${DEV_CLIENT_PORT || 8080}`,
    port: DEV_CLIENT_PORT || 8080,
    watchOptions: {
      poll: true
    },
    proxy: SERVER_API_BASE_URL
  }
}

if (SERVER_API_BASE_URL && NODE_ENV === 'development') {
  _allConfigs.devServer.proxy = SERVER_API_BASE_URL
}

module.exports = _allConfigs
