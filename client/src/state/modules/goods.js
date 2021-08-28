import HttpRequest from '@state/request'
import { ACTIONS } from '@state/constants'
import { getSavedState, saveState } from './utils'

export const state = {
  goods: [],
  imageUrls: [],
  goodTab: getSavedState('current_good_tab') || 'ALL',
}

export const getters = {
  getGoods() {
    return state.goods
  },
}

export const mutations = {
  GET_GOODS_SUCCESS(state, goods) {
    state.goods = goods
    state.imageUrls = goods.map((g) => g.image_url)
  },

  ADD_GOOD_SUCCESS(state, newValue) {
    state.goods.push(newValue)
    state.imageUrls = state.goods.map((g) => g.image_url)
  },

  DELETE_GOOD_SUCCESS(state, gId) {
    state.goods = state.goods.filter((g) => g._id !== gId)
    state.imageUrls = state.goods.map((g) => g.image_url)
  },

  UPDATE_GOOD_TAB_SUCCESS(state, newVal) {
    state.gooTab = newVal
    saveState('current_good_tab', newVal)
  },

  SOCKET_auction_receive(state, val) {
    const statusGood = state.goods.find((g) => val.good_id == g._id)
    Object.assign(statusGood, val.newStatusGood)
  },

  SOCKET_auction_start_back(state, val) {
    const statusGood = state.goods.find((g) => val._id == g._id)
    Object.assign(statusGood, { status: 1, started_at: val.started_at })
  },

  SOCKET_auction_end_back(state, val) {
    const statusGood = state.goods.find((g) => val._id == g._id)
    Object.assign(statusGood, { status: 2, ended_at: val.ended_at })
  },

  SOCKET_add_new_good_back(state, val) {
    const good = state.goods.find((g) => val._id == g._id)
    if (!good) {
      state.goods.push(val)
      state.imageUrls = state.goods.map((g) => g.image_url)
    }
  },
}

export const actions = {
  fetchGoods({ commit, state, rootState }) {
    if (state.goods.length) {
      return Promise.resolve(state.goods)
    }

    return HttpRequest.get('/api/goods', {}, true)
      .then((data) => {
        commit(ACTIONS.GET_GOODS_SUCCESS, data)
        return data
      })
      .catch((error) =>
        Promise.reject({
          message: error.response.data.message,
        })
      )
  },

  addGood({ commit }, formData) {
    return HttpRequest.post('/api/goods', formData, false, {
      'Content-Type': 'multipart/form-data',
    })
      .then((data) => {
        commit(ACTIONS.ADD_GOOD_SUCCESS, data)
        return data
      })
      .catch((err) => {
        console.log(err)
        return Promise.reject(
          new Error({
            message: err.toString(),
          })
        )
      })
  },

  deleteGood({ commit }, gId) {
    return HttpRequest.delete(`/api/goods/${gId}`)
      .then(() => {
        commit(ACTIONS.DELETE_GOOD_SUCCESS, gId)
      })
      .catch((error) =>
        Promise.reject({
          message: error.response.data.message,
        })
      )
  },

  updateGoodTab: ({ commit }, tabVal) => {
    commit(ACTIONS.UPDATE_GOOD_TAB_SUCCESS, tabVal)
  },
}
