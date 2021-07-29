import { mapState, mapGetters, mapActions } from 'vuex'

export const authComputed = {
  ...mapState('auth', {
    currentUser: (state) => state.currentUser,
    profileTab: (state) => state.profileTab,
    homeTab: (state) => state.homeTab,
    members: (state) => state.members,
    announcement: (state) => state.announcement,
  }),
  ...mapGetters('auth', ['loggedIn', 'isAdmin', 'isLookedAdmin', 'isRoot'])
}

export const goodComputed = {
  ...mapState('goods', {
    goods: (state) => state.goods,
    imageUrls: (state) => state.imageUrls,
    goodTab: (state) => state.goodTab,
  }),
  ...mapGetters('goods', ['getGoods'])
}

export const DKPComputed = {
  ...mapState('dkps', {
    DKPData: (state) => state.DKPData,
  }),
  ...mapGetters('dkps', ['DKPData'])
}


export const orderComputed = {
  ...mapState('orders', {
    orders: (state) => state.orders,
  }),
  ...mapGetters('orders', [])
}

export const authMethods = mapActions('auth', [
  'logIn',
  'logOut',
  'updateProfileTab',
  'updateHomeTab',
  'signUp',
  'getMembers',
  'throughApplication',
  'deleteApplication',
  'changePassword',
  'getUsers',
  'dealDkp',
  'resetPassword',
  'createNewLookedAdminUser',
  'changeUserInfo',
  'getAnnouncement',
  'updateAnnouncement',
  'addGold',
])

export const goodMethods = mapActions('goods', [
  'fetchGoods',
  'addGood',
  'deleteGood',
  'updateGoodTab',
])

export const DKPMethods = mapActions('dkps', [
  'fetchDKPData',
  'importAllExcelData',
  'updateDKPInfo',
  'updateManyDKPInfo',
  'updateSingleDkp',
  'clearDKPData',
  'deleteDkp',
  'getMembersByOCR',
  'createNewDKP',
  'resetDKPAndUserInfo'
])

export const orderMethods = mapActions('orders', [
  'fetchOrders',
  'deleteOrder',
])
