/* eslint-disable, camelcase */
import _ from 'lodash'
import HttpRequest from '@state/request'
import {
  FILTERED_CHARACTERS,
  ACTIONS,
  CHINESE_REGEX,
  UNREADABLE_WORDS,
  INVALID_CHARACTERS,
  UNREADABLE_CHARACTER,
} from '@state/constants'

import { saveState, getSavedState } from './utils'

const STOREKEYS = {
  DKPS: 'DKP_DATA',
}

const getTheCorrentOne = (data, word) => {
  const wordLengthArr = data.map((d) => d.game_name.length)
  const distanceArr = wordLengthArr.map((wl) => wl - word.length)
  const min = Math.min(...distanceArr)
  const idx = distanceArr.findIndex((d) => d === min)
  return data[idx]
}

const calculateDKPSum = (data) => {
  const plusFields = [
    'league_friday',
    'league_saturday',
    'field',
    'territorial_stronghold',
    'original',
  ]
  const reduceFields = ['payment']
  let sum = 0
  for (let i = 0; i < plusFields.length; i++) {
    const field = plusFields[i]
    sum += data[field] || 0
  }

  for (let i = 0; i < reduceFields.length; i++) {
    const field = reduceFields[i]
    sum -= data[field] || 0
  }

  return sum
}

export const state = {
  DKPData: [],
  validWords: [],
  gangAdmins: [],
}

export const getters = {
  DKPData: (state) => state.DKPData,
}

export const mutations = {
  GET_DKP_DATA_SUCCESS(state, newVal) {
    state.DKPData = newVal.sort((a, b) => new Date(b.updated) - new Date(a.updated))
    saveState(STOREKEYS.DKPS, state.DKPData)
  },
  IMPORT_DKP_DATA_SUCCESS(state, newVal) {
    state.DKPData = newVal
    saveState(STOREKEYS.DKPS, state.DKPData)
  },
  UPDATE_DKP_DATA_SUCCESS(state, newVal) {
    state.DKPData = state.DKPData.filter((d) => d.game_id !== newVal.game_id)
    state.DKPData.push(newVal)
    state.DKPData = state.DKPData.sort((a, b) => new Date(b.updated) - new Date(a.updated))
    saveState(STOREKEYS.DKPS, state.DKPData)
  },

  UPDATE_MANY_DKP_SUCCESS(state, newVal) {
    const gameIds = newVal.map((nv) => nv.game_id)
    const temp = state.DKPData.filter((d) => !gameIds.includes(d.game_id))
    const newDKPData = temp.concat(newVal).sort((a, b) => new Date(b.updated) - new Date(a.updated))
    state.DKPData = newDKPData
    saveState(STOREKEYS.DKPS, state.DKPData)
  },

  CLEAR_DKP_DATA_SUCCESS(state) {
    state.DKPData = []
    saveState(STOREKEYS.DKPS, state.DKPData)
  },

  DELETE_DKP_SUCCESS(state, id) {
    state.DKPData = state.DKPData.filter((d) => d._id !== id)
    saveState(STOREKEYS.DKPS, state.DKPData)
  },

  ADD_NEW_DKP_SUCCESS(state, newVal) {
    state.DKPData.unshift(newVal)
    saveState(STOREKEYS.DKPS, state.DKPData)
  },

  CHECKED_NAME_SUCCESS(state, newVal) {
    state.DKPData = newVal.newDKP ? [newVal.newDKP] : []
    saveState(STOREKEYS.DKPS, state.DKPData)
  },

  SOCKET_auction_receive(state, val) {
    if (val.newStatusGood.au_type !== 'DKP') {
      return
    }

    const { previous_price, current_price, previous_payer, current_payer } = val.newStatusGood
    const isSamePayer = previous_payer._id === current_payer._id
    const currentPayerDkp = state.DKPData.find((d) => current_payer.game_name === d.game_name)
    const payment = currentPayerDkp.payment + current_price
    const sum = currentPayerDkp.sum - current_price
    Object.assign(currentPayerDkp, { payment, sum })

    if (!isSamePayer) {
      const previousPayerDkp = state.DKPData.find((d) => previous_payer.game_name === d.game_name)
      const previousPayment = previousPayerDkp.payment - previous_price
      const previousSum = previousPayerDkp.sum + previous_price
      Object.assign(previousPayerDkp, {
        payment: previousPayment,
        sum: previousSum,
      })
    }
  },

  RESET_DKP_INFO_SUCCESS() {},
  SET_VALID_WORDS(state, validWords) {
    state.validWords = validWords
  },

  GET_GANG_ADMINS_SUCCESS(state, data) {
    state.gangAdmins = data
  },
  ADD_GANG_ADMIN_SUCCESS(state, data) {
    state.gangAdmins.push(data)
  },
  UPDATE_GANG_ADMIN_SUCCESS(state, data) {
    const gangAdmins = state.gangAdmins.filter(ga => ga._id !== data._id)
    state.gangAdmins = [data, ...gangAdmins]
  },
  DELETE_GANG_ADMIN_SUCCESS(state, id) {
    state.gangAdmins = state.gangAdmins.filter(ga => ga._id !== id)
  },
}

export const actions = {
  fetchDKPData({ commit, state, rootState }) {
    if (state.DKPData.length) {
      return Promise.resolve(state.DKPData)
    }

    const stored = getSavedState(STOREKEYS.DKPS)

    if (stored && stored.length) {
      commit(ACTIONS.GET_DKP_DATA_SUCCESS, stored)
      return Promise.resolve(stored)
    }

    const { currentUser } = rootState.auth
    const admins = ['admin', 'looked_admin', 'root']
    const requestWrapper = () =>
      admins.includes(currentUser.role)
        ? HttpRequest.get('/api/dkps')
        : HttpRequest.get(`/api/dkps/${currentUser.game_id}`)

    return requestWrapper()
      .then((data) => {
        commit(ACTIONS.GET_DKP_DATA_SUCCESS, data)
        return data
      })
      .catch((error) =>
        Promise.reject({
          message: error.message || error.response.data.message,
        })
      )
  },

  importAllExcelData({ commit, state, rootState }, data) {
    return HttpRequest.post(`/api/dkps/all`, data)
      .then((_data) => {
        commit(ACTIONS.IMPORT_DKP_DATA_SUCCESS, _data)
        return _data
      })
      .catch((error) =>
        Promise.reject({
          message: error.response.data.message,
        })
      )
  },

  updateDKPInfo({ commit, state, rootState }, params) {
    const { currentUser } = rootState.auth
    const edittedDkp = state.DKPData.find((d) => d.game_id === params.edittedObj.game_id)
    return HttpRequest.post(`/api/dkps/${edittedDkp._id}/info`, {
      ...params,
      operator: currentUser._id,
      dkpId: edittedDkp._id,
    })
      .then((data) => {
        commit(ACTIONS.UPDATE_DKP_DATA_SUCCESS, data)
        return data
      })
      .catch((error) =>
        Promise.reject({
          message: error.response.data.message,
        })
      )
  },

  calculateManyInfo({ commit, rootState }, data) {
    const { activity, activityText, dkp, members } = data.params
    const histories = []
    const newData = members.map((d) => {
      const result = { game_id: d.game_id.toString(), data: {} }
      const matched = data.dkps.find((dd) => dd.game_id == d.game_id)
      const _sum = matched.sum ? parseInt(matched.sum) : calculateDKPSum(matched)
      result.data[activity] = parseInt(matched[activity] || 0) + parseInt(dkp)
      result.data.sum = _sum + parseInt(dkp)
      result.dkpId = matched._id
      // dkp history
      const historyObj = {
        type: 'batch',
        fields: [
          {
            key: activity,
            oldValue: parseInt(matched[activity] || 0),
            newValue: result.data[activity],
            text: activityText,
            symbol: '+',
            changed_value: dkp,
          },
        ],
        sum_after_changed: result.data.sum,
        operator: rootState.auth.currentUser._id,
        created: new Date(),
        dkp: matched._id,
      }

      histories.push(historyObj)
      result.histories = matched.histories
      return result
    })

    return HttpRequest.post(`/api/dkps/some/update`, { newData, histories })
      .then((_data) => {
        commit(ACTIONS.UPDATE_MANY_DKP_SUCCESS, _data)
      })
      .catch((error) => {
        console.log('calculateManyInfo error', error)
        return Promise.reject(error)
      })
  },

  updateManyDKPInfo: ({ commit, state, rootState, dispatch }, data) => {
    if (!state.DKPData.length) {
      return dispatch('fetchDKPData').then((dkps) => {
        return dispatch('calculateManyInfo', { dkps, params: data })
      })
    }

    return dispatch('calculateManyInfo', { dkps: state.DKPData, params: data })
  },

  updateSingleDkp({ commit }, data) {
    commit(ACTIONS.UPDATE_DKP_DATA_SUCCESS, data)
  },

  clearDKPData({ commit }) {
    commit(ACTIONS.CLEAR_DKP_DATA_SUCCESS)
  },

  deleteDkp({ commit, state }, gameId) {
    const _dkp = state.DKPData.find((d) => d.game_id === gameId)
    return HttpRequest.delete(`/api/dkps/${_dkp._id}`)
      .then(() => {
        commit(ACTIONS.DELETE_DKP_SUCCESS, _dkp._id)
      })
      .catch((error) =>
        Promise.reject({
          message: error.response.data.message,
        })
      )
  },

  getMembersByOCR({ state, commit }, { formData, name }) {
    return HttpRequest.post('/api/ocr', formData, false, {
      'Content-Type': 'multipart/form-data',
    })
      .then((data) => {
        if (name) {
          commit('CHECKED_NAME_SUCCESS', data)
          return Promise.resolve()
        }
        console.log('initial', data)
        const validWords = []
        data.words_result.forEach((result) => {
          const word = result.words
          const invalid = INVALID_CHARACTERS.some((ic) => word.includes(ic))
          const filtered = FILTERED_CHARACTERS.some((fc) => word === fc)
          if (!invalid && !filtered) {
            validWords.push(word)
          }
        })
        console.log('validWords', validWords)
        const members = []
        validWords.forEach((word) => {
          const hasManyIncludes = state.DKPData.filter(
            (d) => d.game_name !== word && d.checked_name !== word && d.game_name.includes(word)
          )

          if (hasManyIncludes.length) {
            let _member = hasManyIncludes[0]
            if (hasManyIncludes.length > 1) {
              _member = getTheCorrentOne(hasManyIncludes, word)
            }

            members.push({
              game_id: _member.game_id,
              game_name: _member.game_name,
            })

            return
          }

          const dkpRecord = state.DKPData.find((record) => {
            const { checked_name, game_name } = record
            const isCheckedName = checked_name === word
            const isGameName = game_name === word
            if (isCheckedName || isGameName) return true

            let ocrChinese = word.replace(CHINESE_REGEX, '')
            const readableWord = UNREADABLE_WORDS[ocrChinese]
            if (readableWord) {
              return game_name === readableWord || game_name.includes(readableWord)
            }

            let dkpChinese = game_name.replace(CHINESE_REGEX, '')
            UNREADABLE_CHARACTER.forEach((uc) => {
              dkpChinese = dkpChinese.replace(uc, '')
              ocrChinese = ocrChinese.replace(uc, '')
            })
            return dkpChinese.includes(ocrChinese)
          })

          if (dkpRecord) {
            members.push({
              game_id: dkpRecord.game_id,
              game_name: dkpRecord.game_name,
            })
          }
        })

        commit('SET_VALID_WORDS', validWords)

        return _.uniqBy(members, 'game_id')
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

  createNewDKP({ state, commit }, params) {
    return HttpRequest.post('/api/dkps', params)
      .then((data) => {
        commit(ACTIONS.ADD_NEW_DKP_SUCCESS, data)
        return data
      })
      .catch((error) =>
        Promise.reject({
          message: error.response.data.message,
        })
      )
  },

  resetDKPAndUserInfo({ commit }, params) {
    return HttpRequest.post('/api/dkps/reset', params)
      .then((data) => {
        commit(ACTIONS.RESET_DKP_INFO_SUCCESS, data)
      })
      .catch((error) =>
        Promise.reject({
          message: error.response.data.message,
        })
      )
  },
  setGangAdmin({ commit }, params) {
    return HttpRequest.post(`/api/dkps/${params}/setAdmin`, params)
      .then((data) => {
        console.log(data)
        commit(ACTIONS.UPDATE_DKP_DATA_SUCCESS, data)
      })
      .catch((error) =>
        Promise.reject({
          message: error.response.data.message,
        })
      )
  },
  getGangAdminsInfo({ commit }, params) {
    return HttpRequest.get(`/api/admin/info/gang_admins`)
      .then((data) => {
        commit(ACTIONS.GET_GANG_ADMINS_SUCCESS, data)
      })
      .catch((error) =>
        Promise.reject({
          message: error.response.data.message,
        })
      )
  },
  addNewGangAdmin({ commit }, params) {
    return HttpRequest.post(`/api/admin/gang_admin`, params)
      .then((data) => {
        commit(ACTIONS.ADD_GANG_ADMIN_SUCCESS, data)
      })
      .catch((error) =>
        Promise.reject({
          message: error.response.data.message,
        })
      )
  },
  updateGangAdmin({ commit }, params) {
    return HttpRequest.put(`/api/admin/${params._id}`, params)
      .then((data) => {
        commit(ACTIONS.UPDATE_GANG_ADMIN_SUCCESS, data)
      })
      .catch((error) =>
        Promise.reject({
          message: error.response.data.message
        })
      )
  },
  deleteGangAdmin({ commit }, params) {
    return HttpRequest.delete(`/api/admin/${params}`, params)
      .then((data) => {
        commit(ACTIONS.DELETE_GANG_ADMIN_SUCCESS, params)
      })
      .catch((error) =>
        Promise.reject({
          message: error.response.data.message
        })
      )
  },
}
