<template>
  <section class="user-info">
    <div class="avatar-wrapper">
      <el-button type="text bold">更新头像</el-button>
      <SlimWrapper :imageDidLoad="imageDidLoad" label="上传头像" />
      <el-button type="primary mt10" @click="onUploadAvatar">上传</el-button>
    </div>
    <div class="personal mt15">
      <el-button type="text bold">个人信息</el-button>
      <p class="field mt0 mb5">
        <span class="label">游戏ID: </span>
        <span class="value">{{ currentUser.game_id }}</span>
      </p>
      <p class="field mt0 mb5">
        <span class="label">游戏名: </span>
        <span class="value">{{ currentUser.game_name }}</span>
      </p>
      <p class="field mt0 mb5">
        <span class="label">职业: </span>
        <span class="value">{{ currentUser.profession }}</span>
      </p>
      <p class="field mt0 mb5">
        <span class="label">帮会: </span>
        <span class="value">{{ currentUser.gang }}</span>
      </p>
      <p class="field mt0 mb5">
        <span class="label">邮箱: </span>
        <span class="value">{{ currentUser.email }}</span>
      </p>
    </div>
  </section>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import SlimWrapper from '@components/slim/slim-wrapper.vue'

export default {
  name: 'user-info',
  props: {
    user: {
      type: Object,
    },
  },
  data() {
    return {
      avatar: '',
    }
  },
  components: {
    SlimWrapper,
  },
  computed: {
    ...mapState('auth', {
      currentUser: (state) => state.currentUser,
    }),
  },
  methods: {
    ...mapActions('auth', ['changeUserAvatar']),

    imageDidLoad(file, image) {
      this.avatar = file
    },
    onUploadAvatar() {
      if (!this.avatar) {
        return this.$message({
          type: 'warning',
          message: '请选择一张图片',
        })
      }
      const fd = new FormData()
      fd.append('avatar', this.avatar)

      this.loading = true
      this.changeUserAvatar(fd).then(() => {
        this.loading = false
        this.$message({
          title: '提示',
          message: '上传成功',
          type: 'success',
          duration: 3000,
        })
      })
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@design';

.user-info {
  height: $tab-content-normal-height;
  .avatar-wrapper {
    width: 190px;
    vertical-align: top;
  }
  .dkp-info {
    margin-top: 30px;
  }
  .field {
    .label {
      font-size: 16px;
      font-weight: 500;
      margin-right: 5px;
    }
    .value {
      font-size: 16px;
    }
  }
}
</style>
