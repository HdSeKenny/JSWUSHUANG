<template>
  <el-card shadow="never" class="signup-card" v-loading="loading">
    <h4 class="theme-color bold m0">申请账户</h4>
    <p class="error" v-if="error">{{ error }}</p>
    <el-form
      :model="ruleForm"
      status-icon
      :rules="rules"
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
        <el-button
          type="primary"
          @click="tryToSignup('ruleForm')"
          class="signup-btn bold"
          >申请</el-button
        >
        <p class="already-has m0">
          已经有账号,
          <span class="create bold value-blue" @click="signin">
            登陆
          </span>
        </p>
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
            trigger: 'change',
          },
        ],
        password: [
          {
            required: true,
            message: CHI_SIMS.enter_password,
            trigger: 'change',
          },
          {
            min: 6,
            message: CHI_SIMS.short_password,
            trigger: 'change',
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
    },
  },
}
</script>

<style lang="scss" scoped>
.signup-card {
  width: 360px;
  border: none;
}
.signup-form {
  .el-input {
    margin: 5px 0;
  }
  .signup-btn {
    width: 30%;
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
    .already-has {
      width: 70%;
      font-size: 16px;
      text-align: right;
    }
  }
  .proselection {
    width: 100%;
  }
}
</style>
