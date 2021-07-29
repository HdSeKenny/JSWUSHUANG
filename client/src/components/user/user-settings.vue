<template>
  <section class="user-settings">
    <h4>修改密码</h4>
    <el-form :model="passwordForm" :rules="rules" ref="passwordForm" label-position="left" class="password-form mt15">
      <el-form-item prop="oldPassword">
        <el-input v-model="passwordForm.oldPassword" placeholder="输入旧密码" type="password"></el-input>
      </el-form-item>
      <el-form-item prop="newPassword">
        <el-input v-model="passwordForm.newPassword" placeholder="输入新密码" type="password"></el-input>
      </el-form-item>
      <el-form-item prop="confirmNewPassword">
        <el-input v-model="passwordForm.confirmNewPassword" placeholder="确认新密码" type="password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('passwordForm')">提交修改</el-button>
      </el-form-item>
    </el-form>

  </section>
</template>

<script>
import { CHI_SIMS } from '@src/app.config'
import { authMethods } from '@state/helpers'

export default {
  name: 'user-settings',

  data() {
    return {
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      },
      rules: {
        oldPassword: [
          {
            required: true,
            message: CHI_SIMS.enter_password,
            trigger: 'change',
          },
        ],
        newPassword: [
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
        confirmNewPassword: [
          {
            required: true,
            message: CHI_SIMS.enter_confirm_password,
            trigger: 'blur',
          },
          {
            validator: (rule, value, callback) => {
              if (this.passwordForm.newPassword !== value) {
                callback(new Error(CHI_SIMS.two_different_password))
              } else {
                callback()
              }
            },
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    ...authMethods,

    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.changePassword({
            oldPassword: this.passwordForm.oldPassword,
            newPassword: this.passwordForm.newPassword
          })
          .then(() => {
            this.logOut()
            this.$router.push({ name: 'login' })
            this.$message({
              type: 'success',
              message: '修改成功, 请重新登录'
            })
          })
          .catch(err => {
            this.$message({
              type: 'error',
              message: err.message
            })
          })
        } else {
          return false
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.user-settings {
  padding: 0 20px;
  .password-form {
    width: 400px;
  }
}
</style>
