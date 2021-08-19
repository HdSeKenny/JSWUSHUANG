<template>
  <main class="main">
    <Navbar></Navbar>
    <slot></slot>
    <Footer></Footer>
  </main>
</template>

<script>
import Navbar from '@components/navbar/Navbar.vue'
import Footer from '@components/snippet/Footer.vue'

export default {
  components: {
    Navbar,
    Footer,
  },
}
</script>
