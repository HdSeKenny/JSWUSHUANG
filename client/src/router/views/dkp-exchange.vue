<template>
  <Layout v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.6)">
    <section class="page-content dkp-exchange">
      <div class="exchange-wrapper">
        <el-divider content-position="center">DKP 交易</el-divider>
         <el-alert type="info" :closable="false" show-icon>
          <template v-slot:title>
            <span>我的DKP <span class="price mr15">
              {{currentUser.dkp_score ? currentUser.dkp_score.sum : 0}}
            </span></span>
            <span class="ml15">可交易DKP <span class="price">
              {{currentUser.dkp_score ? currentUser.dkp_score.sum : 0}}
            </span></span>
          </template>
        </el-alert>

        <el-form :model="exchangeForm" :rules="rules" ref="exchangeForm" label-position="left" class="mt15">
          <el-form-item prop="dkpValue" class="mb5">
            <div class="sub-title">* 本次交易的DKP</div>
            <el-input-number prefix-icon="el-icon-edit" v-model="exchangeForm.dkpValue" :controls="false" :min="1" />
          </el-form-item>
          <el-form-item prop="accepter" class="mb5">
            <div class="sub-title">* 查找交易的人</div>
            <el-autocomplete
              class="inline-input"
              popper-class="users-autocomplete"
              v-model="exchangeForm.accepter"
              :fetch-suggestions="querySearch"
              placeholder="请输入内容"
              prefix-icon="el-icon-search"
              @select="handleAccepter">
              <template slot-scope="{ item }">
                <span class="name mr10 bold">{{item.game_name}}</span>
                <span class="other mr5">(ID: {{item.game_id}}</span>
                <span class="other">职业: {{item.profession}})</span>
              </template>
            </el-autocomplete>
          </el-form-item>
          <el-form-item prop="note" class="mb5">
            <div class="sub-title">备注</div>
            <el-input
              type="textarea"
              placeholder="请输入内容"
              class="note"
              :autosize="autoSize"
              v-model="exchangeForm.note">
            </el-input>
          </el-form-item>
          <el-form-item class="mt15">
            <el-button type="primary mt15" @click="submitForm('exchangeForm')">提交本次交易</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="history-wrapper">
        <el-divider content-position="center">交易历史记录</el-divider>
        <el-table :data="tableData" size="small" border style="width: 100%" :cell-style="getCellStyle">
          <el-table-column
            v-for="h in tableHeaders"
            :key="h.prop"
            :prop="h.prop"
            :label="h.label"
            :formatter="columnFormatter"
            :width="h.prop === 'amount' && '120px'">
          </el-table-column>
        </el-table>
      </div>
    </section>
  </Layout>
</template>

<script>
import Layout from '@layouts/main.vue'
import { CHI_SIMS } from '@src/app.config'
import { authComputed, authMethods } from '@state/helpers'
import { formatDate } from './utils.js'

export default {
  components: { Layout },
  data() {
    return {
      loading: false,
      exchangeForm: {
        dkpValue: '',
        accepter: '',
        note: '',
      },
      rules: {
        dkpValue: [
          {
            required: true,
            message: CHI_SIMS.enter_dkp_value,
            trigger: 'change',
          },
        ],

        accepter: [
          {
            required: true,
            message: CHI_SIMS.enter_accepter,
            trigger: 'change',
          },
        ],
      },
      autoSize: {
        minRows: 2,
        maxRows: 2,
      },
      tableHeaders: [
        { prop: 'payer', label: CHI_SIMS.dkp_payer },
        { prop: 'receiver', label: CHI_SIMS.dkp_receiver },
        { prop: 'amount', label: '积分' },
        { prop: 'created', label: '交易时间' },
      ],
    }
  },

  watch: {
    $route: 'fetchData',
  },

  methods: {
    ...authMethods,

    fetchData() {
      this.$store.dispatch('auth/getUsers')
    },

    querySearch(queryString, cb) {
      const results = queryString
        ? this.users.filter(this.createFilter(queryString))
        : this.users
      cb(results)
    },

    createFilter(queryString) {
      return (user) =>
        user.game_name.toLowerCase().includes(queryString.toLowerCase()) ||
        user.game_id.toString().includes(queryString.toLowerCase())
    },

    handleAccepter(row) {
      this.accepterRow = row
      this.exchangeForm.accepter = row.game_name
    },

    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const { dkpValue, accepter } = this.exchangeForm
          if (dkpValue > this.currentUser.dkp_score.sum) {
            return this.$message({
              type: 'error',
              message: '你的dkp余额不足',
              duration: 4000
            })
          }

          this.$confirm(`确定将 ${dkpValue} dkp 交易给 ${accepter} 吗?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.loading = true
            this.dealDkp({
              amount: this.exchangeForm.dkpValue,
              note: this.exchangeForm.note,
              payer: {
                _id: this.currentUser._id,
                game_id: this.currentUser.game_id,
                game_name: this.currentUser.game_name,
              },
              receiver: {
                _id: this.accepterRow._id,
                game_id: this.accepterRow.game_id,
                game_name: this.accepterRow.game_name,
              },
            }).then(() => {
              this.loading = false
              this.$message({
                type: 'success',
                message: '操作成功',
              })
            })
            .catch(err => {
              this.loading = false
              this.$message({
                type: 'error',
                message: err.message,
              })
            })
          })

          return
        }

        return false
      })
    },

    getCellStyle({ row, column, rowIndex, columnIndex }) {
      const isAmount = column.property === 'amount'
      let style = {}
      if (isAmount) {
        style = {
          color: 'red',
          fontWeight: '600'
        }
      }

      if (row[column.property] === this.currentUser.game_name) {
        style = {
          color: '#0a7cda',
          fontWeight: '600'
        }
      }

      return style
    },

    columnFormatter(row, column, cellValue, index) {
      const isCreated = column.property === 'created'
      const value = cellValue || 0
      return isCreated ? formatDate(new Date(value), 'MM/dd hh:mm') : value
    }
  },

  computed: {
    ...authComputed,

    tableData() {
      const datas = this.currentUser.dkp_transaction_records.map((record) => {
        const data = {}
        this.tableHeaders.forEach((th) => {
          data[th.prop] =
            typeof record[th.prop] === 'object'
              ? record[th.prop].game_name
              : record[th.prop]
        })
        return data
      })

      return datas
    },
  },

  created() {
    this.fetchData()
  },
}
</script>

<style lang="scss">
.exchange-wrapper {
  width: 35%;
  display: inline-block;
  .el-autocomplete {
    width: 100%;
  }
  .note {
    width: 100%;
    .el-textarea__inner {
      border: 2px solid #dcdfe6;
    }
  }
  .el-input-number {
    width: 100%;
    .el-input__inner {
      text-align: left;
    }
  }
}

.history-wrapper {
  width: 59%;
  margin-left: 6%;
  display: inline-block;
  vertical-align: top;
}

.users-autocomplete {
  li {
    .name {
      color: $value-blue;
      font-size: 15px;
    }
    .other {
      font-size: 14px;
      color: $theme-gray-color;
    }
  }
}
</style>
