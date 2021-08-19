<template>
  <section class="user-order-block">
    <div class="item" v-for="order in orders" :key="order._id">
      <p class="header">
        <span class="create mr15">订单编号: {{ order._id }}</span>
        <span class="create ml15 date">订单生成于: {{ formate(order.created_at) }}</span>
      </p>
      <div class="image-wrapper">
        <el-image
          fit="contain"
          class="good-image"
          :src="order.good_id.image_url"
          :preview-src-list="[order.good_id.image_url]"
          :lazy="false"
        />
      </div>
      <div class="info">
        <h5 class="ml15 bold">{{ order.good_id.good_name }}</h5>
        <p class="auction-price">
          竞拍者: <span class="value-blue mr15">{{ order.payer_id.game_name }}</span> 竞拍价格:
          <span class="theme-color">{{ order.price }}</span>
        </p>
      </div>
      <div class="status fr">
        <el-button type="text bold">已完成</el-button>
      </div>
    </div>
  </section>
</template>

<script>
import { orderMethods, DKPComputed } from '@state/helpers'

export default {
  name: 'user-order-block',
  props: {
    data: {
      type: Array,
    },
    showAction: {
      type: Boolean,
    },
  },
  data() {
    return {}
  },

  computed: {
    ...DKPComputed,
    orders() {
      return this.data.map((d) => {
        const newPro = {}
        if (!d.good_id) {
          newPro.good_id = {}
        }

        if (!d.payer_id) {
          newPro.payer_id = {}
        }
        return Object.assign({}, d, newPro)
      })
    },
  },

  methods: {
    ...orderMethods,
    formate(date) {
      return this.$formatDate(date, 'yyyy MM/dd hh:mm')
    },
    onDeleteOrder(id) {
      this.deleteOrder(id).then(() => {
        this.$notify({
          title: '提示',
          message: '操作成功',
          type: 'success',
          duration: 3000,
        })
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.item {
  position: relative;
  margin: 10px 0;
  padding: 10px 20px 15px 20px;
  overflow: hidden;
  border: 2px solid #eff2f6;
  .image-wrapper {
    display: inline-block;
    vertical-align: top;
    width: 52px;
    height: 52px;
    .good-image {
      width: 50px;
      height: 50px;
    }
  }

  .info {
    width: calc(100% - 230px);
    display: inline-block;
    vertical-align: top;
    .auction-price {
      color: #909399;
      font-size: 13px;
      margin: 5px 0 0 15px;
      .theme-color {
        font-size: 20px;
        font-weight: 600;
      }
    }
  }

  .status {
    display: inline-block;
  }

  .create {
    color: $theme-gray-color;
    font-size: 13px;
    font-weight: 400;
    &.date {
      float: right;
    }
  }
}
</style>
