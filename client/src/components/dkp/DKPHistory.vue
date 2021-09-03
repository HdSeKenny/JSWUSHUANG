<template>
  <section class="histories-wrapper">
    <template v-if="dkp && dkp.histories && dkp.histories.length">
      <div v-for="(h, i) in dkp.histories" :key="i" class="history-block">
        <div class="date mr5">{{ formatDate(h.created) }}</div>
        <div class="content">
          <p v-for="(f, j) in h.fields" :key="`${i}_${j}`" class="mt0">
            <span type="text" class="p0 mr10">{{ f.text }}</span>
            <template v-if="f.symbol">
              <span
                class="changed-value"
                :class="{
                  success: f.symbol === '+',
                  danger: f.symbol === '-',
                }"
              >
                {{ f.symbol }} {{ f.changed_value }}
              </span>
              <span class="ml10"
                >剩余: <span class="value-blue">{{ getSumAfterChange(h) }}</span></span
              >
            </template>
            <template v-else>
              <span class="old-value danger">{{ f.oldValue }}</span>
              <span class="ml5 mr5">改成</span>
              <span class="new-value success">{{ f.newValue }}</span>
            </template>
          </p>
        </div>
      </div>
    </template>
    <div class="mt5" v-else> <i class="el-icon-warning-outline mr5 ml5"></i> 没有记录 </div>
  </section>
</template>

<script>
export default {
  name: 'DKPHistory',
  props: {
    dkp: Object,
  },
  methods: {
    formatDate(date) {
      return this.$formatDate(date, 'yyyy, MM/dd hh:mm')
    },
    getSumAfterChange(h) {
      if (h.sum_after_changed) return h.sum_after_changed
      return '数据丢失'

      // const {
      //   fields: [field],
      //   sum_after_changed,
      // } = h
      // const { newValue, oldValue, symbol, changed_value, key } = field

      // let new_sum_after_changed = 0
    },

    calculateDKPSum(row) {
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
  },
  computed: {
    // histories() {
    //   const histories = []
    //   const _sum = calculateDKPSum(this.dkp)
    //   let previous, current
    //   this.dkp.histories.reverse().forEach((h, i) => {
    //     const {
    //       fields: [field],
    //       sum_after_changed,
    //     } = h
    //     let _sum_changed = null
    //     if (i === 0) {
    //       _sum_changed = sum_after_changed || _sum
    //       previous = _sum
    //       current = _sum
    //     } else if (!sum_after_changed) {
    //     }
    //   })
    // },
  },
}
</script>

<style lang="scss">
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
