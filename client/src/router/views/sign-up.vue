<template>
  <el-card shadow="never" class="signup-card" v-loading="loading">
    <h4>申请 <span class="theme-color bold">{{gangName}}</span> 的账户</h4>
    <p class="error" v-if="error">{{error}}</p>
    <el-form
      :model="ruleForm"
      status-icon :rules="rules"
      autocomplete="off"
      ref="ruleForm"
      class="signup-form"
      @submit.prevent="tryToSignup"
    >
      <el-form-item class="mb15" prop="gameId">
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
      <el-form-item class="mb15" prop="password">
        <el-input
          :placeholder="CHI_SIMS.enter_password"
          v-model="ruleForm.password"
          name="password"
          prefix-icon="el-icon-key"
          type="password"
          autocomplete="nope"
        />
      </el-form-item>
      <el-form-item class="mb15" prop="confirmPassword">
        <el-input
          :placeholder="CHI_SIMS.enter_confirm_password"
          v-model="ruleForm.confirmPassword"
          name="confirmPassword"
          prefix-icon="el-icon-key"
          type="password"
          autocomplete="off"
        />
      </el-form-item>
      <div class="submit inb mt10">
        <el-button type="primary" @click="tryToSignup('ruleForm')" class="signup-btn bold">申请</el-button>
        <p class="already-has m0">已经有账号, <el-button type="text" class="create bold" @click="signin">登陆</el-button></p>
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
      default: () => {}
    }
  },
  data() {
    return {
      appName: app.name,
      appUrl: app.url,
      gangName: app.gangName,
      CHI_SIMS,
      ruleForm: {
        gameId: null,
        password: null,
        confirmPassword: null,
        profession: 'suimeng',
      },
      error: null,
      rules: {
        gameId: [
          {
            required: true,
            message: CHI_SIMS.enter_game_id,
            trigger: 'change'
          }
        ],
        password: [
          {
            required: true,
            message: CHI_SIMS.enter_password,
            trigger: 'change'
          },
          {
            min: 6,
            message: CHI_SIMS.short_password,
            trigger: 'change'
          }
        ],
        confirmPassword: [
          {
            required: true,
            message: CHI_SIMS.enter_confirm_password,
            trigger: 'blur'
          },
          {
            validator: (rule, value, callback) => {
              if (this.ruleForm.password !== value) {
                callback(new Error(CHI_SIMS.two_different_password))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      },
      loading: false,
    }
  },
  methods: {
    ...authMethods,
    tryToSignup(formName) {
      this.$refs[formName]
        .validate((valid) => {
          if (valid) {
            this.loading = true
            return this.signUp({
              game_id: this.ruleForm.gameId,
              password: this.ruleForm.password,
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
                password: null,
                confirmPassword: null,
                profession: 'suimeng',
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
    }
  },
}
</script>

<style lang="scss" scoped>
.signup-card {
  width: 360px;
  background-color: rgba(255, 255, 255, 0.8);
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  position: absolute;
  border: none;
}
.signup-form {
  margin-top: 20px;
  .el-input {
    margin: 5px 0;
  }
  .signup-btn {
    width: 150px;
  }
  .error {
    margin: 5px 0;
    font-size: 14px;
    color: $error-color;
  }
  .submit {
    width: 100%;
    .already-has {
      font-size: 16px;
      float: right;
    }
  }
  .proselection {
    width: 100%;
  }
}
</style>
