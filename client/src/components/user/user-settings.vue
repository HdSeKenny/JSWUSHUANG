<template>
  <section class="user-settings" v-loading="loading">
    <div class="left">
      <div class="ocr">
        <el-button type="text bold">
          名称校验
          <span class="error">(重要: 此项作为今后的图片识别, 请务必完成校验)</span>
        </el-button>
        <el-upload
          accept=".jpg, .png, .jpeg"
          action=""
          class="avatar-uploader"
          :show-file-list="false"
          :on-remove="onOCRRemove"
          :on-change="handleChooseFile"
          :before-remove="beforeRemove"
          :auto-upload="false"
          :multiple="false"
          drag
        >
          <img v-if="imageUrl" :src="imageUrl" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
        <!-- <div class="checked-wrapper">
        <h5>你的名字: {{ currentUser.game_name }}</h5>
        <h5>你的校验: {{ checkedName }}</h5>
      </div> -->
      </div>
      <div class="change-info mt15" v-if="editable">
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
import { mapState } from 'vuex'
import { authMethods, DKPMethods } from '@state/helpers'

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
    ...authMethods,
    ...DKPMethods,

    onOCRRemove(file, fileList) {},

    handleChooseFile(file, fileList) {
      this.loading = true

      const reader = new FileReader()
      reader.onload = (e) => {
        this.imageUrl = URL.createObjectURL(file.raw)

        const fd = new FormData()
        fd.append('image-file', file.raw)
        fd.append('name', this.currentUser.game_name)

        this.getMembersByOCR({ formData: fd, name: this.currentUser.game_name })
          .then((data) => {
            this.loading = false
            this.$message({
              type: 'success',
              message: '校验成功',
            })
          })
          .catch(() => {
            this.loading = false
            this.imageUrl = null
            this.$message({
              type: 'error',
              message: '校验失败, 重新选择上传',
            })
          })
      }
      reader.readAsBinaryString(file.raw, 'GB2312')
    },

    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },

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
  // padding: 0 10px;
  display: flex;
  flex-wrap: wrap;
  .left,
  .auth {
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

  .el-upload-dragger {
    width: 158px;
    height: 158px;
  }

  .avatar-uploader .el-upload {
    border: 1px dashed $theme-color;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: $theme-color;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: $theme-color;
    width: 158px;
    height: 158px;
    line-height: 158px;
    text-align: center;
  }
  .avatar {
    width: 158px;
    height: 158px;
    display: block;
  }
}
</style>
