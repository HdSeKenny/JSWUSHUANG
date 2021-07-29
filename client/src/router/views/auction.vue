<template>
  <Layout v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.6)">
    <section class="page-content auction">
      <el-tabs
        @tab-click="onGoodTabClick"
        :value="goodTab"
        :type="isAdmin || isLookedAdmin ? 'border-card' : ''"
        :class="currentUser.role">
          <el-tab-pane name="ALL" label="所有商品">
            <div class="search-wrapper">
              <el-input class="search" placeholder="请输入内容" prefix-icon="el-icon-search" v-model="search" autocomplete />
              <div class="money">
                <p class="inb m0">
                  <span>我的DKP: <span class="price">
                    {{currentUser.dkp_score ? currentUser.dkp_score.sum : 0}}
                  </span></span>
                  <span class="ml15">我的铜钱: <span class="price">{{currentUser.gold || 0}}W</span></span>
                </p>
              </div>
            </div>
            <div class="all-goods-wrapper mt15">
              <div class="good-wrapper" v-for="(g, i) in source" :key="i" @click="lookUpGoodInfo(g)">
                <el-card :body-style="cardBorderStyle">
                  <div class="image-wrapper">
                    <el-image fit="contain" class="good-image" :src="g.image_url" :lazy="false" />
                  </div>
                  <div class="info-wrapper">
                    <p class="field" v-if="g.countdown > 0 && g.status === 1">
                      <countdown :time="g.countdown" class="countdown" :interval="1000">
                        <template slot-scope="props">
                          <span class="countdown-time">{{props.days}}</span> 天
                          <span class="countdown-time">{{props.hours}}</span> 时
                          <span class="countdown-time">{{props.minutes}}</span> 分
                          <span class="countdown-time">{{props.seconds}}</span> 秒
                        </template>
                      </countdown>
                    </p>
                    <p class="title mb5 mt0">{{g.good_name}}</p>
                    <div class="fields-wrapper">
                      <p class="field">
                        {{CHI_SIMS['min_price']}}:
                        <span class="value price">{{g.min_price}}</span></p>
                      <p class="field">
                        {{CHI_SIMS['range_price']}}:
                        <span class="value price">{{g.range_price}}</span></p>
                      <p class="field">
                        {{CHI_SIMS['au_type']}}:
                        <span class="value value-blue">{{g.au_type}}</span></p>

                      <p class="field mt5">
                        <span v-if="g.status !== 2">当前价格: </span>
                        <span v-if="g.status === 2">最终价格: </span>
                        <span class="value price">{{g.current_price}} {{g.au_type === 'DKP' ? '' : 'W'}}</span></p>
                      <p class="field">
                        <span v-if="g.status !== 2">当前竞拍者: </span>
                        <span v-if="g.status === 2">最终竞拍者: </span>
                        <span class="value value-blue">
                          {{g.current_payer ? g.current_payer.game_name : '无'}}
                        </span>
                      </p>
                    </div>
                    <div class="bottom mt15 mb10" :class="getStyle(g.status)">
                      <font-awesome-icon icon="fire-alt" class="icon"></font-awesome-icon>
                      <span class="ml10">{{STATUS_TEXTS[g.status]}}</span>
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
            <div class="no-data tac" v-if="!source.length">
              <h4>
                <font-awesome-icon icon="exclamation-circle" class="icon mr10"></font-awesome-icon>
                目前没有竞拍的商品, 等待管理上架
              </h4>
            </div>
            <el-dialog
              :width="auctionModalWidth"
              :title="auctionModalTitle"
              :visible="showModal"
              @close="onGoodAucationCancel">
              <GoodDetails :good="viewedGood" :onDeleteGood="onDeleteGood"></GoodDetails>
              <div slot="footer" class="dialog-footer mt15"></div>
            </el-dialog>
            <image-preloader
              :srcs="imageUrls.length === 0 ? [currentUser.avatar] : imageUrls"
              @loaded-all="allImagesLoaded" />
          </el-tab-pane>
          <el-tab-pane name="ADD" label="上架商品" v-if="isAdmin">
            <AuctionAdd />
          </el-tab-pane>
      </el-tabs>
    </section>
  </Layout>
</template>

<script>
import Layout from '@layouts/main.vue'
import GoodDetails from '@components/good/GoodDetails.vue'
import AuctionAdd from '@components/good/GoodAdd.vue'
import { mapState } from 'vuex'
import { CHI_SIMS, STATUS_TEXTS } from '@src/app.config'
import { MESSAGE_TYPES } from '@state/constants'
import { goodComputed, goodMethods, DKPComputed } from '@state/helpers'
import { getAuctionStyle } from './utils.js'

export default {
  components: { Layout, GoodDetails, AuctionAdd },
  data() {
    return {
      STATUS_TEXTS,
      CHI_SIMS,
      loading: true,
      showModal: false,
      viewedGood: {},
      search: '',
      auctionModalWidth: '600px',
      auctionModalTitle: '竞拍商品',
      cardBorderStyle: {
        padding: '0px',
      },
    }
  },

  methods: {
    ...goodMethods,

    getStyle(status) {
      return getAuctionStyle(status)
    },

    lookUpGoodInfo(good) {
      this.viewedGood = good
      this.showModal = true
    },

    onGoodAucationCancel() {
      this.showModal = false
    },

    onDeleteGood(gId) {
      this.$confirm('确定要关闭竞拍吗? 关闭竞拍这个商品会被删除', '提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        this.deleteGood(gId)
          .then(() => {
            this.showModal = false
            this.$message(MESSAGE_TYPES.SUCCESS)
          })
          .catch(() => this.$message(MESSAGE_TYPES.ERROR))
      }).catch(() => {})
    },

    allImagesLoaded() {
      this.loading = false
    },

    onGoodTabClick(tab) {
      this.updateGoodTab(tab.name)
    }
  },

  computed: {
    ...goodComputed,
    ...DKPComputed,

    ...mapState('auth', {
      currentUser: (state) => state.currentUser,
      isAdmin: (state) => state.isAdmin(),
      isLookedAdmin: (state) => state.isLookedAdmin()
    }),
    source() {
      const filtereds = this.goods.filter(
        (g) => g.good_name.includes(this.search)
      )
      return filtereds.map(good => {
        const now = new Date().getTime()
        const started = new Date(good.started_at).getTime()
        return Object.assign({}, good, { countdown: started - now })
      }).sort((a, b) => {
        const aOrder = a.status === 1 ? 2 : (a.status === 0 ? 1 : 0)
        const bOrder = b.status === 1 ? 2 : (b.status === 0 ? 1 : 0)
        return bOrder - aOrder
      })
    }
  }
}
</script>

<style lang="scss">
.auction {
  .header {
    margin: 25px 0;
  }
  .search-wrapper {
    .money {
      font-size: 18px;
      line-height: 60px;
      float: right;
    }
  }
  .search {
    margin: 10px 0;
    width: 400px;
  }
  .no-data {
    margin: 130px 0px;
  }
  .el-dialog {
    margin-top: 80px !important;
  }
}
.all-goods-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 250px));
  grid-gap: 20px;
}
.good-wrapper {
  display: inline-block;
  .aucting-box {
    max-height: 100px;
    overflow: auto;
  }
  &:hover {
    cursor: pointer;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
  .el-card {
    box-shadow: none;
  }
  .image-wrapper {
    height: 180px;
    .good-image {
      width: 100%;
      height: 100%;
      display: table;
      background: #333;
      .el_image__inner {
        vertical-align: middle;
        display: table-cell;
      }
    }
  }
  .info-wrapper {
    height: 200px;
    background-color: #fff;
    padding: 10px 20px;
    position: relative;
    .title {
      font-size: 16px;
      font-weight: 600;
    }
    .field {
      font-size: 13px;
      font-weight: 500;
      line-height: 18px;
      color: #606266;
      margin: 0;
    }
    .status-text {
      font-size: 14px;
    }
    .countdown {
      top: -100px;
      margin-left: -20px;
      width: 100%;
      font-size: 14px;
      line-height: 30px;
      background-color: rgb(255, 255, 255, 0.8);
      text-align: center;
      position: absolute;
      z-index: 1;
      .countdown-time {
        color: $red-color;
        font-size: 18px;
        font-weight: 600;
        font-style: italic;
      }
    }
  }
}

.aucting {
  color: $red-color;
  font-weight: 600;
}

.auction-end {
  color: $theme-gray-color;
  font-weight: 600;
}

.auction-will {
  color: #E6A23C;
  font-weight: 600;
}

.el-dialog__wrapper {
  .el-dialog {
    .el-dialog__header {
      .el-dialog__title {
        font-size: 22px;
        font-weight: 600;
      }
    }
    .el-dialog__body {
      padding: 0 20px;
    }
  }
}
</style>
