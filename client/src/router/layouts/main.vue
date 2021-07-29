<template>
  <main class="layout">
    <template v-if="isAdmin || isLookedAdmin">
      <div class="left">
        <LeftNav></LeftNav>
      </div>
      <div class="right">
        <slot></slot>
        <Footer></Footer>
      </div>
    </template>
    <template v-else>
      <Navbar></Navbar>
      <slot></slot>
      <Footer></Footer>
    </template>
  </main>
</template>

<script>
import Navbar from '@components/navbar/Navbar.vue'
import Footer from '@components/snippet/Footer.vue'
import LeftNav from '@components/snippet/left-nav.vue'
import { authComputed } from '@state/helpers'

export default {
  components: {
    Navbar,
    Footer,
    LeftNav,
  },
  data() {
    return {}
  },
  computed: {
    ...authComputed,
  },
}
</script>

<style lang="scss" scoped>
  .layout {
    .left {
      width: 220px;
      float: left;
    }
    .right {
      width: calc(100% - 220px);
      float: right;
      .page-content {
        padding: 15px 40px;
      }
    }
  }
</style>
