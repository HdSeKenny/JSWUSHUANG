<template>
  <section class="DataRecover" v-loading="loading">
    <div class="mb15 backup-list" v-if="backupedList.length">
      <h5 class="mt0 mb10">已备份列表</h5>
      <el-tag class="single mb5" v-for="(item, idx) in backupedList" :key="idx"
        @click="onRecoverData(item)"
      >{{item}}</el-tag>
    </div>
    <h4 v-else>
      <font-awesome-icon icon="exclamation-circle" class="icon mr10"></font-awesome-icon>
      没有备份的数据
    </h4>
  </section>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'DataRecover',
  data() {
    return {
      backupFile: '',
      loading: false,
    }
  },
  methods: {
    ...mapActions('auth', ['recoverBackupData']),
    onRecoverData(name) {
      this.$confirm('此操作会将备份的数据覆盖现在的数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
      }).then(() => {
        this.loading = true
        this.recoverBackupData({ name })
          .then(() => {
            this.loading = false
            this.$message({
              type: 'success',
              message: '恢复成功',
            })
          })
          .catch((err) => {
            this.loading = false
            this.$message({
              type: 'error',
              message: err.message,
            })
          })
      })
    },
  },

  computed: {
    ...mapState('auth', {
      backupedList: (state) => state.backupedList,
    }),
  },
}
</script>

<style lang="scss" scoped>
.backup-list {
  .single {
    width: 300px;
    display: block;
    &:hover {
      cursor: pointer;
    }
  }
}
</style>

