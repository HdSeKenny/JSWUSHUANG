<template>
  <section class="good-auction-handle">
    <div
      class="count-down-wrapper"
      v-for="item in source"      
      :key="item._id">
      <countdown
        v-if="item.countdown > 0 && item.status === 1"
        :time="item.countdown"
        class="countdown"
        :interval="1000"
        @end="handleCountdownEnd(item)">
        <template slot-scope="props">
          <span class="countdown-time">{{props.days}}</span> 天
          <span class="countdown-time">{{props.hours}}</span> 时
          <span class="countdown-time">{{props.minutes}}</span> 分
          <span class="countdown-time">{{props.seconds}}</span> 秒
        </template>
      </countdown>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'GoodAuctionHandle',
  methods: {
    fetchData() {
      this.$store.dispatch('goods/fetchGoods')
    },
    calculateTimestamp(started) {
      const now = new Date().getTime()
      const startedTimestamp = new Date(started).getTime()
      return startedTimestamp - now
    },
    handleCountdownEnd(item) {
      this.$socket.emit('auction_end', {
        _id: item._id,
        ended_at: new Date(),
      })
    },
  },
  computed: {
    ...mapState('goods', {
      goods: (state) => state.goods,
    }),
    ...mapState('auth', {
      currentUser: (state) => state.currentUser,
    }),
    source() {
      return this.goods.map((good) => {
        const now = new Date().getTime()
        const started = new Date(good.started_at).getTime()
        const countdown = started - now
        return Object.assign({}, good, { countdown })
      })
    },
  },
  created() {
    this.fetchData()
  },
}
</script>

<style lang="scss" scoped>
.count-down-wrapper {
  position: relative;
  z-index: -1;
  display: none;
}
</style>
