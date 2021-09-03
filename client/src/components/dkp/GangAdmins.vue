<template>
  <section class="gang-admins" v-loading="loading">
    <div class="actions" v-if="isAdmin">
      <el-button class="fl mb15" type="primary" @click="showAddNewAdminInfo" size="medium">
        增加管理信息
      </el-button>
    </div>
    <el-table empty-text="没有数据" size="small" :data="gangAdmins" :stripe="true" border>
      <el-table-column
        v-for="item in gangAdminsHeaders"
        :prop="item.prop"
        :label="item.label"
        :key="item.prop"
      >
      </el-table-column>
      <el-table-column label="操作" v-if="isAdmin">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="title" :visible.sync="gangModalVisible" width="350px">
      <el-form label-position="right" label-width="80px" @submit.prevent="onSumbitForm">
        <el-form-item label="游戏名" prop="gameName">
          <el-autocomplete
            class="field-input"
            v-model="gameName"
            :fetch-suggestions="querySearchName"
            placeholder="输入游戏名"
            @select="() => {}"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item label="微信">
          <el-input class="field-input" placeholder="输入微信" v-model="wechat"></el-input>
        </el-form-item>
        <el-form-item label="帮会名">
          <el-select v-model="gang" class="field-input">
            <el-option v-for="p in gangs" :key="p" :label="p" :value="p"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="" v-if="error">
          <p class="error">{{ error }}</p>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="gangModalVisible = false">取 消</el-button>
        <el-button type="primary" @click="onSumbitForm">
          添 加
        </el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import _ from 'lodash'
import { mapState, mapActions } from 'vuex'
import { GANGS } from '@src/app.config'
import { MESSAGE_TYPES } from '@state/constants'

export default {
  name: 'GangAdmins',
  data() {
    return {
      gang: GANGS[0],
      gangs: GANGS,
      gangModalVisible: false,
      error: null,
      wechat: null,
      gameName: null,
      gameId: null,
      loading: false,
      gangAdminsHeaders: [
        { prop: 'game_name', label: '游戏名' },
        { prop: 'wechat', label: '微信号' },
        { prop: 'gang', label: '帮会' },
      ],
      type: 'add',
      title: '增加管理信息',
    }
  },
  computed: {
    ...mapState('auth', {
      isAdmin: (state) => state.isAdmin,
    }),
    ...mapState('dkps', {
      gangAdmins: (state) => state.gangAdmins,
      DKPData: (state) => state.DKPData,
    }),
    dkpDataNames() {
      return [...new Set(this.DKPData.map((d) => d.game_name))]
    },
  },
  methods: {
    ...mapActions('dkps', ['addNewGangAdmin', 'updateGangAdmin', 'deleteGangAdmin']),

    showAddNewAdminInfo() {
      this.type = 'add'
      this.title = '增加管理信息'
      this.gangModalVisible = true
    },
    onSumbitForm() {
      if (!this.gang || !this.wechat || !this.gameName) {
        return this.$message({
          type: 'error',
          message: '请补全信息',
        })
      }
      const isAdd = this.type === 'add'
      const action = isAdd ? 'addNewGangAdmin' : 'updateGangAdmin'
      const result = {
        gang: this.gang,
        wechat: this.wechat,
        game_name: this.gameName,
      }

      if (!isAdd) {
        result._id = this.gameId
      }

      this[action](result)
        .then(() => {
          this.loading = false
          this.gangModalVisible = false
          this.gang = GANGS[0]
          this.gameName = null
          this.gameId = null
          this.wechat = null
          this.$message(MESSAGE_TYPES.SUCCESS)
        })
        .catch(() => {
          this.loading = false
          this.gangModalVisible = false
          this.$message(MESSAGE_TYPES.ERROR)
        })
    },

    querySearchName(queryString, cb) {
      _.throttle(() => {
        const names = this.dkpDataNames
        const results = queryString ? names.filter(this.createFilter(queryString)) : names
        cb(results.map((r) => ({ value: r })))
      }, 500)()
    },
    createFilter(queryString) {
      return (link) => {
        return link.toLowerCase().includes(queryString.toLowerCase())
      }
    },
    handleEdit(row) {
      this.type = 'edit'
      this.title = '更新管理信息'
      this.gangModalVisible = true
      this.gang = row.gang
      this.gameName = row.game_name
      this.wechat = row.wechat
      this.gameId = row._id
    },

    handleDelete(row) {
      this.$confirm(`确定要删除嘛?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
      })
        .then(() => {
          this.loading = true
          this.deleteGangAdmin(row._id)
            .then(() => {
              this.loading = false
              this.$message(MESSAGE_TYPES.SUCCESS)
            })
            .catch(() => {
              this.loading = false
              this.$message(MESSAGE_TYPES.ERROR)
            })
        })
        .catch(() => {})
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@design';

.gang-admins {
  .field-input {
    width: 195px;
  }
}
</style>
