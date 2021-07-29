<script>
import Layout from '@layouts/main.vue'
import { authMethods, authComputed } from '@state/helpers'
import { CHI_SIMS } from '@src/app.config'
import { formatDate } from '@views/utils'

export default {
  name: 'notice',
  components: { Layout },
  props: {
    resource: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      activeTab: 'application',
      CHI_SIMS,
      message: []
    }
  },

  watch: {
    '$route': 'fetchData',
  },

  created () {
    // fetch the data when the view is created and the data is
    // already being observed
    this.fetchData()
  },

  methods: {
    ...authMethods,

    fetchData() {
      this.$store.dispatch('auth/getMembers')
    },

    onTabClick() {},

    _formate(date) {
      return date ? formatDate(new Date(date), 'MM/dd hh:mm') : null
    },

    onThroughUserApplication(member) {
      this.throughApplication({
        mid: member._id,
        game_id: member.game_id,
        game_name: member.game_name,
        profession: member.profession
      }).then((data) => {
        this.$notify({ type: 'success', message: '操作成功', duration: 3000, })
      })
    },

    onDeleteApplication(id) {
      this.deleteApplication(id).then((data) => {
        this.$notify({ type: 'success', message: '删除成功', duration: 3000, })
      })
    }
  },

  computed: {
    ...authComputed,
  }
}
</script>

<template>
  <Layout>
    <div class="page-content notice">
      <el-tabs v-model="activeTab" @tab-click="onTabClick">
        <!-- <el-tab-pane label="消息中心" name="message">
          <div v-if="!message.length" class="no-data">
            <h4><font-awesome-icon icon="exclamation-circle" class="icon mr10" />目前没有任何消息</h4>
          </div>
        </el-tab-pane> -->
        <!-- <el-tab-pane label="用户申请" name="application" v-if="isAdmin"> -->
          <el-divider content-position="left" v-if="members.length">新用户申请</el-divider>
          <div class="item" v-for="member in members" :key="member._id">
            <el-avatar size="medium" :src="member.avatar"></el-avatar>
            <p class="field inb">{{CHI_SIMS.game_id}}:
              <span class="value-blue">{{member.game_id}}</span>
            </p>
            <p class="field inb">{{CHI_SIMS.game_name}}:
              <span class="value-blue">{{member.game_name}}</span>
            </p>
            <p class="field inb">{{CHI_SIMS.application_created_at}}:
              <span class="value-blue">{{_formate(member.created_at)}}</span>
            </p>

            <el-button type="danger" size="small" class="fr ml10 mt5" @click="onDeleteApplication(member._id)">拒绝</el-button>
            <el-button type="success" size="small" class="fr mt5" @click="onThroughUserApplication(member)">通过</el-button>
          </div>
          <div v-if="!members.length" class="no-data">
            <h4><font-awesome-icon icon="exclamation-circle" class="icon mr10" />目前没有任何消息</h4>
          </div>
        <!-- </el-tab-pane> -->
      </el-tabs>
    </div>
  </Layout>
</template>

<style lang="scss" scoped>
  .notice {
    background: #fff;
    .item {
      padding: 10px 20px;
      margin-bottom: 10px;
      border: 1px solid $border-color;
      .field {
        font-size: 14px;
        margin: 0 0 0 20px;
        line-height: 36px;
        vertical-align: top;
        .value-blue {
          font-size: 15px;
        }
      }
    }
  }
</style>
