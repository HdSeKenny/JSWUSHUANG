import axios from 'axios'
import Cookies from 'js-cookie'
import { getSavedState, clear } from './modules/utils'
import { MESSAGES } from './constants'

const authenticated = (noAuth, options) => new Promise((resolve, reject) => {
  const _csrf = Cookies.getJSON('_csrf')
  const headers = Object.assign({}, options || {})
  if (process.env.NODE_ENV === 'production') {
    headers['x-csrf-token'] = _csrf
  }

  if (noAuth) {
    return resolve({ headers })
  }

  const _token = getSavedState('auth._token')
  if (!_token) {
    return reject({
      message: MESSAGES.AUTH_FAILED
    })
  }
  headers.Authorization = `Bearer ${_token}`
  return resolve({ headers })
})

const HttpRequest = {
  get: (url, params, noAuth, _options) => {
    return authenticated(noAuth, _options)
      .then((options) => axios
        .get(url, options)
        .then((response) => response.data)
        .catch((error) => {
          if (error.response.status === 401
            && error.response.statusText === 'Unauthorized') {
            clear()
          }
          return Promise.reject(error)
        })
      )
  },

  post: (url, params, noAuth, _options) => {
    return authenticated(noAuth, _options)
      .then((options) => axios
        .post(url, params, options)
        .then((response) => response.data)
        .catch((error) => {
          return Promise.reject(error)
        })
      )
  },

  delete: (url, params, noAuth, _options) => {
    return authenticated(noAuth, _options)
      .then((options) => axios
        .delete(url, options, params)
        .then((response) => response.data)
        .catch((error) => {
          return Promise.reject(error)
        })
      )
  },

  put: (url, params, noAuth, _options) => {
    return authenticated(noAuth, _options)
      .then((options) => axios
        .put(url, params, options)
        .then((response) => response.data)
        .catch((error) => {
          return Promise.reject(error)
        })
      )
  },
}

export default HttpRequest
