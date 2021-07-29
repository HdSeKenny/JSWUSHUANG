<template>
  <Layout>
    <section class="page-content order-manage">
      <div class="status-wrapper" v-if="orders.length">
        <user-order-block :data="orders" :showAction="true" />
      </div>
      <div class="no-data tac" v-if="!orders.length">
        <h4><font-awesome-icon icon="exclamation-circle" class="icon mr10" />目前没有订单</h4>
      </div>
    </section>
  </Layout>
</template>

<script>
import OrderBlock from '@components/user/user-order-block.vue'
import Layout from '@layouts/main.vue'
import { orderMethods, orderComputed } from '@state/helpers'

export default {
  components: {
    'user-order-block': OrderBlock,
    Layout,
  },

  data() {
    return {

    }
  },

  methods: {
    ...orderMethods,
    fetchData() {
      this.$store.dispatch('orders/fetchOrders')
    }
  },

  computed: {
    ...orderComputed,
  },

  created () {
    // fetch the data when the view is created and the data is
    // already being observed
    this.fetchData()
  },

  watch: {
    // call again the method if the route changes
    '$route': 'fetchData',
  },
}
</script>

<style lang="scss" scoped>
.order-manage {
  background-color: #fff;
  .no-data {
    margin: 200px 0;
  }
}
</style>
