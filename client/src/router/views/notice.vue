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
      message: [],
      headers: [
        { field: 'game_id', title: '游戏ID' },
        { field: 'game_name', title: '游戏名称' },
        { field: 'created_at', title: '申请时间' },
      ],
    }
  },

  watch: {
    $route: 'fetchData',
  },

  created() {
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
      const _member = this.members.find((m) => m.game_id === member.game_id)
      this.throughApplication({
        mid: _member._id,
        game_id: _member.game_id,
        game_name: _member.game_name,
        profession: _member.profession,
      }).then((data) => {
        this.$notify({ type: 'success', message: '操作成功', duration: 3000 })
      })
    },

    onDeleteApplication(member) {
      const _member = this.members.find((m) => m.game_id === member.game_id)
      this.deleteApplication(_member._id).then((data) => {
        this.$notify({ type: 'success', message: '删除成功', duration: 3000 })
      })
    },

    columnFormatter({ row, column, cellValue, index }) {
      const isCreated = column.property === 'created_at'
      return isCreated ? this._formate(cellValue) : cellValue
    },
  },

  computed: {
    ...authComputed,
    tableData() {
      return this.members.map((u) => {
        const data = {}
        this.headers.forEach((h) => {
          data[h.field] = u[h.field]
        })
        return data
      })
    },
  },
}
</script>

<template>
  <Layout>
    <div class="page-content notice">
      <el-tabs v-model="activeTab" @tab-click="onTabClick" type="border-card">
        <el-tab-pane label="用户申请" name="application">
          <el-divider content-position="left" v-if="members.length">新用户申请</el-divider>
          <vxe-table
            :data="tableData"
            :stripe="true"
            :lazy="true"
            border
            class="table"
            max-height="600"
            size="small"
            empty-text="no data"
            :resizable="true"
            v-if="members.length"
          >
            <vxe-table-column
              v-for="h in headers"
              :key="h.field"
              :field="h.field"
              :title="h.title"
              :formatter="columnFormatter"
            >
            </vxe-table-column>

            <vxe-table-column fixed="right" field="操作" title="操作" :width="150" align="center">
              <template slot-scope="scope">
                <el-button type="danger" size="small" @click="onDeleteApplication(scope.row)">
                  拒绝
                </el-button>
                <el-button type="success" size="small" @click="onThroughUserApplication(scope.row)">
                  通过
                </el-button>
              </template>
            </vxe-table-column>
          </vxe-table>

          <div class="no-data" v-else>
            <h4>
              <font-awesome-icon icon="exclamation-circle" class="icon mr10" />目前没有任何消息
            </h4>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </Layout>
</template>

<style lang="scss" scoped>
.notice {
  .item {
    padding: 10px 20px;
    margin-bottom: 10px;
    border: 2px solid $border-color;
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
