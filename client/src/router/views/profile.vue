<template>
  <Layout>
    <div class="page-content profile">
      <user-tabs :user="user"></user-tabs>
    </div>
  </Layout>
</template>

<script>
import Layout from '@layouts/main.vue'
import UserTabs from '@components/user/user-tabs.vue'
// import UserBar from '@components/user/user-bar.vue'
// import { authComputed } from '@state/helpers'

export default {
  name: 'profile',
  components: {
    Layout,
    // 'user-bar': UserBar,
    'user-tabs': UserTabs,
  },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
}
</script>
