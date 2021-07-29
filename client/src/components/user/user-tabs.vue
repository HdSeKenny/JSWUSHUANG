<template>
  <section class="user-tabs">
    <el-tabs
      :value="profileTab"
      @tab-click="onUserTabClick"
      :type="isAdmin || isLookedAdmin ? 'border-card' : ''"
      :class="currentUser.role">
      <el-tab-pane name="INFO" label="个人信息">
        <UserInfo :user="user" />
      </el-tab-pane>
      <el-tab-pane name="ORDER" label="我的竞拍">
        <UserOrder :user="user" />
      </el-tab-pane>
      <el-tab-pane name="SETTINGS" label="用户设置">
        <UserSettings :user="user" />
      </el-tab-pane>
    </el-tabs>
  </section>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import UserInfo from './user-info.vue'
import UserOrder from './user-order.vue'
import UserSettings from './user-settings.vue'

export default {
  name: 'user-tabs',
  components: {
    UserInfo,
    UserOrder,
    UserSettings,
  },
  props: {
    user: {
      type: Object
    }
  },
  methods: {
    ...mapActions('auth', [
      'updateProfileTab',
    ]),
    onUserTabClick(tab, event) {
      this.updateProfileTab(tab.name)
    }
  },
  computed: {
    ...mapState('auth', {
      currentUser: (state) => state.currentUser,
      profileTab: (state) => state.profileTab,
      isAdmin: (state) => state.isAdmin(),
      isLookedAdmin: (state) => state.isLookedAdmin()
    })
  }
}
</script>
