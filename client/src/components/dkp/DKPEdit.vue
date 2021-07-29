<template>
  <section class="dkp-edit" v-loading="loading">
    <el-alert :title="notification" :description="description" type="info" class="notification" show-icon></el-alert>
    <div class="dkp-info">
      <el-form :model="dkpForm" label-position="left" label-width="80px" class="dkp-form">
        <el-form-item label="编辑模式" prop="members">
          <el-select v-model="editModel" placeholder="请选择参与的活动">
            <el-option v-for="d in dkpEditModels" :key="d.value" :label="d.label" :value="d.value"></el-option>
          </el-select>
        </el-form-item>
        <template v-if="['importBatch', 'OCR'].includes(editModel)">
          <el-form-item label="参与活动" prop="activity">
            <el-select v-model="dkpForm.activity" placeholder="请选择参与的活动">
              <el-option v-for="a in dkpActivities" :key="a.value" :label="a.label" :value="a.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="对应DKP" prop="dkp">
            <el-select v-model="dkpForm.dkp" placeholder="请选择增加的DKP">
              <el-option v-for="v in dkpValues" :key="v.value" :label="v.label" :value="v.value"></el-option>
            </el-select>
          </el-form-item>
        </template>
        <el-form-item label="上传文件" prop="file" v-if="editModel !== 'OCR'">
          <el-upload
            class="ocr-upload"
            ref="upload"
            action=""
            accept=".xlsx, .XLSX, .csv"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-change="handleChooseFile"
            :before-remove="beforeRemove"
            :on-exceed="handleExceed"
            :auto-upload="false"
            :multiple="false"
            :file-list="fileList"
            drag>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          </el-upload>
        </el-form-item>
        <template v-if="editModel === 'OCR'">
          <el-form-item label="上传文件" prop="file">
            <el-upload
              class="ocr-upload"
              accept=".jpg, .png, .jpeg"
              :on-preview="handlePreview"
              :on-remove="onOCRRemove"
              :on-change="handleChooseFile"
              :before-remove="beforeRemove"
              :on-exceed="handleExceed"
              :auto-upload="false"
              :file-list="fileList"
              list-type="picture"
              action=""
              drag
              multiple>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            </el-upload>
          </el-form-item>
        </template>
        <el-form-item>
          <el-button type="primary" @click="submitForm('dkpForm')">提交编辑</el-button>
        </el-form-item>
      </el-form>
      <div class="ocr-members" v-if="this.dkpForm.members.length">
        <h5 class="mb10">识别出的人员名单 ({{this.dkpForm.members.length}}):</h5>
        <div class="memvers-wrapper">
          <el-tag v-for="(item, i) in dkpForm.members"
            @close="onCloseOCRMember(item)"
            :key="i" effect="plain" class="mr10 mb10" closable>{{item.game_name}}</el-tag>
        </div>
        <div class="memvers-wrapper mt15" v-if="invalidMembers.length">
          <h5 class="mb5 mt5">未识别出的人员名单 ({{invalidMembers.length}}):</h5>
          <el-tag v-for="(item, i) in invalidMembers"
            :key="i" effect="plain" class="mr10 mb10" type="danger">{{item.game_name}}</el-tag>
        </div>
        <div class="mt15">
          <el-input
            class="new-member-tag"
            v-if="newMemberVisible"
            v-model="newMemberValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleNewMemberConfirm"
            @blur="handleNewMemberConfirm"
          >
          </el-input>
          <el-button v-else class="button-new-tag" size="small" @click="showNewMemberInput">+ 添加</el-button>
        </div>
      </div>
      <div class="data-grid" v-if="errMsg">
        <p class="m0 error">* {{errMsg}}</p>
      </div>
    </div>
  </section>
</template>

<script>
import XLSX from 'xlsx'
import { DKP_HEADERS, app } from '@src/app.config'
import { DKPMethods, DKPComputed, authMethods, authComputed } from '@state/helpers'

export default {
  name: 'DKPEdit',
  components: {},
  data() {
    return {
      fileList: [],
      ocrFileList: [],
      notification: '数据导入, 批量修改, 图片识别',
      description: ' 1.选择编辑模式 2.填写DKP相关信息 3.上传文件',
      dkpActivities: [
        { label: '周四天江', value: 'tianjiang' },
        { label: '周五联赛', value: 'league_friday' },
        { label: '周六联赛', value: 'league_saturday' },
        { label: '宝石', value: 'gemstone' },
        { label: '野外开红', value: 'field' },
        { label: '据点战', value: 'territorial_stronghold' },
        { label: '原始积分', value: 'original' },
      ],
      dkpValues: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 },
        { label: '5', value: 5 },
        { label: '6', value: 6 },
        { label: '7', value: 7 },
      ],
      editModel: 'OCR',
      dkpEditModels: [
        { label: '初始化', value: 'importAll' },
        { label: '导入数据', value: 'importBatch' },
        { label: '图片识别', value: 'OCR'}
      ],
      dkpForm: {
        activity: 'league_friday',
        dkp: 1,
        members: [],
      },
      errMsg: '',
      dkpData: [],
      loading: false,
      newMemberVisible: false,
      newMemberValue: '',
      invalidMembers: [],
    }
  },

  computed: {
    ...DKPComputed,
    ...authComputed,
  },

  watch: {
    editModel() {
      this.fileList = []
      this.ocrFileList = []
      this.invalidMembers = []
      this.errMsg = ''
      this.dkpForm = {
        activity: 'league_friday',
        dkp: 1,
        members: [],
      }
    }
  },

  methods: {
    ...authMethods,
    ...DKPMethods,

    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 1 个文件，本次选择了 ${
          files.length
        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
      )
    },

    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },

    handleRemove(file, fileList) {
      this.dkpForm.members = []
      this.invalidMembers = []
      this.dkpData = []
      this.errMsg = ''
    },

    onOCRRemove(file, fileList) {
      this.errMsg = ''
      this.ocrFileList = this.ocrFileList.filter(ofl => ofl.name !== file.name)
      this.dkpForm.members = this.ocrFileList.length ? this.ocrFileList
        .filter(ofl => ofl.data && ofl.data.length)
        .map((ofl) => ofl.data)
        .reduce((a, b) => a.concat(b)) : []
    },

    handlePreview() {},

    ec(r, c) {
      return XLSX.utils.encode_cell({ r: r, c: c })
    },

    deleteRow(ws, rowIdx) {
      const range = XLSX.utils.decode_range(ws['!ref'])
      for (let R = rowIdx; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          ws[this.ec(R, C)] = ws[this.ec(R + 1, C)]
        }
      }
      // range.e.r--
      ws['!ref'] = XLSX.utils.encode_range(range.s, range.e)
    },

    handleChooseFile(file, fileList) {
      const reader = new FileReader()
      const dkps = this.DKPData
      const isOCR = this.editModel === 'OCR'

      this.loading = true
      this.fileList = isOCR ? fileList : fileList.slice(-1);

      reader.onload = (e) => {
        if (!isOCR) {
          const data = e.target.result
          this.calculateExcelData(data, dkps)
          this.loading = false
        } else {
          const fd = new FormData()
          fd.append('image-file', file.raw)
          this.getMembersByOCR(fd)
            .then((data) => {
              this.ocrFileList.push({
                name: file.name,
                data
              })
              this.dkpForm.members = this.ocrFileList.map(ofl => ofl.data).reduce((a, b) => a.concat(b))
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        }
      }
      reader.readAsText(file.raw, 'GB2312')
    },

    calculateExcelData(data, dkps) {
      const workbook = XLSX.read(data, { type: 'binary' })
      const firstSheetName = workbook.SheetNames[0]
      const _sheet = workbook.Sheets[firstSheetName]

      let XLRowArr = XLSX.utils.sheet_to_row_object_array(_sheet)

      const firstRowKeys = Object.keys(XLRowArr[0])
      const tableHeaderTexts = Object.keys(DKP_HEADERS).map(
        (hk) => DKP_HEADERS[hk].text
      )

      let isFirstRow = false
      tableHeaderTexts.push('玩家')
      tableHeaderTexts.forEach((th) => {
        if (firstRowKeys.includes(th)) {
          isFirstRow = true
        }
      })

      if (!isFirstRow) {
        this.deleteRow(_sheet, 0)
        XLRowArr = XLSX.utils.sheet_to_row_object_array(_sheet)
      }

      if (this.editModel === 'importAll') {
        this.errMsg = ''
        this.dkpData = this.calculateImportAll(XLRowArr)
      }
      else if (this.editModel === 'importBatch') {
        const headerRowArr = Object.keys(XLRowArr[0])
        const hasGameId = headerRowArr.includes('游戏ID')
        const hasGameName = headerRowArr.includes('游戏名称')
        const hasPlayerName = headerRowArr.includes('玩家')
        if (!hasGameId && !hasGameName && !hasPlayerName) {
          return this.$notify({
            title: '提示',
            message: '文件必须包含字段 "游戏ID" 或者 "游戏名称" 或者 "玩家"',
            type: 'error',
            duration: 3000,
          })
        }

        const validRows = XLRowArr.filter(row => !!dkps.find(dpd =>
          dpd.game_id == row['游戏ID']
          || dpd.game_name == row['游戏名称']
          || dpd.game_name == row['玩家']
        ))

        const invalidRows = XLRowArr.filter(row => {
          const _dkp = dkps.find(d => d.game_name == row['玩家'])
          return _dkp ? 0 : 1
        })

        this.invalidMembers = invalidRows.map((row) => ({
          game_id: row['游戏ID'],
          game_name: row['游戏名称'] || row['玩家'],
          gang: row['帮会名'],
        })).filter(xr => app.GANGS.includes(xr.gang))

        if (!validRows.length) {
          this.errMsg = '数据库没有找到匹配的玩家，请先导入数据'
        }
        else {
          this.errMsg = ''
          this.dkpForm.members = validRows.map((row) => {
            const member = {
              game_id: row['游戏ID'],
              game_name: row['游戏名称'] || row['玩家'],
              gang: row['帮会名'],
            }
            const _localDkp = dkps.find(d => d.game_name == member.game_name)
            if (_localDkp) {
              member.game_id = member.game_id || _localDkp.game_id
              member.gang = member.gang || _localDkp.gang
            }
            return member
          }).filter(xr => app.GANGS.includes(xr.gang))
        }
      }
    },

    calculateImportAll(XLRowArr) {
      return XLRowArr.map((row) => {
        return Object.keys(row).reduce((obj, key) => {
          const fieldMatched = Object.keys(DKP_HEADERS).find(
            (hk) => DKP_HEADERS[hk].text === key
          )

          if (fieldMatched) {
            obj[fieldMatched] = row[key] || 0
          }
          return obj
        }, {})
      })
    },

    submitImportAll() {
      if (!this.dkpData.length) {
        this.errMsg = '选择要导入的Excel文件'
        return
      }

      this.$confirm('此操作会覆盖之前的数据, 你确定要导入吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        this.importAllExcelData(this.dkpData).then(() => {
          this.resetEditValues()
          this.$message({ message: '导入成功', type: 'success' })
          this.updateHomeTab('ALL')
        })
        .catch(err => {
          this.loading = false
          this.errMsg = err.message
        })
      })
    },

    submitImportBatch() {
      if (!this.dkpForm.members.length) {
        this.errMsg = '选取文件导入参与活动的成员'
        return
      }

      this.loading = true
      this.updateManyDKPInfo({
        members: this.dkpForm.members,
        activity: this.dkpForm.activity,
        activityText: DKP_HEADERS[this.dkpForm.activity].text,
        dkp: this.dkpForm.dkp,
      })
      .then(() => {
        this.resetEditValues()
        this.$message({ message: '更新成功', type: 'success' })
        this.updateHomeTab('ALL')
      })
      .catch(err => {
        this.loading = false
        this.errMsg = err.message
      })
    },

    submitImportOCR() {
      if (!this.dkpForm.members.length) {
        this.errMsg = '选取文件导入参与活动的成员'
        return
      }

      const invalidMembers = []
      this.dkpForm.members.forEach(dm => {
        const corrMember = this.DKPData.find(dpd => dpd.game_name.includes(dm.game_name))
        if (!corrMember) {
          invalidMembers.push(dm.game_name)
        }
      })

      if (invalidMembers.length) {
        this.errMsg = `存在不匹配的人员，${invalidMembers.join(', ')}`
        return
      }

      this.submitImportBatch()
    },

    submitForm(formName) {
      const isImportAll = this.editModel === 'importAll'
      const isImportBatch = this.editModel === 'importBatch'
      const isOCR = this.editModel === 'OCR'

      if (isImportAll) {
        this.submitImportAll()
      } else if (isImportBatch) {
        this.submitImportBatch()
      } else if (isOCR) {
        this.submitImportOCR()
      }
    },

    resetEditValues() {
      this.loading = false
      this.ocrFileList = []
      this.fileList = []
      this.invalidMembers = []
      this.dkpForm = {
        activity: 'league_friday',
        dkp: 1,
        members: [],
      }
    },

    endEdit() {
      this.$refs.datagrid.endEdit()
    },

    getCellStyle({ row, column, rowIndex, columnIndex }) {
      let style = {}
      if (column.property === 'game_name') {
        style = {
          color: '#0a7cda',
          fontWeight: '600'
        }
      }
      return style
    },

    onCloseOCRMember(tag) {
      this.dkpForm.members = this.dkpForm.members.filter(m => m.game_id != tag.game_id)
    },

    showNewMemberInput() {
      this.newMemberVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.focus();
      });
    },

    handleNewMemberConfirm() {
      if (this.newMemberValue) {
        const dkp = this.DKPData.find(dd => dd.game_name == this.newMemberValue)
        if (!dkp) {
          return this.$notify({
            title: '提示',
            message: '数据库没找到对应的名字',
            type: 'error',
            duration: 3000,
          })
        }

        this.dkpForm.members.push({
          game_id: dkp.game_id,
          game_name: dkp.game_name
        })
      }

      this.newMemberVisible = false;
      this.newMemberValue = '';
    }
  },
}
</script>

<style lang="scss">
.dkp-edit {
  // min-height: 700px;
  background-color: #fff;
  padding: 0 15px;
  .notification {
    margin-top: 20px;
  }
  .dkp-info {
    margin-top: 30px;
    .dkp-form {
      width: 330px;
      display: inline-block;
    }
    .data-grid {
      width: 100%;
      height: 380px;
      overflow: auto;
    }
    .ocr-upload {
      width: 100%;
      .el-upload-dragger {
        width: 250px
      }
    }
    .ocr-members {
      margin-left: 50px;
      width: calc(100% - 380px);
      display: inline-block;
      vertical-align: top;
      .memvers-wrapper {
        max-height: 450px;
        overflow: auto;
      }
    }
  }
  .dkp-form-note {
    color: #909399;
  }

  #pane-DKPEDIT {
    height: auto;
    background: #fff;
  }
}
</style>
