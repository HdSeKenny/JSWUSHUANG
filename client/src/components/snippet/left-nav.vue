<template>
  <section class="left-nav">
    <nav class="sidebar">
      <el-menu
        :default-active="activeMenu || defaultActive"
        class="menu-vertical tac"
        background-color="#2c3037"
        text-color="#919293"
        active-text-color="#fff"
        :collapse-transition="false"
        :router="true"
      >
        <div class="brand tac mt15 mb15">
          <h3 class="theme-text-color bold logo" @click="goBackHome">DKP管理</h3>
        </div>
        <div class="tac admin-info inb">
          <el-avatar :size="60" :src="currentUser.avatar"></el-avatar>
          <p class="mt5 mb5 bold">{{ currentUser.game_name }}</p>
        </div>
        <el-menu-item index="/home">
          <BaseIcon name="info" />
          <span slot="title">DKP信息</span>
        </el-menu-item>
        <el-menu-item index="/auction">
          <BaseIcon name="star-off" />
          <span slot="title">竞拍管理</span>
        </el-menu-item>
        <el-menu-item index="/order-manage" v-if="isAdmin">
          <BaseIcon name="document" />
          <span slot="title">订单管理</span>
        </el-menu-item>
        <el-menu-item index="/notice" v-if="isAdmin">
          <BaseIcon name="bell" />
          <span slot="title">用户消息</span>
        </el-menu-item>
        <el-menu-item index="/profile">
          <BaseIcon name="setting" />
          <span slot="title">个人中心</span>
        </el-menu-item>
        <el-menu-item index="/settings" v-if="isRoot">
          <BaseIcon name="menu" />
          <span slot="title">网站设置</span>
        </el-menu-item>
        <div class="left-nav-footer">
          <div class="action" @click="onLogOut">
            <font-awesome-icon icon="sign-out-alt" class="icon mr5" />
            <span>登出</span>
          </div>
        </div>
      </el-menu>
    </nav>
  </section>
</template>

<script>
import { app, config } from '@src/app.config'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'left-nav',
  data() {
    const { path } = this.$router.history.current
    return {
      appName: app.name,
      appUrl: app.url,
      defaultActive: path,
      baseUrl: config.SERVER_API_BASE_URL,
    }
  },

  computed: {
    ...mapState('auth', {
      currentUser: (state) => state.currentUser,
      isAdmin: (state) => state.isAdmin,
      isRoot: (state) => state.isRoot,
    }),
    activeMenu() {
      return this.$router.history.current.path
    },
  },

  methods: {
    ...mapActions('auth', ['logOut']),
    goBackHome() {
      if (this.$router.history.current.path !== '/home') {
        this.$router.push({ name: 'home' })
      }
    },
    onLogOut() {
      this.logOut()
      this.$router.push({ name: 'login' })
    },
  },
  created() {
    this.$store.dispatch('auth/getMembers')
  },
}
</script>

<style lang="scss">
.left-nav {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
  -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
  .sidebar {
    height: 100%;
    overflow-y: auto;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
    -webkit-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 0 6px 0 rgba(0, 0, 0, 0.04);
  }
  .menu-vertical {
    width: 220px;
    min-height: 100%;
    padding-bottom: 65px;
    text-shadow: 0 1px 3px #222;
    transition: none;
    .el-menu-item,
    .el-submenu__title {
      font-size: 15px;
      font-weight: 500;
      height: 40px;
      line-height: 40px;
      transition: none;
      &.is-active {
        color: #fff;
      }
      &:hover,
      &:focus {
        color: #fff !important;
        i {
          color: #fff;
        }
      }
    }

    .el-submenu {
      transition: none;
      .el-submenu__title {
        font-size: 15px;
        font-weight: 500;
      }
      .el-submenu__icon-arrow {
        display: none;
      }
      &.is-active {
        color: $theme-color;
        .el-submenu__title {
          border-bottom: none;
        }
      }
      .el-menu-item {
        font-size: 13px;
        font-weight: 500;
        height: 30px;
        line-height: 30px;
        padding-left: 55px !important;
        transition: none;
      }
    }

    [class^='el-icon-'] {
      margin-left: -10px;
    }
  }

  .admin-info {
    color: #fff;
    margin: 20px 0 30px 0;
  }
  .left-nav-footer {
    color: #fff;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    min-height: 60px;
    padding: 20px 40px;
    text-align: right;
    .action {
      color: #919293;
      font-size: 15px;
      &:hover {
        color: #fff;
        cursor: pointer;
      }
    }
  }
}
</style>
