<template>
  <section class="user-bar">
    <!-- <el-popover placement="top-start" trigger="hover" width="110" content="点击更改头像">
      <span>点击更改头像</span>
      <el-image :src="user.avatar" class="avatar" slot="reference" @click="onUploadAvatar">
        <div slot="placeholder" class="image-slot">
          加载中<span class="dot">...</span>
        </div>
      </el-image>
    </el-popover>
    <div class="info">
      <p class="m0">{{user.game_name}}</p>
      <p class="mt10 profession">(职业: {{user.profession}})</p>
    </div> -->

    <el-menu :default-active="profileTab" class="menu-vertical tac" @select="onUserTabClick">
      <div class="tac inb user-avatar">
        <el-avatar :size="60" :src="user.avatar"></el-avatar>
        <p class="mt5 mb5 bold">{{ user.game_name }}</p>
      </div>
      <el-menu-item index="INFO">
        <i class="el-icon-info"></i>
        <span slot="title">个人信息</span>
      </el-menu-item>
      <el-menu-item index="ORDER">
        <i class="el-icon-document"></i>
        <span slot="title">我的竞拍</span>
      </el-menu-item>
      <el-menu-item index="SETTINGS">
        <i class="el-icon-setting"></i>
        <span slot="title">设置中心</span>
      </el-menu-item>
    </el-menu>
  </section>
</template>

<script>
import { authComputed, authMethods } from '@state/helpers'

export default {
  name: 'user-bar',
  props: {
    user: {
      type: Object,
    },
  },
  methods: {
    updateProfileTab: authMethods.updateProfileTab,
    onUploadAvatar() {
      this.$message({
        message: '此功能还未完成',
        type: 'info',
      })
    },
    onUserTabClick(index) {
      this.updateProfileTab(index)
    },
  },
  computed: {
    ...authComputed,
  },
}
</script>

<style lang="scss">
.user-bar {
  height: 540px;
  background-color: #fff;
  .avatar {
    margin: 60px 0 0 50px;
    width: 80px;
    padding: 1px;
    background-color: rgb(255, 255, 255);
    border: 2px solid #ddd;
    border-radius: 5px;
    &:hover {
      cursor: pointer;
      box-shadow: 0 0 2px 1px rgba(0, 140, 186, 0.5);
    }
  }
  .info {
    font-size: 23px;
    font-weight: 700;
    margin: 80px 0 0 20px;
    color: #fff;
    display: inline-block;
    vertical-align: top;
    .profession {
      font-size: 18px;
    }
  }
  .menu-vertical {
    height: 540px;
    border-right: none;
    background-color: #fff;
    .el-menu-item {
      font-size: 17px;
      font-weight: 500;
    }
    .user-avatar {
      margin: 30px 0;
    }
  }
}

.el-popover--plain {
  min-width: 0px;
  padding: 8px 10px;
}
</style>
