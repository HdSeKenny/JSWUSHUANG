<template>
  <section class="user-info">
    <div class="mt10 mb10">
      <el-button type="text">个人信息</el-button>
      <p class="field mt0 mb5">
        <span class="label">游戏ID: </span>
        <span class="value">{{currentUser.game_id}}</span>
      </p>
      <p class="field mt0 mb5">
        <span class="label">游戏名: </span>
        <span class="value">{{currentUser.game_name}}</span>
      </p>
      <p class="field mt0 mb5">
        <span class="label">职业: </span>
        <span class="value">{{currentUser.profession}}</span>
      </p>
      <p class="field mt0 mb5">
        <span class="label">帮会: </span>
        <span class="value">{{currentUser.gang}}</span>
      </p>
      <p class="field mt0 mb5">
        <span class="label">邮箱: </span>
        <span class="value">{{currentUser.email}}</span>
      </p>
    </div>
    <div class="mt10" v-if="editable">
      <el-button type="text">修改信息</el-button>
      <div class="edit-fields">
        <el-select v-model="editValue" placeholder="请选择">
          <el-option v-for="item in editOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <div class="mt10">
          <el-input type="text" class="new-value" placeholder="请填写新的名字" v-model="newFieldValue"></el-input>
        </div>
        <div class="mt10">
          <el-button type="warning" class="update-btn" @click="onChangeUserInfo">更新</el-button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { authMethods, authComputed } from '@src/state/helpers';

export default {
  name: 'user-info',
  props: {
    user: {
      type: Object,
    },
  },
  data(prop) {
    return {
      editValue: 'game_name',
      newFieldValue: '',
      editOptions: [
        { label: '游戏名称', value: 'game_name' },
      ],
      editable: false
    }
  },
  computed: {
    ...authComputed,
  },
  methods: {
    ...authMethods,

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
    }
  }
}
</script>

<style lang="scss" scoped>
.user-info {
  padding: 0 20px;
  min-height: 500px;
  .dkp-info {
    margin-top: 30px;
  }
  .field {
    .label {
      font-size: 16px;
      font-weight: 500;
      margin-right: 5px;
      // color: #909399;
    }
    .value {
      font-size: 16px;
      // color: #909399;
    }
  }
  .new-value {
    width: 216px;
  }
  .update-btn {
    margin-top: -1px;
  }
}
</style>
