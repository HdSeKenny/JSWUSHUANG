<template>
  <section class="page-content good-add" v-loading="loading">
    <el-alert
      :title="notification"
      :description="description"
      type="info"
      class="notification mt15 mb15"
      show-icon
    ></el-alert>
    <div class="good">
      <div class="slim-wrapper inb">
        <SlimWrapper :imageDidLoad="imageDidLoad" />
      </div>
      <div class="info inb">
        <el-form
          :model="goodForm"
          :rules="rules"
          ref="goodForm"
          label-width="100px"
          class="good-form"
        >
          <el-form-item label="商品名称" prop="goodName">
            <el-input v-model="goodForm.goodName"></el-input>
          </el-form-item>
          <el-form-item label="最低价格" prop="minPrice">
            <el-input v-model.number="goodForm.minPrice"></el-input>
          </el-form-item>
          <el-form-item label="价格增幅" prop="rangePrice">
            <el-input v-model.number="goodForm.rangePrice"></el-input>
          </el-form-item>
          <el-form-item label="竞拍时间">
            <p class="inb mt0 mb0 mr15">
              <el-input v-model.number="goodForm.rangeHours" class="half"></el-input>
              小时
            </p>
            <p class="inb mt0 mb0">
              <el-input v-model.number="goodForm.rangeMinutes" class="half"></el-input>
              分钟
            </p>
          </el-form-item>
          <el-form-item label="竞拍方式" prop="auType">
            <el-select v-model="goodForm.auType" class="field-input half">
              <el-option v-for="p in auTypes" :key="p" :label="p" :value="p"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="warning" @click="submitForm('goodForm')">立即创建</el-button>
            <el-button @click="resetForm('goodForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </section>
</template>

<script>
import SlimWrapper from '@components/slim/slim-wrapper.vue'
import { goodMethods } from '@state/helpers'

export default {
  components: { SlimWrapper },
  data() {
    return {
      loading: false,
      notification: '编辑你要上架的商品',
      description: '每个物品要上传一张图片, 图片要大一点，清晰一点',
      goodForm: {
        goodName: '',
        desc: '',
        createdAt: null,
        endAt: null,
        minPrice: null,
        rangeHours: 0,
        rangeMinutes: 1,
        auType: 'DKP',
      },
      auTypes: ['DKP', '铜钱'],
      rules: {
        goodName: [{ required: true, message: '请输入商品名称', trigger: 'change' }],
        minPrice: [
          { required: true, message: '请填写最低价格', trigger: 'change' },
          { type: 'number', message: '最低价格必须为数字值' },
        ],
        rangeHours: [{ required: true, message: '请填写竞拍时间', trigger: 'change' }],
        rangeMinutes: [{ required: true, message: '请填写竞拍时间', trigger: 'change' }],
        rangePrice: [{ required: true, message: '请填写价格增幅', trigger: 'change' }],
        auType: [{ required: true, message: '请选择竞拍方式', trigger: 'change' }],
      },
    }
  },
  methods: {
    ...goodMethods,

    goBack() {
      this.$router.push({ name: 'auction' })
    },

    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let customError = ''
          if (!this.goodFile) {
            customError = '请上传一张图片'
          }

          const goodInfo = this.$refs[formName].model
          goodInfo.created_at = new Date()
          if (goodInfo.rangeHours > 23 && goodInfo.rangeMinutes !== 0) {
            customError = '不能超过24个小时'
          }

          if (goodInfo.rangeMinutes > 59) {
            customError = '分钟不能大于或者等于60'
          }

          if (goodInfo.rangeHours === 0 && goodInfo.rangeMinutes === 0) {
            customError = '时间不能为0'
          }

          if (customError) {
            return this.$notify({
              title: '提示',
              message: customError,
              type: 'error',
              duration: 3000,
            })
          }

          const fd = new FormData()
          fd.append('good-file', this.goodFile)
          fd.append('good-info', JSON.stringify(goodInfo))

          this.loading = true
          this.addGood(fd).then((newGood) => {
            // this.$socket.emit('add_new_good', newGood)
            this.loading = false
            this.$notify({
              title: '提示',
              message: '上架成功',
              type: 'success',
              duration: 3000,
            })
          })
        } else {
          return false
        }
      })
    },
    imageDidLoad(file, image) {
      this.goodFile = file
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
  },
}
</script>

<style lang="scss" scoped>
.good-add {
  background-color: #fff;
  padding: 0px 15px;
  .good {
    margin-top: 25px;
  }
  .slim-wrapper {
    width: 290px;
    vertical-align: top;
  }
  .info {
    margin-left: 20px;
    width: calc(100% - 340px);
    .good-form {
      width: 450px;
      .half {
        width: 135px;
      }
    }
  }
  .line {
    text-align: center;
  }
}
</style>
