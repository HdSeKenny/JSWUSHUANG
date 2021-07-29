<template>
  <section>
    <div v-if="orders.length">
      <div v-for="(o, i) in orders" :key="i" class="mb5">
        <span class="date mr15">{{formatDate(o.created_at)}}</span>
        <span class="mr5">以</span>
        <span class="price mr5">{{o.price}} 分</span>
        <span class="mr10">竞拍了</span>
        <span class="mr10 bold">{{o.good_id ? o.good_id.good_name : ''}}</span>
        <span>
          <el-button type="text">已完成</el-button>
        </span>
      </div>
    </div>
    <div class="mt5" v-else>
      <i class="el-icon-warning-outline mr5 ml5"></i> 没有记录</div>
  </section>
</template>

<script>
export default {
  props: {
    orders: {
      type: Array,
    },
  },
  methods: {
    formatDate(date) {
      return this.$formatDate(date, 'yyyy MM/dd hh:mm')
    },
  }
}
</script>

<style lang="scss" scoped>
</style>

