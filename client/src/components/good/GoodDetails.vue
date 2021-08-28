<template>
  <section class="details">
    <div class="status">
      <span :class="getStyle(item.status)">
        <font-awesome-icon icon="fire-alt" class="icon"></font-awesome-icon>
        <span class="ml10">{{ STATUS_TEXTS[item.status] }}</span>
      </span>
      <countdown
        v-if="item.status === 1 && _getTime(item.started_at) > 0"
        class="inb countdown ml15"
        :time="_getTime(item.started_at)"
        :interval="1000"
      >
        <template slot-scope="props">
          倒计时:
          <span class="countdown-time">{{ props.hours }}</span> h
          <span class="countdown-time">{{ props.minutes }}</span> m
          <span class="countdown-time">{{ props.seconds }}</span> s
        </template>
      </countdown>
    </div>
    <div class="image-wrapper">
      <el-image
        :src="item.image_url"
        :preview-src-list="[item.image_url]"
        :lazy="true"
        fit="contain"
        class="good-image"
      ></el-image>
    </div>
    <div class="fields-wrapper">
      <p class="title">{{ item.good_name }}</p>
      <p class="field"
        >{{ CHI_SIMS['min_price'] }}: <span class="value price">{{ item.min_price }}</span></p
      >
      <p class="field"
        >{{ CHI_SIMS['range_price'] }}: <span class="value price">{{ item.range_price }}</span></p
      >
      <p class="field"
        >{{ CHI_SIMS['au_type'] }}: <span class="value value-blue">{{ item.au_type }}</span></p
      >
      <p class="field"
        >{{ CHI_SIMS['created_at'] }}:
        <span class="value value-blue">{{ _formatDate(item.created_at) }}</span>
      </p>
    </div>
    <p class="admin-actions tal ml15" v-if="isAdmin">
      <!-- <el-button type="primary" @click="onStartAuction" v-if="item.status === 0" size="small">开始竞拍</el-button> -->
      <!-- <el-button type="warning" @click="onEndCurrentAuction" v-if="item.status === 1" size="small">停止竞拍</el-button> -->
      <!-- <el-button type="danger" @click="onCloseCurrentAuction" v-if="item.status !== 2" size="small">关闭竞拍</el-button> -->
    </p>
    <p class="mb5 ml15 auction-title" v-if="item.status === 1">
      <el-alert type="info" :closable="false">
        <template v-slot:title>
          <div class="current-price">
            <strong>当前出价: </strong>
            <span class="value price">{{ item.current_price }}</span>
            <strong class="ml15">竞拍者: </strong>
            <span class="value-blue">
              {{ item.current_payer ? item.current_payer.game_name : '无' }}
            </span>
          </div>
          <div class="my-dkp">
            <strong class="">我的{{ item.au_type }}: </strong>
            <span class="price"
              >{{ currencyNumber || 0 }} {{ item.au_type === 'DKP' ? '' : 'W' }}</span
            >
          </div>
        </template>
      </el-alert>
    </p>
    <div class="left">
      <div class="aucting-box" v-if="item.status === 1">
        <p class="history-block mt0 mb0" v-for="(ah, i) in item.auction_histories" :key="i">
          <span class="">{{ _formatDate(ah.au_date, 'MM/dd hh:mm') }}</span>
          <span class="ml5 mr5 name" :class="{ last: i === item.auction_histories.length - 1 }">
            {{ ah.au_player_name }}
          </span>
          <span class="au-price" :class="{ last: i === item.auction_histories.length - 1 }">
            {{ ah.au_price }} {{ item.au_type === 'DKP' ? '' : 'W' }}
          </span>
        </p>
      </div>
    </div>
    <div class="right">
      <div
        class="auction-action"
        v-if="
          item.status === 1 &&
            ((item.current_payer && item.current_payer._id !== currentUser._id) ||
              !item.current_payer)
        "
      >
        <div class="field">
          <el-input-number v-model="auctionPrice" :controls="false" :min="0" />
        </div>
        <p class="error">{{ errMsg }}</p>
        <el-button type="primary" @click="onHandleAuction" class="participate">参与竞拍</el-button>
      </div>
    </div>
    <div class="auction-info">
      <template v-if="item.current_payer && item.status === 2">
        <p class="bold">
          <span class="error mr5">{{ item.current_payer.game_name }}</span>
          以 <span class="error ml5 mr5">{{ item.current_price }}</span>
          {{ item.au_type }} 获得了此物品</p
        >
      </template>
      <template v-if="!item.current_payer && item.status === 2">
        <p class="bold error">流拍</p>
      </template>
    </div>
  </section>
</template>

<script>
import { CHI_SIMS, STATUS_TEXTS } from '@src/app.config'
import { authComputed, goodMethods, goodComputed, DKPComputed } from '@state/helpers'
import { formatDate, getAuctionStyle } from '@views/utils.js'

export default {
  props: {
    good: {
      type: Object,
      default: () => {},
    },
    onDeleteGood: {
      type: Function,
      default: () => {},
    },
  },

  data(props) {
    return {
      STATUS_TEXTS,
      CHI_SIMS,
      auTimestamp: 30 * 1000,
      item: props.good,
      errMsg: null,
      auctionPrice: 0,
    }
  },

  sockets: {
    auction_receive(val) {
      if (val.good_id !== this.item._id) {
        return
      }
      this.item = Object.assign({}, this.item, val.newStatusGood)
    },
    auction_start_back(val) {
      if (val._id !== this.item._id) {
        return
      }
      this.item = Object.assign({}, this.item, {
        status: 1,
        started_at: val.started_at,
      })
    },
    auction_end_back(val) {
      if (val._id !== this.item._id) {
        return
      }
      this.item = Object.assign({}, this.item, {
        status: 2,
        ended_at: val.ended_at,
      })
    },
  },

  watch: {
    good(newValue) {
      this.item = newValue
      this.errMsg = null
    },
  },

  computed: {
    ...authComputed,
    ...goodComputed,
    ...DKPComputed,
    currencyNumber() {
      const dkpNum = this.DKPData.find((dkd) => dkd.game_id === this.currentUser.game_id) || {
        sum: 0,
      }
      const goldNum = this.currentUser.gold
      return this.item.au_type === 'DKP' ? dkpNum.sum : goldNum
    },
  },

  methods: {
    ...goodMethods,

    _formatDate(date, str) {
      return formatDate(new Date(date), str)
    },

    getStyle(status) {
      return getAuctionStyle(status)
    },

    _getTime(started) {
      const now = new Date().getTime()
      const startedTimestamp = new Date(started).getTime()
      return startedTimestamp - now
    },

    onHandleAuction() {
      if (this.validatedError()) {
        return
      }

      const auctionObj = {
        good_id: this.item._id,
        started_at: this.item.started_at,
        // current
        current_price: this.auctionPrice,
        current_payer: {
          _id: this.currentUser._id,
          game_name: this.currentUser.game_name,
        },
        auction_histories: this.item.auction_histories || [],
        au_type: this.item.au_type,
      }

      if (!this.item.previous_payer) {
        auctionObj.previous_payer = auctionObj.current_payer
        auctionObj.previous_price = auctionObj.current_price
      } else {
        // previous
        auctionObj.previous_price = this.item.current_price
        auctionObj.previous_payer = {
          _id: this.item.current_payer._id,
          game_name: this.item.current_payer.game_name,
        }
      }

      const _leftTime = this._getTime(this.item.started_at)
      if (_leftTime > 0 && _leftTime < 30 * 1000) {
        const t = new Date()
        t.setSeconds(t.getSeconds() + 30)
        auctionObj.started_at = t
      }

      this.$socket.emit('auction_send', auctionObj)
    },

    validatedError() {
      const currentPrice = this.item.current_price
      let msg = ''
      if (this.auctionPrice <= currentPrice) {
        msg = '不能低于当前最低竞拍价格'
      } else if (this.auctionPrice % this.item.range_price !== 0) {
        msg = `竞拍价格的幅度为: ${this.item.range_price}, 你输入的价格不符合规则`
      } else if (this.item.au_type === 'DKP') {
        if (this.auctionPrice > this.currentUser.dkp_score.sum) {
          msg = '你没有这么多的DKP哦'
        }
      } else if (this.item.au_type === '铜钱') {
        if (this.auctionPrice > this.currentUser.gold) {
          msg = '你没有这么多的铜钱哦'
        }
      }

      this.errMsg = msg
      return msg
    },

    onStartAuction() {
      const t = new Date()
      const { _id, range_minutes, range_hours } = this.item
      const rangeTimestamp = 60 * range_minutes + 60 * 60 * range_hours
      t.setSeconds(t.getSeconds() + rangeTimestamp)
      this.$socket.emit('auction_start', { _id, started_at: t })
    },

    onEndCurrentAuction() {
      this.$confirm('确定提前结束竞拍吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
      })
        .then(() => {
          this.$socket.emit('auction_end', {
            _id: this.item._id,
            ended_at: new Date(),
          })
        })
        .catch(() => {})
    },

    onCloseCurrentAuction() {
      this.onDeleteGood(this.item._id)
    },
  },

  updated() {
    const auctingBoxEl = document.querySelector('.details .left .aucting-box')
    if (auctingBoxEl) {
      auctingBoxEl.scrollTop = auctingBoxEl.scrollHeight
    }
  },

  mounted() {
    const auctingBoxEl = document.querySelector('.details .left .aucting-box')
    if (auctingBoxEl) {
      auctingBoxEl.scrollTop = auctingBoxEl.scrollHeight
    }
  },
}
</script>

<style lang="scss">
$border: 2px solid #dcdfe6;

.details {
  .status {
    font-size: 18px;
    margin-bottom: 20px;
    text-align: center;
    .countdown {
      min-width: 130px;
    }
  }
  .auction-title {
    font-size: 18px;
    .el-alert {
      padding: 8px 5px;
      .el-alert__content {
        width: 100%;
      }
    }
    .current-price {
      width: 45%;
      display: inline-block;
    }
    .my-dkp {
      margin-left: 35px;
      width: calc(55% - 45px);
      display: inline-block;
    }
  }
  .left {
    width: 45%;
    margin-left: 15px;
    margin-top: 10px;
    display: inline-block;
    .aucting-box {
      width: 100%;
      height: 185px;
      padding: 5px 8px 30px 8px;
      overflow-y: auto;
      border: $border;
      border-radius: 5px;
      .history-block {
        font-size: 13px;
        .name.last {
          color: $theme-color;
          font-weight: 500;
        }
        .au-price.last {
          color: $danger-color;
          font-weight: 600;
        }
      }
    }
  }
  .right {
    width: calc(55% - 45px);
    margin-left: 30px;
    margin-top: 10px;
    display: inline-block;
    vertical-align: top;
    .current-auction-price {
      margin: 0;
      padding: 0;
      display: block;
    }
    .current-auction-player {
      margin: 0;
      padding: 5px 0;
      display: block;
    }
    .participate {
      width: 180px;
    }
  }
  .auction-info {
    font-size: 22px;
    margin-left: 15px;
    margin-top: 15px;
  }
  .image-wrapper {
    width: 45%;
    height: 165px;
    margin-left: 15px;
    display: inline-block;
    .good-image {
      width: 100%;
      height: 165px;
      border: $border;
      .el_image__inner {
        vertical-align: middle;
        display: table-cell;
      }
    }
  }
  .fields-wrapper {
    font-size: 16px;
    width: calc(55% - 45px);
    margin-left: 30px;
    display: inline-block;
    vertical-align: top;
    .title {
      color: black;
      font-size: 20px;
      font-weight: 700;
    }
    .field {
      margin: 0 0 3px 0;
    }
    .info-hr {
      background-color: #ddd;
      border: none;
      height: 1px;
      margin: 10px 0;
    }
  }
  .auction-receive-box {
    width: calc(30% - 70px);
    height: 280px;
    border: $border;
    display: inline-block;
  }
}
</style>
