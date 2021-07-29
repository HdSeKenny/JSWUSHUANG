import Vue from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import VueCountdown from '@chenfengyuan/vue-countdown'
// import SocketIO from 'socket.io-client'
// import VueSocketIO from 'vue-socket.io';
import imagePreloader from 'vue-image-preloader'

import ElementUI from 'element-ui'
import '@assets/styles/theme/index.css'
import '@assets/slim/slim.min.css'
import '@components/_globals'
// Globally register all `_base`-prefixed components

import router from '@router'
import store from '@state/store'
import App from './app.vue'
import svgSpriteLoader from './utils/svg-sprite-loader'

// import appConfig from './app.config'

const __svg__ = {
  path: './assets/images/icons/*.svg',
  name: 'assets/images/[hash].sprite.svg'
}
svgSpriteLoader(__svg__.filename)

// Don't warn about using the dev version of Vue in development.
Vue.config.productionTip = process.env.NODE_ENV === 'production'

// If running inside Cypress...
if (process.env.VUE_APP_TEST === 'e2e') {
  // Ensure tests fail when Vue emits an error.
  Vue.config.errorHandler = window.Cypress.cy.onUncaughtException
}

library.add(fas)

Vue.use(ElementUI)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component(VueCountdown.name, VueCountdown)
Vue.use(imagePreloader)

const app = new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')

// If running e2e tests...
if (process.env.VUE_APP_TEST === 'e2e') {
  // Attach the app to the window, which can be useful
  // for manually setting state in Cypress commands
  // such as `cy.logIn()`.
  window.__app__ = app
}
