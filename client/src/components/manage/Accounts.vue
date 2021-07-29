<template>
  <section class="accounts" v-loading="loading">
    <div class="search-wrapper mb15">
      <el-input
        class="int-medium"
        prefix-icon="el-icon-search"
        placeholder="输入用户的游戏ID来编辑用户"
        v-model="search"
        @keyup.enter.native="onSearchUsers"
      />
      <el-button class="pt0 ml10" type="primary" @click="onSearchUsers">
        搜素
      </el-button>
    </div>
    <el-button type="text" class="pt0">
      账户信息
    </el-button>
    <el-table
      :data="tableData"
      style="width: 100%"
      max-height="450"
      size="small"
      class="mt15"
      border
    >
      <el-table-column
        v-for="h in tableHeaders"
        :fixed="h.fixed"
        :key="h.prop"
        :prop="h.prop"
        :label="h.label"
        :width="h.width"
      />

      <el-table-column fixed="right" label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            type="primary"
            @click="onResetPassword(scope.row)"
            size="small"
          >
            重置密码
          </el-button>
          <el-button
            type="primary"
            @click="onShowRecoverModal(scope.row)"
            size="small"
          >
            恢复数据
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      title="恢复个人数据"
      :visible.sync="recoverVisible"
      width="250px"
    >
      <el-select v-model="backupFilename" placeholder="请选择需要恢复的备份">
        <el-option
          v-for="bi in backupedList"
          :key="bi"
          :label="bi"
          :value="bi"
        ></el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="recoverVisible = false">取消</el-button>
        <el-button type="primary" @click="onRecoverPersonalData"
          >恢复</el-button
        >
      </span>
    </el-dialog>
  </section>
</template>

<script>
import { USER_TABLE_HEADERS } from '@src/app.config'
import { MESSAGE_TYPES } from '@state/constants'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Accounts',
  data() {
    return {
      tableHeaders: USER_TABLE_HEADERS,
      search: '',
      users: [],
      gameId: '',
      newAnnouncement: '',
      gold: 0,
      loading: false,
      recoverVisible: false,
      backupFilename: null,
      recoverGameId: null,
    }
  },
  methods: {
    ...mapActions('auth', ['resetPassword', 'recoverPersonalData']),
    ...mapActions('admin', ['searchUsers']),

    onResetPassword(row) {
      const userRow = this.users.find((u) => u.game_id === row.game_id)
      this.loading = true
      this.resetPassword(userRow._id)
        .then(() => {
          this.loading = false
          this.$message(MESSAGE_TYPES.SUCCESS)
        })
        .catch(() => {
          this.loading = false
          this.$message(MESSAGE_TYPES.ERROR)
        })
    },
    onSearchUsers() {
      if (!this.search) {
        return this.$notify({
          title: '提示',
          message: '请输入ID',
          type: 'error',
          duration: 3000,
        })
      }

      this.loading = true
      this.searchUsers({ searchStr: this.search })
        .then((data) => {
          this.loading = false
          this.users = data
        })
        .catch(() => {
          this.loading = false
        })
    },
    onShowRecoverModal(row) {
      this.recoverGameId = row.game_id
      this.recoverVisible = true
    },
    onRecoverPersonalData() {
      this.loading = true
      this.recoverPersonalData({
        recoverGameId: this.recoverGameId,
        backupFilename: this.backupFilename,
      })
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
      backupedList: (state) => state.backupedList,
    }),
    tableData() {
      return this.users.map((u) => {
        const _ud = {}
        this.tableHeaders.forEach((th) => {
          _ud[th.prop] = u[th.prop]
        })
        return _ud
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.accounts {
  padding: 20px;
  background-color: #fff;
  .announcement {
    display: block;
    width: 400px;
  }
}
</style>
