<template>
  <section class="user-order">
    <div class="status-wrapper" v-if="user.orders.length">
      <user-order-block :data="user.orders" :showAction="false" />
    </div>
    <div class="no-data tac" v-if="!user.orders.length">
      <h4><font-awesome-icon icon="exclamation-circle" class="icon mr10" />目前没有订单</h4>
    </div>
  </section>
</template>

<script>
import OrderBlock from './user-order-block.vue'

export default {
  name: 'user-order',
  components: { 'user-order-block': OrderBlock },
  props: {
    user: {
      type: Object
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang="scss" scoped>
$order-border-color: #eff2f6;
.user-order {
  background-color: #fff;
  min-height: 500px;
  max-height: 700px;
  overflow-y: auto;
  padding: 20px;
  .no-data {
    margin: 150px 0;
  }
}
</style>
