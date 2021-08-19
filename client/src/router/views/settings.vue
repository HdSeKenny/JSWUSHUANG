<template>
  <Layout v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.6)">
    <section class="page-content settings">
      <el-tabs
        @tab-click="onSettingsTabClick"
        :value="settingsTab"
        type="border-card"
        :class="currentUser.role"
      >
        <el-tab-pane name="RECOVER" label="数据恢复">
          <DataRecover />
        </el-tab-pane>
        <el-tab-pane name="USERS" label="用户管理" :lazy="true">
          <Accounts />
        </el-tab-pane>
        <el-tab-pane name="OTHER" label="其他设置">
          <div class="">
            <el-button type="text bold" class="pt0">
              编辑公告
            </el-button>
            <el-input
              class="announcement"
              type="textarea"
              :rows="2"
              :placeholder="announcement"
              v-model="newAnnouncement"
            >
            </el-input>
            <el-button
              class="mt10 mb10"
              type="warning"
              size="small"
              :disabled="newAnnouncement === ''"
              @click="onUpdateAnnouncement"
            >
              更新
            </el-button>
          </div>
          <!-- <div>
            <el-button type="text bold" class="pt0">
              重置铜钱
            </el-button>
            <el-button class="mt10 mb10 ml0 disb" type="warning" size="small" @click="onAddGold">
              每个人的铜钱会被重置为 100000 W
            </el-button>
          </div> -->
        </el-tab-pane>
      </el-tabs>
    </section>
  </Layout>
</template>

<script>
import Layout from '@layouts/main.vue'
import DataRecover from '@components/dkp/DataRecover.vue'
import Accounts from '@components/manage/Accounts.vue'
import { MESSAGE_TYPES } from '@state/constants'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'settings',
  components: {
    Layout,
    DataRecover,
    Accounts,
  },
  data() {
    return {
      loading: true,
      newAnnouncement: '',
      gold: 0,
    }
  },
  watch: {
    $route: 'fetchData',
  },
  methods: {
    ...mapActions('admin', ['updateSettingsTab']),
    ...mapActions('auth', ['updateAnnouncement']),

    fetchData() {
      this.$store
        .dispatch('auth/getBackupList')
        .then(() => {
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    onSettingsTabClick(tab) {
      this.updateSettingsTab(tab.name)
    },

    onUpdateAnnouncement() {
      this.updateAnnouncement({ announcement: this.newAnnouncement })
        .then(() => {
          this.loading = false
          this.$message(MESSAGE_TYPES.SUCCESS)
        })
        .catch(() => {
          this.loading = false
          this.$message(MESSAGE_TYPES.ERROR)
        })
    },

    onAddGold() {
      this.loading = true
      this.addGold({ gold: this.gold })
        .then(() => {
          this.loading = false
          this.$message(MESSAGE_TYPES.SUCCESS)
        })
        .catch(() => {
          this.loading = false
          this.$message(MESSAGE_TYPES.ERROR)
        })
    },
  },
  computed: {
    ...mapState('auth', {
      currentUser: (state) => state.currentUser,
      announcement: (state) => state.announcement,
      isAdmin: (state) => state.isAdmin,
      isLookedAdmin: (state) => state.isLookedAdmin,
    }),
    ...mapState('admin', {
      settingsTab: (state) => state.settingsTab,
    }),
  },

  created() {
    this.fetchData()
  },
}
</script>
