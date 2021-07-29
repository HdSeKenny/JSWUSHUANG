<template>
  <div class="login-page" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.6)">
    <el-card shadow="never" class="login-card" v-if="showLogin">
      <h2 class="tac mb5 header">
        登录到 <span class="theme-color">{{gangName}}</span>
      </h2>
      <p class="m0 tac app-url">{{appUrl}}
        <el-button type="text" class="p0 bold fr mb10 mt10 mr5" @click="signup">
          {{chiSims.create_account}}
        </el-button>
      </p>
      <form class="login-form mt15" @submit.prevent="tryToLogIn">
        <el-input
          v-model="gameId"
          name="gameId"
          prefix-icon="el-icon-user"
          :placeholder="chiSims.enter_game_id"
          autofocus
        />
        <el-input
          v-model="password"
          name="password"
          prefix-icon="el-icon-key"
          :placeholder="chiSims.enter_password"
          @keyup.enter.native="tryToLogIn"
          type="password"
          class="mt15"
        />
        <p class="error" v-if="error">{{error}}</p>
        <el-row class="signin">
          <el-button type="primary" @click="tryToLogIn" class="login-btn bold">
            {{chiSims.login}}
          </el-button>
        </el-row>
      </form>
    </el-card>

    <template v-if="!showLogin">
      <SignUp :onShowLogin="onShowLogin" />
    </template>
  </div>
</template>

<script>
import { authMethods } from '@state/helpers'
import { CHI_SIMS, app } from '@src/app.config'
import loginBackgroundImage from '@assets/images/nsh_bg_6.png'
import SignUp from './sign-up.vue'

export default {
  name: 'login',
  components: { SignUp },
  data() {
    return {
      chiSims: CHI_SIMS,
      appName: app.name,
      appUrl: app.url,
      gangName: app.gangName,
      gameId: null,
      password: null,
      error: null,
      tryingToLogIn: false,
      checked: true,
      loading: true,
      showLogin: true
    }
  },
  methods: {
    ...authMethods,

    tryToLogIn() {
      if (!this.gameId) {
        return this.$message({
          type: 'error',
          message: '请输入游戏ID',
          duration: 3000,
        })
      }

      if (!this.password) {
        return this.$message({
          type: 'error',
          message: '请输入游戏密码',
          duration: 3000,
        })
      }

      this.tryingToLogIn = true
      this.error = null
      this.loading = true

      return this.logIn({
        username: this.gameId,
        password: this.password,
      })
      .then((token) => {
        this.loading = false
        this.tryingToLogIn = false
        this.$router.push(
          this.$route.query.redirectFrom || { name: 'home' }
        )
      })
      .catch((error) => {
        this.loading = false
        this.tryingToLogIn = false
        this.$message({
          type: 'error',
          message: error.message,
          duration: 3000,
        })
      })
    },

    signup() {
      this.showLogin = false
    },

    onShowLogin() {
      this.showLogin = true
    }
  },

  mounted() {
    const _bg = document.createElement('img')
    // const imgUrl = '../../src/assets/images/nsh_bg_6.png'
    _bg.src = loginBackgroundImage
    _bg.style.visibility = 'hidden'
    _bg.onload = () => {
      this.loading = false
      _bg.remove() 
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  width: 100%;
  height: 100%;
  background-image: url('../../assets/images/nsh_bg_6.png');
  background-repeat: no-repeat;
  background-size: cover;
  .login-card {
    width: 360px;
    background-color: rgba(255, 255, 255, 0);
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    border: none;
    position: absolute;
    .header,
    .app-url {
      color: rgba(255, 255, 255, 0.7);
    }
  }
  .login-form {
    .el-input {
      margin: 5px 0;
    }
    .login-btn {
      width: 100%;
      margin: 20px 0 0 0;
    }
    .error {
      margin: 5px 0;
      font-size: 14px;
      color: $error-color;
    }
  }
}
</style>
