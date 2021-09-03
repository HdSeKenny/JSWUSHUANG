<template>
  <div class="table-page">
    <vxe-table
      :data="tableData"
      :cell-style="getCellStyle"
      :header-cell-style="headerStyle"
      :stripe="true"
      :lazy="true"
      :auto-resize="true"
      class="table"
      max-height="590"
      empty-text="没有数据"
      size="small"
      border
    >
      <vxe-table-column
        v-for="h in tableHeaders"
        :fixed="h.fixed"
        :key="h.field"
        :field="h.field"
        :title="h.title"
        :formatter="columnFormatter"
        :sortable="h.sortable"
        :width="h.width"
      >
      </vxe-table-column>

      <vxe-table-column
        fixed="right"
        field="操作"
        title="操作"
        :width="70"
        align="center"
        v-if="isRoot"
      >
        <template slot-scope="scope">
          <el-dropdown @command="(command) => onDropDownClick(command, scope.row)">
            <el-button v-if="isAdmin" type="primary" size="small" circle>
              <i class="el-icon-more"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="edit">
                <i class="el-icon-edit"></i> 编辑
              </el-dropdown-item>
              <el-dropdown-item command="history">
                <i class="el-icon-document"></i> 历史
              </el-dropdown-item>
              <el-dropdown-item command="delete">
                <i class="el-icon-delete"></i> 删除
              </el-dropdown-item>
              <el-dropdown-item command="recover">
                <i class="el-icon-refresh-left"></i> 恢复
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </vxe-table-column>
    </vxe-table>
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="360px" v-loading="loading">
      <template v-if="dialogModel === 'EDIT'">
        <el-form label-position="right" label-width="80px" class="dkp-form mt15">
          <el-form-item label="游戏ID:">
            <p>{{ edittedObj.game_id }}</p>
          </el-form-item>
          <el-form-item label="游戏名字:">
            <el-input
              class="field-input"
              :value="edittedObj.game_name"
              @input="onNameChange"
            ></el-input>
          </el-form-item>

          <el-form-item label="选择选项:">
            <el-select v-model="edittedField">
              <el-option
                v-for="ef in edittedFields"
                :key="ef.value"
                :label="ef.label"
                :value="ef.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="编辑选项:">
            <el-input
              class="field-input"
              prefix-icon="el-icon-edit"
              :value="edittedObj[edittedField]"
              @input="onFieldChange"
              v-if="edittedField === 'gang'"
            ></el-input>
            <el-input-number
              class="field-input"
              prefix-icon="el-icon-edit"
              :value="edittedObj[edittedField]"
              :controls="false"
              :min="0"
              @input="onFieldChange"
              v-else
            />
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="onUpdateDKPInfo">更 新</el-button>
        </span>
      </template>
      <template v-else>
        <template v-if="historyObj.histories && historyObj.histories.length">
          <DKPHistory :dkp="historyObj" />
        </template>
        <template v-if="!historyObj.histories || historyObj.histories.length === 0">
          <div class="no-history">没有历史记录</div>
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
import DKPHistory from '@components/dkp/DKPHistory.vue'
import { DKP_HEADERS } from '@src/app.config'
import { authMethods, DKPMethods, DKPComputed, authComputed } from '@src/state/helpers'

export default {
  components: {
    DKPHistory,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    invalid: {
      type: Array,
      default: () => [],
    },
    includeUserInfo: {
      type: Boolean,
      default: false,
    },
    includeUserAction: {
      type: Boolean,
      default: false,
    },
    showSearch: {
      type: Boolean,
      default: false,
    },
    cellStyle: {
      type: Object,
      default: () => {},
    },
    currentDkp: {
      type: Object,
      default: () => {},
    },
  },
  data(props) {
    return {
      tableHeaders: this.getTableHeaders(),
      dialogVisible: false,

      edittedField: 'league_friday',
      newFieldValue: '',
      notification: '可更新成员的名字和相应的DKP分数',

      sourceRow: {},
      viewedUser: {},
      edittedObj: {},
      historyObj: {},
      loading: false,

      dialogModel: 'EDIT',
      dialogTitle: '个人DKP明细',

      headerStyle: {
        fontSize: '13px',
      },
    }
  },
  methods: {
    ...authMethods,
    ...DKPMethods,

    onDropDownClick(command, row) {
      switch (command) {
        case 'edit':
          this.onViewPersonalInfo(row)
          break
        case 'history':
          this.onListHistories(row)
          break
        case 'delete':
          this.onDeleteDkp(row)
          break
        case 'recover':
          this.onResetDKPAndUserInfo(row)
          break
        case 'gang_admin':
          this.setUserGangeAdmin(row)
          break
        default:
          break
      }
    },

    setUserGangeAdmin(row) {
      this.$confirm(`确定要将${row.game_name}设为帮会的管理员么?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
      }).then(() => {
        const dkp = this.DKPData.find((dd) => dd.game_name == row.game_name)
        this.setGangAdmin(dkp.game_id).then(() => {
          this.$notify({
            title: '提示',
            message: '删除成功!',
            type: 'success',
            duration: 3000,
          })
        })
      })
    },

    getTableHeaders() {
      const defaultInvalid = ['_id', '__v', '_XID']
      const _invalid = this.invalid ? defaultInvalid.concat(this.invalid) : defaultInvalid
      return Object.keys(DKP_HEADERS)
        .filter((dsk) => !_invalid.includes(dsk))
        .map((dsk) => {
          const isGameName = dsk === 'game_name'
          const isGameId = dsk === 'game_id'
          // const isGang = dsk === 'gang'
          const isProfession = dsk === 'profession'
          const isPayment = dsk === 'payment'

          const result = {
            field: dsk,
            title: DKP_HEADERS[dsk]['text'],
          }

          if (isGameName) {
            result.fixed = 'left'
          }
          if (isPayment) {
            result.fixed = 'right'
          }

          if (isGameName) {
            result.width = '95px'
          } else if (isGameId) {
            result.width = '115px'
          } else if (isProfession) {
            result.width = '50px'
          } else {
          }

          return result
        })
    },

    onViewPersonalInfo(row) {
      this.sourceRow = _.cloneDeep(row)
      this.edittedObj = row
      this.dialogVisible = true
      this.dialogModel = 'EDIT'
      this.dialogTitle = '个人DKP明细'
    },

    onFieldChange(value) {
      this.edittedObj[this.edittedField] = value
    },

    onNameChange(name) {
      this.edittedObj.game_name = name
    },

    onUpdateDKPInfo() {
      const edittedFields = []
      Object.keys(this.sourceRow).forEach((sourceKey) => {
        if (this.edittedObj[sourceKey] != this.sourceRow[sourceKey]) {
          const fieldObj = {
            key: sourceKey,
            oldValue: this.sourceRow[sourceKey] || 0,
            newValue: this.edittedObj[sourceKey],
            text: DKP_HEADERS[sourceKey].text,
          }

          const edittedValue = parseInt(this.edittedObj[sourceKey] || 0)
          const sourceValue = parseInt(this.sourceRow[sourceKey] || 0)
          if (!_.isNaN(edittedValue)) {
            if (edittedValue < sourceValue) {
              fieldObj.symbol = '-'
              fieldObj.changed_value = sourceValue - edittedValue
            } else if (sourceKey === 'payment') {
              fieldObj.symbol = '-'
              fieldObj.changed_value = edittedValue - sourceValue
            } else {
              fieldObj.symbol = '+'
              fieldObj.changed_value = edittedValue - sourceValue
            }
          }

          edittedFields.push(fieldObj)
        }
      })

      if (!edittedFields.length) {
        return this.$notify({
          title: '提示',
          message: '你没有任何修改',
          type: 'error',
          duration: 3000,
        })
      }

      this.loading = true
      setTimeout(() => {
        this.updateDKPInfo({
          edittedObj: this.edittedObj,
          edittedHistory: {
            type: 'single',
            fields: edittedFields,
          },
        })
          .then((data) => {
            this.loading = false
            this.$message({ message: '修改成功', type: 'success' })
            this.dialogVisible = false
          })
          .catch(() => {
            this.loading = false
            this.dialogVisible = false
          })
      }, 500)
    },

    getCellStyle({ row, column, rowIndex, columnIndex }) {
      const isPayment = column.property === 'payment'
      const isGameIdOrName = ['game_id', 'game_name', 'sum'].includes(column.property)
      const isGang = column.property === 'gang'
      const isSum = column.property === 'sum'
      const isOriginal = column.property === 'original'

      let style = {
        whiteSpace: 'nowrap',
      }
      if (isPayment) {
        style = {
          color: 'red',
          fontWeight: '700',
          fontSize: '13px',
        }
      }

      if (isGameIdOrName) {
        style = {
          color: '#0386AC',
          fontWeight: '700',
          fontSize: '13px',
        }
      }

      if (isGang) {
        style = {
          color: '#E6A23C',
          fontWeight: '700',
          fontSize: '13px',
        }
      }

      if (isOriginal) {
        style = {
          color: '#F56C6C',
          fontWeight: '700',
          fontSize: '13px',
        }
      }

      if (isSum) {
        style = {
          color: 'rgb(3, 134, 172)',
          fontWeight: '700',
          fontSize: '16px',
        }
      }

      return style
    },

    calculateSum(row) {
      const plusFields = [
        'league_friday',
        'league_saturday',
        'field',
        'territorial_stronghold',
        'original',
      ]
      const reduceFields = ['payment']
      let sum = 0
      for (let i = 0; i < plusFields.length; i++) {
        const field = plusFields[i]
        sum += row[field] || 0
      }

      for (let i = 0; i < reduceFields.length; i++) {
        const field = reduceFields[i]
        sum -= row[field] || 0
      }

      return sum
    },

    columnFormatter({ row, column, cellValue, index }) {
      const isPayment = column.property === 'payment'
      const isSum = column.property === 'sum'
      let value = cellValue || 0
      if (isSum) {
        value = cellValue || this.calculateSum(row)
      }
      return isPayment && value !== 0 ? `- ${value}` : value
    },

    onDeleteDkp(row) {
      this.$confirm('此操作将永久删除该DKP, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
      }).then(() => {
        const dkp = this.DKPData.find((dd) => dd.game_name == row.game_name)
        this.deleteDkp(dkp.game_id).then(() => {
          this.$notify({
            title: '提示',
            message: '删除成功!',
            type: 'success',
            duration: 3000,
          })
        })
      })
    },

    onResetDKPAndUserInfo(row) {
      this.$confirm('此操作将初始化DKP, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
      }).then(() => {
        const dkp = this.DKPData.find((dd) => dd.game_name == row.game_name)
        this.resetDKPAndUserInfo({ game_id: dkp.game_id }).then(() => {
          this.$notify({
            title: '提示',
            message: '操作成功!',
            type: 'success',
            duration: 3000,
          })
        })
      })
    },

    onListHistories(row) {
      if (this.isAdminLoggedIn) {
        this.historyObj = this.DKPData.find((d) => d.game_name === row.game_name)
      } else {
        this.historyObj = this.currentDkp
      }

      this.dialogModel = 'HISTORY'
      this.dialogTitle = `${this.historyObj.game_name} DKP记录`
      this.dialogVisible = true
    },
  },

  computed: {
    ...DKPComputed,
    ...authComputed,
    isAdminLoggedIn() {
      return this.isAdmin || this.isLookedAdmin
    },
    edittedFields() {
      const filtered = ['game_name', 'game_id', 'profession', 'sum', '_XID']
      return Object.keys(this.edittedObj)
        .filter((vd) => !filtered.includes(vd))
        .map((fvd) => ({ label: DKP_HEADERS[fvd]['text'], value: fvd }))
    },

    tableData() {
      const tableData = this.data.map((u) => {
        const data = {}
        this.tableHeaders.forEach((h) => {
          data[h.field] = u[h.field]
        })
        return data
      })

      return tableData
    },
  },
}
</script>

<style lang="scss">
.table-page {
  .el-select,
  .field-input {
    width: calc(100% - 10px);
  }
  .no-history {
    height: 40px;
  }
  .el-dialog__body {
    padding: 0 20px;
  }
  .el-form-item {
    margin-bottom: 20px;
    &:first-child,
    &:last-child {
      margin-bottom: 15px;
    }
  }
  .histories-wrapper {
    padding-bottom: 20px;
  }
}
</style>
