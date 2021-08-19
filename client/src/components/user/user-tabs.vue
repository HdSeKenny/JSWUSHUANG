<template>
  <section class="user-tabs">
    <el-tabs
      type="border-card"
      :value="profileTab"
      @tab-click="onUserTabClick"
      :class="currentUser.role"
    >
      <el-tab-pane name="INFO" label="个人信息">
        <UserInfo :user="user" />
      </el-tab-pane>
      <el-tab-pane name="SETTINGS" label="用户设置">
        <UserSettings :user="user" />
      </el-tab-pane>

      <el-tab-pane name="SECURITY" label="安全设置">
        <div class="auth" style="width: 30%">
          <el-button type="text bold">修改密码</el-button>
          <el-form
            :model="passwordForm"
            :rules="rules"
            ref="passwordForm"
            label-position="left"
            class="password-form"
          >
            <el-form-item prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                placeholder="输入旧密码"
                type="password"
              ></el-input>
            </el-form-item>
            <el-form-item prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                placeholder="输入新密码"
                type="password"
              ></el-input>
            </el-form-item>
            <el-form-item prop="confirmNewPassword">
              <el-input
                v-model="passwordForm.confirmNewPassword"
                placeholder="确认新密码"
                type="password"
              ></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="warning" @click="submitForm('passwordForm')">提交</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </section>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { CHI_SIMS } from '@src/app.config'
import UserInfo from './user-info.vue'
import UserSettings from './user-settings.vue'

export default {
  name: 'user-tabs',
  components: {
    UserInfo,
    UserSettings,
  },
  props: {
    user: {
      type: Object,
    },
  },
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
    ...mapActions('auth', ['logOut', 'updateProfileTab', 'changePassword']),
    onUserTabClick(tab, event) {
      this.updateProfileTab(tab.name)
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.changePassword({
            oldPassword: this.passwordForm.oldPassword,
            newPassword: this.passwordForm.newPassword,
          })
            .then(() => {
              this.logOut()
              this.$router.push({ name: 'login' })
              this.$message({
                type: 'success',
                message: '修改成功, 请重新登录',
              })
            })
            .catch((err) => {
              this.$message({
                type: 'error',
                message: err.message,
              })
            })
        } else {
          return false
        }
      })
    },
  },
  computed: {
    ...mapState('auth', {
      currentUser: (state) => state.currentUser,
      profileTab: (state) => state.profileTab,
      isAdmin: (state) => state.isAdmin,
      isLookedAdmin: (state) => state.isLookedAdmin,
    }),
  },
}
</script>
