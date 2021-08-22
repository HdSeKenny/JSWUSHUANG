<template>
  <section class="user-settings" v-loading="loading">
    <div class="left">
      <div class="change-info" v-if="editable">
        <el-button type="text bold">修改信息</el-button>
        <div class="edit-fields">
          <el-select v-model="editValue" placeholder="请选择">
            <el-option
              v-for="item in editOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <div class="">
            <el-input
              type="text"
              class="new-value"
              placeholder="请填写新的名字"
              v-model="newFieldValue"
            ></el-input>
          </div>
          <div class="mt10">
            <el-button type="warning" class="update-btn" @click="onChangeUserInfo">更新</el-button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'UserSettings',

  data() {
    return {
      editValue: 'game_name',
      newFieldValue: '',
      editOptions: [{ label: '游戏名称', value: 'game_name' }],
      editable: true,
      imageUrl: '',
      checkedName: '',
      loading: false,
    }
  },

  computed: {
    ...mapState('auth', {
      currentUser: (state) => state.currentUser,
    }),
  },

  methods: {
    ...mapActions('auth', ['changeUserInfo']),

    onChangeUserInfo() {
      if (!this.newFieldValue) {
        return this.$notify({
          title: '提示',
          message: '不能为空',
          type: 'error',
          duration: 3000,
        })
      }

      if (this.newFieldValue === this.currentUser.game_name) {
        return this.$notify({
          title: '提示',
          message: '新名字和旧名字不能一样',
          type: 'error',
          duration: 3000,
        })
      }

      this.changeUserInfo({ game_name: this.newFieldValue })
        .then(() => {
          this.$notify({
            title: '提示',
            message: '操作成功',
            type: 'success',
            duration: 3000,
          })
        })
        .catch((err) => {
          this.$notify({
            title: '提示',
            message: err.message,
            type: 'error',
            duration: 3000,
          })
        })
    },
  },
}
</script>

<style lang="scss">
@import '@design';

.user-settings {
  height: $tab-content-normal-height;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  .left {
    width: 45%;
  }
  .change-info {
    width: 100%;
  }
  .password-form {
    width: 400px;
  }
  .new-value {
    width: 195px;
    margin-top: 15px;
    display: inline-block;
  }
}
</style>
