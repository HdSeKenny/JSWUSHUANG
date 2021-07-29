import HttpRequest from '@state/request'
import { ACTIONS } from '@state/constants'

export const state = {
  orders: []
}

export const mutations = {
  GET_ORDERS_SUCCESS(state, orders) {
    state.orders = orders
  },
  DELETE_ORDER_SUCCESS(state, id) {
    state.orders = state.orders.filter(o => o._id !== id)
  },
  UPDATE_ORDER_SUCCESS(state, newVal) {
    const order = state.orders.find(o => o._id === newVal._id)
    Object.assign(order, { status: newVal.status })
  },
  SOCKET_auction_payer_message(state, newVal) {
    state.orders.push(newVal)
  }
}

export const actions = {
  fetchOrders({ commit, state, rootState }) {
    if (state.orders.length) {
      return Promise.resolve(state.orders)
    }

    return HttpRequest.get('/api/orders')
      .then((data) => {
        commit(ACTIONS.GET_ORDERS_SUCCESS, data)
        return data
      })
      .catch((error) => Promise.reject({
        message: error.response.data.message
      }))
  },

  deleteOrder({ commit, state }, id) {
    return HttpRequest.delete(`/api/orders/${id}`)
      .then((data) => {
        commit(ACTIONS.DELETE_ORDER_SUCCESS, id)
      })
      .catch((error) => Promise.reject({
        message: error.response.data.message
      }))
  },
}
