<template>
  <div class="navbar-wrapper">
    <el-menu
      :default-active="defaultActive"
      :router="true"
      class="el-menu-demo"
      mode="horizontal"
      text-color="#2c3e50"
      menu-trigger="hover">
      <div class="brand">
        <h3 class="theme-text-color bold logo" @click="goBackHome">{{appName}}</h3>
      </div>
      <el-submenu index="" v-if="loggedIn" class="user-info-nav">
        <template slot="title">
          <img :src="currentUser.avatar" alt="avatar" class="avatar" />
        </template>
        <el-menu-item index="/profile">个人中心</el-menu-item>
        <el-menu-item @click="onLogOut">登出</el-menu-item>
      </el-submenu>
      <el-menu-item index="/notice" v-if="loggedIn" :style="{ lineHeight: '20px' }">
        <el-badge :value="members.length" class="item" type="warning">
          <font-awesome-icon icon="bell" class="icon" />
        </el-badge>
      </el-menu-item>

      <el-menu-item index="/order-manage" v-if="isAdmin">
        <font-awesome-icon icon="tasks" class="icon" />
        <span slot="title"> 订单管理</span>
      </el-menu-item>

      <el-menu-item index="/auction" v-if="loggedIn">
        <font-awesome-icon icon="fire" class="icon" />
        <span slot="title"> 竞拍</span>
      </el-menu-item>
      <!-- <el-menu-item index="/dkp-exchange" v-if="loggedIn">
        <font-awesome-icon icon="yen-sign" class="icon" />
        <span slot="title"> 积分交易</span>
      </el-menu-item> -->
      <el-menu-item index="/home" v-if="loggedIn">
        <font-awesome-icon icon="info" class="icon" />
        <span slot="title"> DKP信息</span>
      </el-menu-item>
      <el-menu-item index="/login" v-else> 登陆</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import { authComputed, authMethods } from '@state/helpers'
import { app, config } from '@src/app.config'

export default {
  name: 'navbar',
  data() {
    return {
      appName: app.name,
      appUrl: app.url,
      defaultActive: this.$router.history.current.path,
      baseUrl: config.SERVER_API_BASE_URL
    }
  },

  computed: {
    ...authComputed,
  },

  methods: {
    logOut: authMethods.logOut,

    goBackHome() {
      const isHome = this.$router.history.current.path === '/'
      if (!isHome) {
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
  }
}
</script>

<style lang="scss">
.navbar-wrapper {
  width: 100%;
  box-shadow: 0 2px 4px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.08);
}
.el-menu.el-menu--horizontal {
  padding: 0 60px;
  // border-bottom: none;
  .brand {
    font-size: 30px;
    font-weight: bold;
    color: $theme-color;
    height: 80px;
    line-height: 80px;
    display: inline-block;
    user-select: none;
    &:hover {
      cursor: pointer;
    }
    &:visited,
    &:focus {
      outline: none;
    }
    .logo {
      margin: 20px 0;
    }
  }
  .avatar {
    width: 30px;
    border-radius: 50%;
  }
  .el-menu-item {
    float: right;
    font-size: 17px;
    font-weight: 500;
    height: 80px;
    line-height: 80px;
    &.is-active {
      color: $theme-color;
      border-bottom: none;
    }
    &:hover,
    &:focus {
      background-color: #fff !important;
      color: $theme-color !important;
      border-bottom: none;
    }
    .item {
      margin-top: 30px;
    }
  }

  .el-submenu {
    float: right;
    .el-submenu__title {
      font-size: 17px;
      font-weight: 500;
      height: 80px;
      line-height: 80px;
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
    &:hover,
    &:focus {
      background-color: #fff !important;
      color: $theme-color !important;
    }
    .el-menu-item {
      &:hover,
      &:focus {
        background-color: #fff !important;
        color: $theme-color !important;
      }
    }
  }
  .el-submenu__title {
    font-size: 17px;
    font-weight: 500;
    height: 80px;
    line-height: 80px;
    &:hover,
    &:focus {
      background-color: #fff !important;
      color: $theme-color !important;
    }
  }
}

.el-menu--horizontal {
  .el-menu--popup.el-menu--popup-bottom-start {
    margin-top: 2px;
    .el-menu-item {
      font-weight: 500;
      padding: 0 18px;
      &:hover,
      &:focus {
        background-color: #fff !important;
        color: $theme-color !important;
      }
    }
  }
}
</style>
