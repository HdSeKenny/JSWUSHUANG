<template>
  <section class="footer">
    <p class="text">Copyright © 2020
      <span class="theme-color bold pointer">Kenny</span> All rights reserved.
    </p>
  </section>
</template>

<script>
export default {
  name: 'Footer',
  // data() {},
  methods: {},
}
</script>

<style lang="scss" scoped>
  .footer {
    font-size: 15px;
    font-weight: 500;
    padding: 30px 60px 20px 60px;
    clear: both;
    text-align: center;
    .text {
      font-size: 14px;
      padding: 10px 0;
    }
  }
</style>
