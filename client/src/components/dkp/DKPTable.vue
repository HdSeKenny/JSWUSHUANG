<template>
  <div class="">
    <el-table
      :data="tableData"
      :cell-style="getCellStyle"
      :header-cell-style="headerStyle"
      :stripe="true"
      :lazy="true"
      border
      class="table"
      max-height="800"
      empty-text="0"
      size="small"
    >
      <el-table-column
        v-for="h in tableHeaders"
        :fixed="h.fixed"
        :key="h.prop"
        :prop="h.prop"
        :label="h.label"
        :formatter="columnFormatter"
        :type="h.type"
        :sortable="h.sortable"
        :width="h.width"
      >
      </el-table-column>

      <el-table-column
        fixed="right"
        label="操作"
        :width="isAdmin ? '140px' : '70px'"
        align="center"
        v-if="includeUserAction"
      >
        <template slot-scope="scope">
          <el-button
            v-if="isAdmin"
            type="primary"
            icon="el-icon-edit"
            @click="onViewPersonalInfo(scope.row)"
            size="small"
            circle
          >
          </el-button>
          <el-button
            v-if="isAdminLoggedIn"
            type="success"
            icon="el-icon-document"
            @click="onListHistories(scope.row)"
            size="small"
            circle
          >
          </el-button>
          <el-button
            v-if="isAdmin"
            type="danger"
            icon="el-icon-delete"
            @click="onDeleteDkp(scope.row)"
            size="small"
            circle
          >
          </el-button>

          <el-button
            v-if="isAdmin"
            type="warning"
            icon="el-icon-refresh-left"
            @click="onResetDKPAndUserInfo(scope.row)"
            size="small"
            circle
          >
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="40%"
      v-loading="loading"
    >
      <template v-if="dialogModel === 'EDIT'">
        <el-alert
          :title="notification"
          type="info"
          class="notification"
          show-icon
        ></el-alert>
        <el-form
          label-position="right"
          label-width="80px"
          class="dkp-form mt15"
        >
          <el-form-item label="游戏ID:">
            <p>{{ edittedObj.game_id }}</p>
          </el-form-item>
          <el-form-item label="游戏名字:">
            <el-input
              class="game-name"
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
          <el-form-item label="编辑分数:">
            <el-input-number
              prefix-icon="el-icon-edit"
              :value="edittedObj[edittedField]"
              :controls="false"
              :min="0"
              @input="onFieldChange"
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
          <DKPHistory :histories="historyObj.histories" />
        </template>
        <template
          v-if="!historyObj.histories || historyObj.histories.length === 0"
        >
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
import {
  authMethods,
  DKPMethods,
  DKPComputed,
  authComputed,
} from '@src/state/helpers'

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
        // fontWeight: '500'
      },
    }
  },

  methods: {
    ...authMethods,
    ...DKPMethods,

    getTableHeaders() {
      const defaultInvalid = ['_id', '__v']
      const _invalid = this.invalid
        ? defaultInvalid.concat(this.invalid)
        : defaultInvalid
      return Object.keys(DKP_HEADERS)
        .filter((dsk) => !_invalid.includes(dsk))
        .map((dsk) => {
          const isGameName = dsk === 'game_name'
          const isGameId = dsk === 'game_id'
          // const isGang = dsk === 'gang'
          const isProfession = dsk === 'profession'
          const isPayment = dsk === 'payment'

          let fixed = false
          if (isGameName) {
            fixed = 'left'
          }
          if (isPayment) {
            fixed = 'right'
          }

          let width = false
          if (isGameName) {
            width = '95px'
          } else if (isGameId) {
            width = '115px'
          } else if (isProfession) {
            width = '50px'
          }

          return {
            fixed,
            prop: dsk,
            label: DKP_HEADERS[dsk]['text'],
            type: DKP_HEADERS[dsk].type.toLocaleLowerCase(),
            // sortable: isSum,
            width,
          }
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
      const isGameIdOrName = ['game_id', 'game_name', 'sum'].includes(
        column.property
      )
      const isGang = column.property === 'gang'
      const isOriginal = column.property === 'original'

      let style = {}
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

      return style
    },

    columnFormatter(row, column, cellValue, index) {
      const isPayment = column.property === 'payment'
      const value = cellValue || 0
      return isPayment && value !== 0
        ? `- ${value}`
        : value === '半梦半醒半浮生'
        ? '半梦'
        : value
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
        this.historyObj = this.DKPData.find(
          (d) => d.game_name === row.game_name
        )
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
      const filtered = ['game_name', 'game_id', 'profession', 'sum']
      return Object.keys(this.edittedObj)
        .filter((vd) => !filtered.includes(vd))
        .map((fvd) => ({ label: DKP_HEADERS[fvd]['text'], value: fvd }))
    },

    tableData() {
      const tableHeaders = this.getTableHeaders()
      return this.data.map((u) => {
        const data = {}
        tableHeaders.forEach((h) => {
          data[h.prop] = u[h.prop]
        })
        return data
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.game-name {
  width: 216px;
}
.no-history {
  height: 40px;
}
</style>
