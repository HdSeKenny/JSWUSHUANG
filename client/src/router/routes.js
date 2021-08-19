import store from '@state/store'

export default [
  {
    path: '/home',
    name: 'home',
    component: () => lazyLoadView(import('@views/home.vue')),
    meta: {
      authRequired: true,
      // beforeResolve(routeTo, routeFrom, next) {},
    },
  },
  {
    path: '/auction',
    name: 'auction',
    component: () => lazyLoadView(import('@views/auction.vue')),
    meta: {
      authRequired: true,
    },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => lazyLoadView(import('@views/settings.vue')),
    meta: {
      authRequired: true,
      beforeResolve(routeTo, routeFrom, next) {
        if (store.getters['auth/isRoot']) {
          next()
        } else {
          next({ name: '404' })
        }
      },
    },
  },
  // {
  //   path: '/order-manage',
  //   name: 'order-manage',
  //   component: () => lazyLoadView(import('@views/order-manage.vue')),
  //   meta: {
  //     authRequired: true,
  //     beforeResolve(routeTo, routeFrom, next) {
  //       if (store.getters['auth/isAdmin']) {
  //         next()
  //       } else {
  //         next({ name: '404' })
  //       }
  //     }
  //   }
  // },
  {
    path: '/login',
    name: 'login',
    component: () => lazyLoadView(import('@views/login.vue')),
    meta: {
      beforeResolve(routeTo, routeFrom, next) {
        if (store.getters['auth/loggedIn']) {
          next({ name: 'home' })
        } else {
          next()
        }
      },
    },
  },
  {
    path: '/notice',
    name: 'notice',
    component: () => lazyLoadView(import('@views/notice.vue')),
    meta: {
      authRequired: true,
      beforeResolve(routeTo, routeFrom, next) {
        if (store.getters['auth/isAdmin']) {
          next()
        } else {
          next({ name: 'home' })
        }
      },
    },
  },
  // {
  //   path: '/dkp-exchange',
  //   name: 'dkp-exchange',
  //   component: () => lazyLoadView(import('@views/dkp-exchange.vue')),
  //   meta: {
  //     authRequired: true,
  //     beforeResolve(routeTo, routeFrom, next) {
  //       next()
  //     }
  //   }
  // },
  {
    path: '/profile',
    name: 'profile',
    component: () => lazyLoadView(import('@views/profile.vue')),
    meta: {
      authRequired: true,
    },
    props: (route) => ({ user: store.state.auth.currentUser || {} }),
  },
  {
    path: '/profile/:username',
    name: 'username-profile',
    component: () => lazyLoadView(import('@views/profile.vue')),
    meta: {
      authRequired: true,
      // HACK: In order to share data between the `beforeResolve` hook
      // and the `props` function, we must create an object for temporary
      // data only used during route resolution.
      tmp: {},
      beforeResolve(routeTo, routeFrom, next) {
        store
          // Try to fetch the user's information by their username
          .dispatch('users/fetchUser', { username: routeTo.params.username })
          .then((user) => {
            // Add the user to `meta.tmp`, so that it can
            // be provided as a prop.
            routeTo.meta.tmp.user = user
            // Continue to the route.
            next()
          })
          .catch(() => {
            // If a user with the provided username could not be
            // found, redirect to the 404 page.
            next({ name: '404', params: { resource: 'User' } })
          })
      },
    },
    // Set the user from the route params, once it's set in the
    // beforeResolve route guard.
    props: (route) => ({ user: route.meta.tmp.user }),
  },
  {
    path: '/404',
    name: '404',
    component: require('@views/_404.vue').default,
    // Allows props to be passed to the 404 page through route
    // params, such as `resource` to define what wasn't found.
    props: true,
  },
  // Redirect any unmatched routes to the 404 page. This may
  // require some server configuration to work in production:
  // https://router.vuejs.org/en/essentials/history-mode.html#example-server-configurations
  {
    path: '/',
    redirect: 'home',
  },
  {
    path: '*',
    redirect: '404',
  },
]

// Lazy-loads view components, but with better UX. A loading view
// will be used if the component takes a while to load, falling
// back to a timeout view in case the page fails to load. You can
// use this component to lazy-load a route with:
//
// component: () => lazyLoadView(import('@views/my-view'))
//
// NOTE: Components loaded with this strategy DO NOT have access
// to in-component guards, such as beforeRouteEnter,
// beforeRouteUpdate, and beforeRouteLeave. You must either use
// route-level guards instead or lazy-load the component directly:
//
// component: () => import('@views/my-view')
//
function lazyLoadView(AsyncView) {
  const AsyncHandler = () => ({
    component: AsyncView,
    // A component to use while the component is loading.
    // loading: require('@views/_loading.vue').default,
    // Delay before showing the loading component.
    // Default: 200 (milliseconds).
    delay: 200,
    // A fallback component in case the timeout is exceeded
    // when loading the component.
    error: require('@views/_timeout.vue').default,
    // Time before giving up trying to load the component.
    // Default: Infinity (milliseconds).
    timeout: 100000,
  })

  return Promise.resolve({
    functional: true,
    render(h, { data, children }) {
      // Transparently pass any props or children
      // to the view component.
      return h(AsyncHandler, data, children)
    },
  })
}
