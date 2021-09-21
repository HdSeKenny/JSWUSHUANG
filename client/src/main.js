import Vue from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import VueCountdown from '@chenfengyuan/vue-countdown'
// import SocketIO from 'socket.io-client'
// import VueSocketIO from 'vue-socket.io'
import imagePreloader from 'vue-image-preloader'

import '@src/plugins/elementui'
import '@src/plugins/vxe-table'
import '@components/_globals'
import '@state/indexdb'

import router from '@router'
import store from '@state/store'
import App from './app.vue'

// theme style
import '@assets/styles/theme/index.css'
import '@assets/slim/slim.min.css'
// import svgSpriteLoader from './utils/svg-sprite-loader'

// const __svg__ = {
//   path: './assets/images/icons/*.svg',
//   name: 'assets/images/[hash].sprite.svg',
// }

// svgSpriteLoader(__svg__.filename)

library.add(fas)

// Don't warn about using the dev version of Vue in development.
Vue.config.productionTip = process.env.NODE_ENV === 'production'

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component(VueCountdown.name, VueCountdown)
Vue.use(imagePreloader)
// Vue.use(
// new VueSocketIO({
//   debug: true,
//   connection: 'http://127.0.0.1:9001',
//   vuex: {
//     store,
//     actionPrefix: 'SOCKET_',
//     mutationPrefix: 'SOCKET_',
//   },
// options: { path: "/my-app/" }
// })
// )

export default new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')
