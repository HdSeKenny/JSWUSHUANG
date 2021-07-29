<template>
  <section class="dkp-list">
    <div class="table-wrapper">
      <div class="search-wrapper mt15" v-if="isAdminLoggedIn">
        <el-input class="search" :placeholder="searchHolder" prefix-icon="el-icon-search" v-model="search"></el-input>
        <el-button class="fr ml10" type="warning" @click="onDownloadExcel" size="medium">下载数据</el-button>
        <el-button class="fr" type="primary" @click="showAddNewDKP" v-if="isAdmin" size="medium">增加dkp</el-button>
      </div>
      <DKPTable
        :data="filterAndSized.sized"
        :includeUserInfo="true"
        :includeUserAction="isAdminLoggedIn"
        :showSearch="true"
        :showActions="true"
        :cellStyle="cellStyle"
        :currentDkp="currentDkp"
        :invalid="(isAdminLoggedIn || isLookedAdmin) ? [] : defaultInvalid">
      </DKPTable>
      <el-pagination
        background
        layout="prev, pager, next"
        class="tac mt15 mb15"
        :page-size="pageSize"
        :total="filterAndSized.filtered.length"
        @current-change="onPageChange"
        v-if="isAdminLoggedIn">
      </el-pagination>
      <el-dialog title="增加DKP记录" :visible.sync="newDKPVisible" width="450px">
        <el-form :model="newDKPForm" :rules="rules" label-position="right" label-width="80px" ref="newDKPForm"  @submit.prevent="onAddNewDKP">
          <el-form-item label="游戏ID" prop="game_id">
            <el-input class="field-input" v-model="newDKPForm.game_id"></el-input>
          </el-form-item>
          <el-form-item label="游戏名" prop="game_name">
            <el-input class="field-input" v-model="newDKPForm.game_name"></el-input>
          </el-form-item>
          <el-form-item label="初始分">
            <el-input class="field-input" v-model="newDKPForm.original" type="number"></el-input>
          </el-form-item>
          <el-form-item label="职业">
            <el-select v-model="newDKPForm.profession" class="field-input">
              <el-option v-for="p in PROFESSIONS" :key="p.value" :label="p.label" :value="p.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="帮会名">
            <el-select v-model="newDKPForm.gang" class="field-input">
              <el-option v-for="p in GANGS" :key="p" :label="p" :value="p"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="" v-if="error">
            <p class="error">{{error}}</p>
          </el-form-item>
          
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="newDKPVisible = false">取 消</el-button>
          <el-button type="primary" @click="onAddNewDKP('newDKPForm')">更 新</el-button>
        </span>
      </el-dialog>
    </div>
  </section>
</template>

<script>
import _ from 'lodash'
import DKPTable from '@components/dkp/DKPTable.vue'
import { mapActions } from 'vuex'
import { authComputed, DKPComputed, DKPMethods } from '@state/helpers'
import { PROFESSIONS, app, CHI_SIMS } from '@src/app.config'

export default {
  name: 'DKPList',
  components: { DKPTable },
  data() {
    return {
      pageSize: 10,
      search: '',
      page: 1,
      cellStyle: {},
      searchHolder: '请输入游戏id或者游戏名称搜索',
      defaultInvalid: ['game_id', 'game_name', 'profession', 'gang'],
      newDKPVisible: false,
      newDKPForm: {
        game_id: null,
        game_name: null,
        original: 0,
        profession: '碎梦',
        gang: '半梦半醒半浮生',
      },
      PROFESSIONS,
      GANGS: app.GANGS,
      rules: {
        game_id: [
          {
            required: true,
            message: CHI_SIMS.enter_game_id,
            trigger: 'change'
          }
        ],
        game_name: [
          {
            required: true,
            message: CHI_SIMS.enter_game_name,
            trigger: 'change'
          }
        ],
      },
      error: '',
    }
  },

  computed: {
    ...DKPComputed,
    ...authComputed,
    isAdminLoggedIn() {
      return this.isAdmin || this.isLookedAdmin
    },
    filterAndSized() {
      if (!this.isAdminLoggedIn) {
        const currentUserDkp = this.DKPData.find(td =>
          td.game_id === this.currentUser.game_id.toString()
        )
        return {
          filtered: currentUserDkp ? [currentUserDkp] : [],
          sized: currentUserDkp ? [currentUserDkp] : [],
        }
      }

      const filtered = this.DKPData.filter(td => {
        const nameInclude = td.game_name.includes(this.search)
        const idInclude = td.game_id.toString().includes(this.search)
        return nameInclude || idInclude
      })

      let sized = []
      if (filtered.length) {
        const smallerThanSize = filtered.length < Math.floor(this.DKPData.length / this.pageSize)
        const pageNum = smallerThanSize ? 0 : (this.page - 1)
        sized = _.chunk(filtered, this.pageSize)[pageNum]
      }
      return  { filtered, sized }
    },

    currentDkp() {
      return this.DKPData.find(td => td.game_id === this.currentUser.game_id.toString())
    }
  },

  methods: {
    ...DKPMethods,
    ...mapActions('auth', [
      'downloadExcel',
    ]),

    onPageChange(page) {
      this.page = page
    },

    showAddNewDKP() {
      this.newDKPVisible = true
    },

    onAddNewDKP(formName) {
      this.$refs[formName]
        .validate((valid) => {
          if (valid) {
            this.loading = true
            this.newDKPForm.sum = this.newDKPForm.original
            return this.createNewDKP(this.newDKPForm)
              .then(() => {
                this.$message({
                  type: 'success',
                  message: '操作成功',
                  duration: 3000,
                  showClose: true,
                })
                this.newDKPForm = {
                  game_id: '',
                  game_name: '',
                  original: 0,
                  profession: '碎梦',
                  gang: '半梦半醒半浮生',
                }
                this.loading = false
                this.newDKPVisible = false
              })
              .catch((error) => {
                this.loading = false
                this.error = error.message
              })
            }
          return false
        })
    },

    onDownloadExcel() {
      this.downloadExcel().then(() => {
        this.$message({
          type: 'success',
          message: '下载成功'
        })
      }).catch((err) => {
        this.$message({
          type: 'error',
          message: err.message
        })
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.dkp-list {
  background-color: #fff;
  padding: 0 15px;
  .header {
    font-size: 15px;
    margin-top: 15px;
    padding: 0 15px;
    background-color: #F4F4F5;
    border-radius: 5px;
    .field {
      line-height: 50px;
    }
  }
  .search-wrapper {
    margin-bottom: 20px;
    .search {
      width: 300px;
    }
    .field-input {
      width: 300px;
    }
  }
}
</style>
