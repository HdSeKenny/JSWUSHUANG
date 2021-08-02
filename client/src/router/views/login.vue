<template>
  <div
    class="login-page"
    v-loading="loading"
    :element-loading-background="elementLoadingBackground"
  >
    <div>
      <h2 class="header">
        <img src="@assets/images/logo.png" alt="logo" width="150" />
        <span class="theme-color ml10">DKP系统</span>
      </h2>
      <el-card shadow="never" class="login-card" v-if="showLogin">
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
          <p class="error" v-if="error">{{ error }}</p>
          <el-row class="signin">
            <el-button
              type="primary"
              @click="tryToLogIn"
              class="login-btn bold"
            >
              {{ chiSims.login }}
            </el-button>

            <div class="no-account bold value-blue" @click="signup">
              没有账号？ {{ chiSims.create_account }}
            </div>
          </el-row>
        </form>
      </el-card>

      <template v-if="!showLogin">
        <SignUp :onShowLogin="onShowLogin" />
      </template>
      <Footer></Footer>
    </div>
  </div>
</template>

<script>
import { authMethods } from '@state/helpers'
import { CHI_SIMS } from '@src/app.config'
import Footer from '@components/snippet/Footer.vue'
import SignUp from './sign-up.vue'

export default {
  name: 'Login',
  components: { SignUp, Footer },
  data() {
    return {
      chiSims: CHI_SIMS,
      gameId: null,
      password: null,
      error: null,
      tryingToLogIn: false,
      checked: true,
      loading: true,
      showLogin: true,
      elementLoadingBackground: 'rgba(0, 0, 0, 0.6)',
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
          this.$router.push(this.$route.query.redirectFrom || { name: 'home' })
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
    },
  },

  mounted() {
    this.loading = false
    // const _bg = document.createElement('img')
    // const imgUrl = '../../src/assets/images/nsh_bg_6.png'
    // _bg.src = loginBackgroundImage
    // _bg.style.visibility = 'hidden'
    // _bg.onload = () => {
    //   _bg.remove()
    // }
  },
}
</script>

<style lang="scss" scoped>
@import '@design';

$app-name-font-size: 35px;
$login-card-width: 500px;
$login-card-margin: 10px auto;

.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  .header {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $app-name-font-size;
    color: $theme-color;
  }
  .login-card {
    width: $login-card-width;
    text-align: left;
    box-shadow: $card-box-shadow;
  }
  .login-form {
    .signin {
      margin-top: 20px;
      display: flex;
      align-items: center;
    }
    .el-input {
      margin: 5px 0;
    }
    .login-btn {
      width: 30%;
    }
    .error {
      margin: 5px 0;
      font-size: 14px;
      color: $error-color;
    }
    .no-account {
      width: 70%;
      text-align: right;
    }
  }

  .footer {
    // width: $login-card-width;
    // margin: $login-card-margin;
    padding: 20px 0px 10px 0px;
  }
}
</style>
