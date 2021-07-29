<template>
  <Layout>
    <div class="page-content profile">
      <template v-if="!isAdmin">
        <div class="user-left">
          <user-bar :user="user"></user-bar>
        </div>
        <div class="user-right">
          <user-tabs :user="user"></user-tabs>
        </div>
      </template>
      <template v-else>
        <user-tabs :user="user"></user-tabs>
      </template>
    </div>
  </Layout>
</template>

<script>
import Layout from '@layouts/main.vue'
import UserBar from '@components/user/user-bar.vue'
import UserTabs from '@components/user/user-tabs.vue'
import { authComputed } from '@state/helpers'

export default {
  name: 'profile',
  components: {
    Layout,
    'user-bar': UserBar,
    'user-tabs': UserTabs,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...authComputed
  }
}
</script>

<style lang="scss" scoped>
.profile {
  margin: 25px 0;
  .user-left {
    width: 240px;
    display: inline-block;
  }

  .user-right {
    width: calc(100% - 270px);
    margin-left: 30px;
    display: inline-block;
    vertical-align: top;
  }
}
</style>
