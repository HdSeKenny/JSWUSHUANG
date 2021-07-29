<template>
  <Layout v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.6)">
    <section class="page-content home">
      <el-tabs
        @tab-click="onHomeTabClick"
        :value="homeTab"
        :type="isAdmin || isLookedAdmin ? 'border-card' : ''"
        :class="currentUser.role">
        <el-tab-pane name="ALL" label="所有数据">
          <DKPList :DKPData="DKPData" v-if="isAdmin || isLookedAdmin" />
          <div v-else>
            <div class="list">
              <div class="user-info">
                <div class="field mt15">
                  <p class="mt0 mb0 mr15 inb">
                    <span class="bold">游戏名: </span>
                    <span class="value-blue">{{currentUser.game_name}}</span>
                  </p>
                  <p class="mt0 mb0 mr15 inb">
                    <span class="bold">游戏ID: </span>
                    <span class="value-blue">{{currentUser.game_id}}</span>
                  </p>
                  <p class="mt0 mb0 mr15 inb">
                    <span class="bold">职业: </span>
                    <span class="value-blue">{{currentUser.profession}}</span>
                  </p>
                  <p class="mt0 mb0 mr15 inb">
                    <span class="bold">帮会: </span>
                    <span class="value-blue">
                      {{currentUser.dkp_score ? currentUser.dkp_score.gang : ''}}
                    </span>
                  </p>
                </div>
              </div>
              <div class="dkp-info">
                <DKPList :DKPData="DKPData"></DKPList>
              </div>
              <div class="dkp-history">
                <el-button type="text" class="value-blue">DKP历史记录</el-button>
                <DKPHistory :histories="currentUserHistories" />
              </div>
              <div class="auction-history">
                <el-button type="text" class="value-blue">竞拍记录</el-button>
                <AuctionHistory :orders="currentUser.orders" />
              </div>
            </div>
            <div class="rigth-nav">
              <div class="notice-info">
                <p class="bold mb5"><i class="el-icon-warning-outline mr5"></i>公告</p>
                <p class="mt0 mb5">{{announcement}}</p>
              </div>
              <div class="recent-goods">
                <el-button type="text" class="ftz18">最新上架</el-button>
                <RecentGoods />
              </div>
            </div>
          </div>
        </el-tab-pane>
        <template v-if="isAdmin">
          <el-tab-pane name="DKPEDIT" label="导入数据" >
            <DKPEdit :DKPData="DKPData"></DKPEdit>
          </el-tab-pane>
          <el-tab-pane name="DATAMANAGE" label="数据管理">
            <el-button type="primary" @click="onBackUpData">数据备份</el-button>
          </el-tab-pane>
        </template>
      </el-tabs>
    </section>
  </Layout>
</template>

<script>
import Layout from '@layouts/main.vue'
import DKPList from '@components/dkp/DKPList.vue'
import DKPHistory from '@components/dkp/DKPHistory.vue'
import AuctionHistory from '@components/good/AuctionHistory.vue'
import RecentGoods from '@components/good/RecentGoods.vue'
import DKPEdit from '@components/dkp/DKPEdit.vue'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Home',
  components: {
    Layout,
    DKPList,
    DKPEdit,
    DKPHistory,
    AuctionHistory,
    RecentGoods,
  },
  data() {
    return {
      loading: true,
    }
  },
  created() {
    this.fetchData()
  },

  watch: {
    $route: 'fetchData',
  },

  computed: {
    ...mapState('dkps', {
      DKPData: (state) => state.DKPData,
    }),
    ...mapState('auth', {
      currentUser: (state) => state.currentUser,
      homeTab: (state) => state.homeTab,
      announcement: (state) => state.announcement,
      isAdmin: (state) => state.isAdmin(),
      isLookedAdmin: (state) => state.isLookedAdmin(),
    }),
    currentUserHistories() {
      const currentUserDkp = this.DKPData.find(dd => dd.game_name === this.currentUser.game_name)
      return currentUserDkp ? (currentUserDkp.histories || []) : []
    }
  },

  methods: {
    ...mapActions('auth', ['updateHomeTab', 'backup']),

    fetchData() {
      Promise.all([
        this.$store.dispatch('auth/getAnnouncement'),
        this.$store.dispatch('dkps/fetchDKPData'),
      ])
        .then(() => {
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    onHomeTabClick(tab) {
      this.updateHomeTab(tab.name)
    },
    onBackUpData() {
      this.loading = true
      this.backup()
        .then((data) => {
          this.loading = false
          this.$message({
            type: 'success',
            message: '备份成功',
          })
        })
        .catch((err) => {
          this.loading = false
          this.$message({
            type: 'error',
            message: err.message,
          })
        })
    },
  },
}
</script>

<style lang="scss">
.home {
  .list {
    width: calc(100% - 300px);
    background-color: #fff;
    float: left;
    .dkp-history,
    .auction-history {
      font-size: 14px;
      padding: 0px 25px;
      margin-top: 20px;
      height: 220px;
      overflow: auto;
    }
    .user-info {
      font-size: 16px;
      padding: 15px;
    }
    .dkp-history {
      height: 225px;
    }
  }
  .rigth-nav {
    width: 280px;
    float: right;
    .notice-info,
    .recent-goods {
      background-color: #fff;
      padding: 15px 25px;
      margin-bottom: 20px;
    }
    .recent-goods {
      height: 517px;
    }
    .notice-info {
      font-size: 14px;
    }
  }
}
</style>
