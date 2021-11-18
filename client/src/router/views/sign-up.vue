<template>
  <el-card shadow="never" class="signup-card" v-loading="loading">
    <div class="apply bold m0 tac">
      <img src="@assets/images/logo3.png" alt="logo" width="300" />
    </div>
    <el-alert :title="error" type="error" v-if="error" class="mb10"> </el-alert>
    <el-form
      :model="ruleForm"
      status-icon
      :rules="rules"
      autocomplete="off"
      ref="ruleForm"
      class="signup-form"
      @submit.prevent="tryToSignup"
    >
      <el-form-item class="mb5" prop="gameId">
        <el-input
          :placeholder="CHI_SIMS.enter_game_id"
          v-model="ruleForm.gameId"
          prefix-icon="el-icon-user"
          name="gameId"
          type="number"
          autocomplete="off"
          autofocus
        />
      </el-form-item>
      <el-form-item class="mb5" prop="gameName">
        <el-input
          placeholder="请输入游戏名称"
          v-model="ruleForm.gameName"
          prefix-icon="el-icon-user"
          name="gameName"
          type="string"
          autocomplete="off"
          autofocus
        />
      </el-form-item>
      <el-form-item class="mb5" prop="wechat">
        <el-input
          placeholder="请输入微信号"
          v-model="ruleForm.wechat"
          prefix-icon="el-icon-user"
          name="wechat"
          type="string"
          autocomplete="off"
          autofocus
        />
      </el-form-item>
      <el-form-item class="mb5" prop="password">
        <el-input
          :placeholder="CHI_SIMS.enter_password"
          v-model="ruleForm.password"
          name="password"
          prefix-icon="el-icon-key"
          type="password"
          autocomplete="nope"
        />
      </el-form-item>
      <el-form-item class="mb5" prop="confirmPassword">
        <el-input
          :placeholder="CHI_SIMS.enter_confirm_password"
          v-model="ruleForm.confirmPassword"
          name="confirmPassword"
          prefix-icon="el-icon-key"
          type="password"
          autocomplete="off"
        />
      </el-form-item>
      <div class="submit inb mt15">
        <el-button type="primary" @click="tryToSignup('ruleForm')" class="signup-btn bold">
          申请
        </el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script>
import { authMethods } from '@state/helpers'
import { CHI_SIMS, app } from '@src/app.config'

export default {
  props: {
    onShowLogin: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      appName: app.name,
      appUrl: app.url,
      gangName: app.gangName,
      CHI_SIMS,
      ruleForm: {
        gameId: null,
        gameName: null,
        wechat: null,
        password: null,
        confirmPassword: null,
      },
      error: null,
      rules: {
        gameId: [
          {
            required: true,
            message: CHI_SIMS.enter_game_id,
            trigger: 'blur',
          },
        ],
        gameName: [
          {
            required: true,
            message: '请输入游戏名称',
            trigger: 'blur',
          },
        ],
        wechat: [
          {
            required: true,
            message: '请输入微信号',
            trigger: 'blur',
          },
        ],
        password: [
          {
            required: true,
            message: CHI_SIMS.enter_password,
            trigger: 'blur',
          },
          {
            min: 6,
            message: CHI_SIMS.short_password,
            trigger: 'blur',
          },
        ],
        confirmPassword: [
          {
            required: true,
            message: CHI_SIMS.enter_confirm_password,
            trigger: 'blur',
          },
          {
            validator: (rule, value, callback) => {
              if (this.ruleForm.password !== value) {
                callback(new Error(CHI_SIMS.two_different_password))
              } else {
                callback()
              }
            },
            trigger: 'blur',
          },
        ],
      },
      loading: false,
    }
  },
  methods: {
    ...authMethods,
    tryToSignup(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.loading = true
          return this.signUp({
            game_id: this.ruleForm.gameId,
            password: this.ruleForm.password,
            game_name: this.ruleForm.gameName,
            wechat: this.ruleForm.wechat,
          })
            .then(() => {
              this.$message({
                type: 'success',
                message: '申请成功, 等待管理通过',
                duration: 5000,
                showClose: true,
              })
              this.ruleForm = {
                gameId: null,
                gameName: null,
                wechat: null,
                password: null,
                confirmPassword: null,
              }
              this.loading = false
              this.$router.push({ name: 'login' })
            })
            .catch((error) => {
              this.loading = false
              this.error = error.message
            })
        }

        return false
      })
    },
    signin() {
      this.onShowLogin()
    },
  },
}
</script>

<style lang="scss" scoped>
.signup-card {
  width: 360px;
  border: none;
  // margin-top: 260px;
  background-color: $transparent-six-color;
}
.signup-form {
  margin-top: 30px;
  .el-input {
    margin: 5px 0;
  }
  .signup-btn {
    width: 100%;
  }
  .error {
    margin: 5px 0;
    font-size: 14px;
    color: $error-color;
  }
  .submit {
    width: 100%;
    display: flex;
    align-items: center;
  }
  .proselection {
    width: 100%;
  }
}
</style>
