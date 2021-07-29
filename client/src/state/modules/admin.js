import HttpRequest from '@state/request'
import { ACTIONS } from '@state/constants'
import { getSavedState, saveState } from './utils'

export const state = {
  settingsTab: getSavedState('current_settings_tab') || 'RECOVER',
}

export const mutations = {
  UPDATE_SETTINGS_TAB_SUCCESS(state, newVal) {
    state.settingsTab = newVal
    saveState('current_settings_tab', newVal)
  },
}

export const getters = {}

export const actions = {
  // This is automatically run in `src/state/store.js` when the app
  // starts, along with any other actions named `init` in other modules.
  init({ state, dispatch }) {

  },

  updateSettingsTab({ commit }, tabVal) {
    commit(ACTIONS.UPDATE_SETTINGS_TAB_SUCCESS, tabVal)
  },

  searchUsers({ commit }, params) {
    return HttpRequest
      .post('/api/admin/all/users', params)
      .then((data) => data)
      .catch((error) => Promise.reject({
        message: error.response.data.message
      }))
  },
}
