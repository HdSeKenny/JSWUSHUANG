import HttpRequest from '@state/request'
import { ACTIONS } from '@state/constants'
import { config } from '@src/app.config'
import { getSavedState, saveState, clear } from './utils'

const BASE_URL = '/api/users'

export const state = {
  _token: getSavedState('auth._token'),
  profileTab: getSavedState('current_user_tab') || 'INFO',
  homeTab: getSavedState('current_home_tab') || 'ALL',
  isRoot() {
    return this.currentUser ? this.currentUser.role === 'root' : false
  },
  isAdmin() {
    return this.currentUser ? ['admin', 'root'].includes(this.currentUser.role) : false
  },
  isLookedAdmin() {
    return this.currentUser ? this.currentUser.role === 'looked_admin' : false
  },
  members: [],
  backupedList: [],
  currentUser: {},
  announcement: '如果有改名的, 自己登陆网站, 去个人主页更改名字'
}

export const mutations = {
  GET_CURRENT_USER_SUCCESS(state, newValue) {
    state.currentUser = newValue
  },

  GET_TOKEN_SUCCESS(state, newValue) {
    state._token = newValue
    saveState('auth._token', newValue)
  },

  CLEAR_ALL_DATA(state) {
    state._token = null
  },

  UPDATE_PROFILE_TAB(state, newVal) {
    state.profileTab = newVal
    saveState('current_user_tab', newVal)
  },
  UPDATE_HOME_TAB(state, newVal) {
    state.homeTab = newVal
    saveState('current_home_tab', newVal)
  },
  GET_MEMBERS_SUCCESS(state, members) {
    state.members = members
  },

  DELETE_MEMBERS_SUCCESS(state, mid) {
    state.members = state.members.filter((m) => m._id !== mid)
  },

  GET_USERS_SUCCESS(state, users) {
    state.users = users
  },

  DEAL_DKP_SUCCESS(state, newVal) {
    const dkpScore = state.currentUser.dkp_score
    const newDkpScore = Object.assign({}, dkpScore, {
      sum: newVal.new_dkp_update.sum,
      transaction: newVal.new_dkp_update.transaction
    })

    state.currentUser = Object.assign({}, state.currentUser, {
      dkp_transaction_records: newVal.new_transaction_records,
      dkp_score: newDkpScore
    })
  },

  GET_BACKUP_LIST_SUCCESS(state, newVal) {
    state.backupedList = newVal
  },

  UPDATE_BACKUP_LIST_SUCCESS(state, newVal) {
    state.backupedList = newVal
  },

  CHANGE_USER_INFO_SUCCESS(state, newVal) {
    Object.assign(state.currentUser, newVal)
  },

  GET_ANNOUNCEMENT_SUCCESS(state, newVal) {
    const [obj] = newVal
    if (obj && obj.announcement) {
      state.announcement = obj.announcement
    }
  },

  UPDATE_ANNOUNCEMENT_SUCCESS(state, newVal) {
    state.announcement = newVal.announcement
  },

  SOCKET_auction_receive(state, val) {
    if (val.newStatusGood.au_type === '铜钱') {
      const { previous_price, current_price, previous_payer, current_payer } = val.newStatusGood
      const isSamePayer = previous_payer._id === current_payer._id
      const isCurrentUserCurrentPayer = state.currentUser._id === current_payer._id
      const isCurrentUserPreviousPayer = state.currentUser._id === previous_payer._id
      if (isCurrentUserCurrentPayer) {
        Object.assign(state.currentUser, { gold: state.currentUser.gold - current_price })
      }

      if (!isSamePayer && isCurrentUserPreviousPayer) {
        Object.assign(state.currentUser, { gold: state.currentUser.gold + previous_price })
      }
    }
  }
}

export const getters = {
  loggedIn(state) {
    return !!state._token
  },
  isRoot(state) {
    return state.currentUser ? state.currentUser.role === 'root' : false
  },
  isAdmin(state) {
    return state.currentUser ?  ['admin', 'root'].includes(state.currentUser.role) : false
  },
  isLookedAdmin(state) {
    return state.currentUser ? state.currentUser.role === 'looked_admin' : false
  },
}

export const actions = {
  // This is automatically run in `src/state/store.js` when the app
  // starts, along with any other actions named `init` in other modules.
  init({ state, dispatch }) {
    // setDefaultAuthHeaders(state)
    // dispatch('validate')
  },

  getAnnouncement({ commit, state }) {
    return HttpRequest.get('/api/admin')
      .then((data) => {
        commit(ACTIONS.GET_ANNOUNCEMENT_SUCCESS, data)
        return data
      }).catch((err) => {
        return Promise.reject({
          message: err.toString(),
          status: err.response.status
        })
      })
  },

  updateAnnouncement({ commit, state }, params) {
    return HttpRequest.put(`/api/admin`, params)
      .then((data) => {
        commit(ACTIONS.UPDATE_ANNOUNCEMENT_SUCCESS, data)
        return data
      }).catch((err) => {
        return Promise.reject({
          message: err.toString(),
          status: err.response.status
        })
      })
  },

  // Logs in the current user.
  logIn({ commit, dispatch, getters }, { username, password } = {}) {
    if (getters.loggedIn) return dispatch('validate')

    return HttpRequest.post('/auth/local', { email: username, password }, true)
      .then((data) => {
        commit(ACTIONS.GET_TOKEN_SUCCESS, data.token)
        return HttpRequest.get('/api/users/me').then((data) => {
          commit(ACTIONS.GET_CURRENT_USER_SUCCESS, data)
        })
      })
      .catch((err) => {
        commit(ACTIONS.GET_CURRENT_USER_SUCCESS, null)
        return Promise.reject({
          message: err.response.data.message
        })
      })
  },

  signUp({ commit, dispatch }, params = {}) {
    return HttpRequest
      .post('/api/users', {
        email: params.game_id,
        game_id: params.game_id,
        password: params.password,
        profession: params.profession
      }, true)
      .then((data) => data)
      .catch((error) => {
        const errObj = {
          message: error.response.data.message
        }
        if (error.response && error.response.status === 401) {
          commit(ACTIONS.GET_CURRENT_USER_SUCCESS, null)
        }
        if (error.response && error.response.status === 500) {
          errObj.message = error.response.data.errors.game_id.message
        }
        return Promise.reject(errObj)
      })
  },

  logOut({ commit, dispatch }) {
    dispatch('dkps/clearDKPData', {}, { root: true })
    commit('CLEAR_ALL_DATA')
    clear()
  },

  // Validates the current user's token and refreshes it
  // with new data from the API.
  validate({ commit, state }) {
    if (!state._token) return Promise.resolve(null)
    return HttpRequest.get('/api/users/me')
      .then((data) => {
        commit(ACTIONS.GET_CURRENT_USER_SUCCESS, data)
        return data
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          commit(ACTIONS.GET_CURRENT_USER_SUCCESS, null)
        }

        commit(ACTIONS.GET_TOKEN_SUCCESS, null)
        return null
      })
  },

  updateProfileTab: ({ commit }, tabVal) => {
    commit('UPDATE_PROFILE_TAB', tabVal)
  },

  updateHomeTab: ({ commit }, tabVal) => {
    commit('UPDATE_HOME_TAB', tabVal)
  },

  getMembers({ commit, state }) {
    if (!state.isAdmin()) {
      return Promise.resolve()
    }

    return HttpRequest.get('/api/users/accept/members')
      .then((data) => {
        commit(ACTIONS.GET_MEMBERS_SUCCESS, data)
        return data
      })
      .catch((error) => Promise.reject({
        message: error.response.data.message
      }))
  },

  throughApplication({ commit, state }, params) {
    return HttpRequest
      .post(`/api/users/${params.mid}/though/application`, params)
      .then((data) => {
        commit(ACTIONS.DELETE_MEMBERS_SUCCESS, params.mid)
        return data
      })
      .catch((error) => Promise.reject({
        message: error.response.data.message
      }))
  },

  deleteApplication({ commit, state }, id) {
    return HttpRequest
      .delete(`/api/users/${id}/member`)
      .then((data) => {
        commit(ACTIONS.DELETE_MEMBERS_SUCCESS, id)
        return data
      })
      .catch((error) => Promise.reject({
        message: error.response.data.message
      }))
  },

  changePassword({ commit, state }, params) {
    return HttpRequest
      .put(`/api/users/${state.currentUser._id}/password`, params)
      .then((data) => data)
      .catch((error) => Promise.reject({
        message: error.response.data.message
      }))
  },

  getUsers({ commit }) {
    return HttpRequest.get(BASE_URL).then((data) => {
      commit(ACTIONS.GET_USERS_SUCCESS, data)
    })
  },

  dealDkp({ commit, state, dispatch }, params) {
    const { _id } = state.currentUser
    return HttpRequest
      .post(`${BASE_URL}/${_id}/deal/dkp`, params)
      .then((data) => {
        commit(ACTIONS.DEAL_DKP_SUCCESS, data)

        const dkpScore = state.currentUser.dkp_score
        const newDkpScore = Object.assign({}, dkpScore, {
          sum: data.new_dkp_update.sum,
          transaction: data.new_dkp_update.transaction
        })
        return dispatch('dkps/updateSingleDkp', newDkpScore, { root: true })
      })
  },

  backup({ commit }) {
    return HttpRequest
      .post('/api/admin/backup')
      .then((data) => {
        commit(ACTIONS.UPDATE_BACKUP_LIST_SUCCESS, data)
        return data
      })
      .catch((error) => Promise.reject({
        message: error.response.data.message
      }))
  },

  getBackupList({ commit }) {
    return HttpRequest
      .get('/api/admin/backup/list')
      .then((data) => {
        commit(ACTIONS.GET_BACKUP_LIST_SUCCESS, data)
        return data
      })
      .catch((error) => Promise.reject({
        message: error.response.data.message
      }))
  },

  downloadExcel({ state }) {
    const downloadTarget = `${config.SERVER_API_BASE_URL}/api/dkps/all/download`
    const url = `${downloadTarget}?access_token=${state._token}`
    // Create a HTML5 download link
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = ''

    document.body.appendChild(a)
    a.click()

    // Remove this link after download ot cancel
    document.body.removeChild(a)
  },

  resetPassword({ commit }, id) {
    return HttpRequest
      .put(`/api/users/${id}/password/reset`)
      .then((data) => {
        // commit(ACTIONS.GET_USERS_SUCCESS, data)
        return data
      })
      .catch((error) => Promise.reject({
        message: error.response.data.message
      }))
  },

  createNewLookedAdminUser() {
    return HttpRequest
      .post(`/api/admin/create/admin_user`)
      .then((data) => {
        // commit(ACTIONS.GET_USERS_SUCCESS, data)
        return data
      })
      .catch((error) => Promise.reject({
        message: error.response.data.message
      }))
  },

  changeUserInfo({ commit, state }, params) {
    return HttpRequest
    .post(`/api/users/${state.currentUser.game_id}/change/userinfo`, params)
    .then((data) => {
      commit(ACTIONS.CHANGE_USER_INFO_SUCCESS, data)
      return data
    })
    .catch((error) => Promise.reject({
      message: error.response.data.message
    }))
  },

  recoverBackupData({ commit }, params) {
    return HttpRequest
      .post(`/api/admin/recover`, params)
      .then((data) => {
        // commit(ACTIONS.CHANGE_USER_INFO_SUCCESS, data)
        return data
      })
      .catch((error) => Promise.reject({
        message: error.response.data.message
      }))
  },

  addGold({ commit }, params) {
    return HttpRequest
      .post('/api/admin/gold/add', params)
      .then((data) => data)
      .catch((error) => Promise.reject({
        message: error.response.data.message
      }))
  },

  recoverPersonalData({ commit }, params) {
    return HttpRequest
      .post('/api/admin/recover/personal', params)
      .then((data) => data)
      .catch((error) => Promise.reject({
        message: error.response.data.message
      }))
  }
}
