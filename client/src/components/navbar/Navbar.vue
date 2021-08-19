<template>
  <div class="navbar-wrapper mb15">
    <el-menu
      :default-active="defaultActive"
      :router="true"
      class="el-menu-demo"
      mode="horizontal"
      text-color="#2c3e50"
      menu-trigger="hover"
    >
      <div class="brand">
        <h3 class="logo" @click="goBackHome">
          <img src="@assets/images/logo_nav.png" alt="logo" width="80" />
        </h3>
      </div>
      <el-submenu index="" v-if="loggedIn" class="user-info-nav">
        <template slot="title">
          <img :src="currentUser.avatar" alt="avatar" class="avatar" />
        </template>
        <el-menu-item index="/profile">个人中心</el-menu-item>
        <el-menu-item index="/settings" v-if="isRoot">网站设置</el-menu-item>
        <el-menu-item index="/notice" v-if="isRoot">用户消息</el-menu-item>
        <el-menu-item @click="onLogOut">登出</el-menu-item>
      </el-submenu>

      <el-menu-item index="/notice" v-if="isRoot" :style="{ lineHeight: '0' }">
        <el-badge :value="members.length" class="item" type="danger">
          <font-awesome-icon icon="bell" class="icon" />
        </el-badge>
      </el-menu-item>

      <!-- <el-menu-item index="/order-manage" v-if="isAdmin">
        <font-awesome-icon icon="tasks" class="icon" />
        <span slot="title"> 订单管理</span>
      </el-menu-item> -->

      <el-menu-item index="/home" v-if="loggedIn" class="left">
        <font-awesome-icon icon="info" class="icon" />
        <span slot="title"> DKP信息</span>
      </el-menu-item>
      <el-menu-item index="/auction" v-if="loggedIn" class="left">
        <font-awesome-icon icon="fire" class="icon" />
        <span slot="title"> 竞拍</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import { authComputed, authMethods } from '@state/helpers'
import { app } from '@src/app.config'

export default {
  name: 'Navbar',
  data() {
    return {
      appName: app.name,
      appUrl: app.url,
      defaultActive: this.$router.history.current.path,
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
  },
}
</script>

<style lang="scss">
@import '@design';

.navbar-wrapper {
  border: none;
  margin: 30px 60px 0 60px;
}
.el-menu.el-menu--horizontal {
  padding: 5px 15px;
  background: $transparent-seven-color;
  border: none;
  border-bottom: none !important;
  .brand {
    display: inline-block;
    user-select: none;
    float: left;
    margin-right: 50px;
    &:hover {
      cursor: pointer;
    }
    &:visited,
    &:focus {
      outline: none;
    }
    .logo {
      display: flex;
      align-items: center;
      margin: 5px 0;
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
    height: 60px;
    line-height: 60px;
    &.left {
      float: left;
    }
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
      height: 60px;
      line-height: 60px;
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
    height: 60px;
    line-height: 60px;
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
