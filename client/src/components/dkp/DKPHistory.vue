<template>
  <section class="histories-wrapper">
    <div v-if="histories && histories.length">
      <div v-for="(h, i) in histories" :key="i" class="history-block">
        <div class="date mr5">{{formatDate(h.created)}}</div>
        <div class="content">
          <p v-for="(f, j) in h.fields" :key="`${i}_${j}`" class="mt0">
            <span type="text" class="p0 mr10">{{f.text}}</span>
            <template v-if="f.symbol">
              <span class="changed-value" :class="{
                'success': f.symbol === '+',
                'danger': f.symbol === '-',
              }">
                {{f.symbol}} {{f.changed_value}}
              </span>
              <span class="ml10">剩余: <span class="value-blue">{{h.sum_after_changed}}</span></span>
            </template>
            <template v-else>
              <span class="old-value danger">{{f.oldValue}}</span>
              <span class="ml5 mr5">改成</span>
              <span class="new-value success">{{f.newValue}}</span>
            </template>
          </p>
        </div>
      </div>
    </div>
    <div class="mt5" v-else>
      <i class="el-icon-warning-outline mr5 ml5"></i> 没有记录
    </div>
  </section>
</template>

<script>
export default {
  name: 'DKPHistory',
  props: {
    histories: Array,
  },
  methods: {
    formatDate(date) {
      return this.$formatDate(date, 'yyyy, MM/dd hh:mm')
    }
  },
}
</script>

<style lang="scss">
.histories-wrapper {
  height: 180px;
  overflow: auto;
}
.history-block {
  .date {
    font-size: 13px;
    width: 120px;
    display: inline-block;
  }
  .content {
    width: calc(100% -140px);
    display: inline-block;
    vertical-align: top;
    .value-blue {
      font-size: 15px;
    }
    .changed-value {
      font-size: 15px;
      font-weight: 600;
      &.success {
        color: $success-color;
      }
      &.danger {
        color: $danger-color;
      }
    }
    .old-value,
    .new-value {
      color: #303133;
      font-size: 15px;
      font-weight: 500;
      &.success {
        color: $success-color;
      }
      &.danger {
        color: $danger-color;
      }
    }
  }
}
</style>
