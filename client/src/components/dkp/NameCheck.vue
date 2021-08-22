<template>
  <div class="name-check">
    <div class="mb15">
      <el-alert
        :title="checked_notification"
        type="success"
        class="notification"
        show-icon
        v-if="myDKP.checked_name"
      ></el-alert>
      <el-alert
        :title="non_notification"
        type="error"
        class="notification"
        show-icon
        v-else
      ></el-alert>
    </div>
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
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'NameCheck',
  data() {
    return {
      imageUrl: '',
      checked_notification: '你的名称已校验, 如果改名, 需重新校验',
      non_notification: '你还没有校验你的名字, 请选择当前页面的第四个标签进行校验',
    }
  },
  computed: {
    ...mapState('auth', {
      currentUser: (state) => state.currentUser,
    }),
    ...mapState('dkps', {
      DKPData: (state) => state.DKPData,
    }),
    myDKP() {
      return this.DKPData.find((d) => d.game_name === this.currentUser.game_name) || {}
    },
  },

  methods: {
    ...mapActions('dkps', ['getMembersByOCR']),

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
  },
}
</script>

<style lang="scss">
@import '@design';

.name-check {
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
    &:hover {
      border-color: $theme-color;
    }
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
