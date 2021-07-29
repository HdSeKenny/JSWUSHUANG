<template>
  <section class="recent-goods-wrapper">
    <div class="recent-good-block" v-for="(item, idx) in goods" :key="idx" @click="onRecentGoodClick">
      <div class="image-wrapper">
        <el-image fit="cover" :src="item.image_url" :preview-src-list="[item.image_url]" />
      </div>
      <div class="info-wrapper ml15">
        <div class="title">
          {{item.good_name}}
        </div>
        <div class="date">
          {{formatDate(item.created_at)}}
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'recent-goods',
  computed: {
    ...mapState('goods', {
      goods: (state) => state.goods,
    }),
  },
  methods: {
    formatDate(date) {
      return this.$formatDate(date)
    },
    onRecentGoodClick() {
      this.$router.push({ name: 'auction' })
    }
  }
}
</script>

<style lang="scss" scoped>
.recent-goods-wrapper {
  height: 430px;
  overflow: auto;
  .recent-good-block {
    width: 100%;
    height: 45px;
    margin-bottom: 10px;
    clear: both;
    &:hover {
      cursor: pointer;
    }
    .image-wrapper {
      width: 30%;
      float: left;
      .el-image {
        height: 45px;
      }
    }
    .info-wrapper {
      width: calc(70% - 15px);
      float: right;
      .title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
