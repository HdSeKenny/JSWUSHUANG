<script>
import { mapState } from 'vuex'
import appConfig from '@src/app.config'
import GoodAuctionHandle from '@components/good/GoodAuctionHandle.vue'
import loginBackgroundImage from '@assets/images/login-bg.jpeg'

export default {
  page: {
    // All subcomponent titles will be injected into this template.
    titleTemplate(title) {
      title = typeof title === 'function' ? title(this.$store) : title
      return title ? `${title} | ${appConfig.title}` : appConfig.title
    },
  },
  sockets: {
    auction_payer_message(val) {
      if (this.currentUser && val.payer_id._id === this.currentUser._id) {
        this.$notify({
          title: '提示',
          message: '你成功竞拍了一件物品',
          type: 'success',
          duration: 3000,
        })
      }
    },
  },
  computed: {
    ...mapState('auth', {
      currentUser: (state) => state.currentUser,
    }),
  },
  components: {
    GoodAuctionHandle,
  },
  mounted() {
    const _bg = document.createElement('img')
    const _app = document.getElementById('app')
    _bg.src = loginBackgroundImage
    _bg.style.visibility = 'hidden'
    _bg.onload = () => {
      _app.style.backgroundImage = `url(${_bg.src})`
      _bg.remove()
    }
  },
}
</script>

<template>
  <div id="app">
    <!--
    Even when routes use the same component, treat them
    as distinct and create the component again.
    -->
    <RouterView :key="$route.fullPath"></RouterView>
    <GoodAuctionHandle />
  </div>
</template>

<!-- This should generally be the only global CSS in the app. -->
<style lang="scss">
// Allow element/type selectors, because this is global CSS.
// stylelint-disable selector-max-type, selector-class-pattern

// Normalize default styles across browsers,
// https://necolas.github.io/normalize.css/
@import '~normalize.css/normalize.css';
// Style loading bar between pages.
// https://github.com/rstacruz/nprogress
@import '~nprogress/nprogress.css';

// Design variables and utilities from src/design.
@import '@design';

*,
*::before,
*::after {
  box-sizing: border-box;
}
html,
body {
  height: 100%;
  margin: 0px;
}

body {
  font-family: $system-default-font-family;
  font-weight: $content-font-weight;
  background: $color-body-bg;
}

#app {
  @extend %typography-small;
  height: 100%;
  overflow: auto;
  background-repeat: no-repeat;
  background-size: cover;
}
.layout {
  &.el-loading-parent--relative {
    overflow: hidden;
  }
}

a,
a:visited {
  text-decoration: none;
}

h1 {
  @extend %typography-xxlarge;
}

h2 {
  @extend %typography-xlarge;
}

h3 {
  @extend %typography-large;
}

h4 {
  @extend %typography-medium;
}

h5,
h6 {
  @extend %typography-small;
}

#nprogress .bar {
  background: $color-link-text;
}

.page-content {
  padding: 0px 60px;
}

.container {
  padding: 15px 25px;
}

.theme-text-color {
  color: $theme-color !important;
}

.bold {
  font-weight: bold !important;
}

.tr {
  text-align: right;
}

.fr {
  float: right !important;
}

.inb {
  display: inline-block;
}

.disb {
  display: block;
}

.tac {
  text-align: center !important;
}

.tar {
  text-align: right !important;
}

.tal {
  text-align: left !important;
}

.pointer {
  cursor: pointer !important;
}

.p0 {
  padding: 0 !important;
}
.m0 {
  margin: 0 !important;
}
.mt0 {
  margin-top: 0px !important;
}
.mt5 {
  margin-top: 5px !important;
}
.mt10 {
  margin-top: 10px !important;
}
.mt15 {
  margin-top: 15px !important;
}

.ml0 {
  margin-left: 0px !important;
}
.ml5 {
  margin-left: 5px !important;
}
.ml10 {
  margin-left: 10px !important;
}
.ml15 {
  margin-left: 15px !important;
}

.mr0 {
  margin-right: 0px !important;
}
.mr5 {
  margin-right: 5px !important;
}
.mr10 {
  margin-right: 10px !important;
}
.mr15 {
  margin-right: 15px !important;
}

.mb0 {
  margin-bottom: 0px !important;
}
.mb5 {
  margin-bottom: 5px !important;
}
.mb10 {
  margin-bottom: 10px !important;
}
.mb15 {
  margin-bottom: 15px !important;
}

.normal-text-size {
  font-size: 15px !important;
}

.int-medium {
  width: 400px;
}

.error {
  color: $red-color !important;
}

.price {
  color: $red-color;
  font-size: 16px !important;
  font-weight: 700 !important;
  margin-left: 5px !important;
}

.theme-color {
  color: $theme-color;
}

.time {
  color: $theme-color;
  font-size: 14px;
  font-weight: 600;
}

.date {
  color: gray;
  font-size: 13px;
}

.value-blue {
  color: $value-blue;
  font-size: 15px;
  font-weight: 600;
}

.success {
  color: $success-color;
}

.countdown-time {
  color: $red-color;
  font-size: 20px;
  font-weight: 700;
  font-style: italic;
}

// Element ui style overwrite ================= begin
#nprogress {
  // width: 100%;
  // height: 100%;
  // position: relative;
  // z-index: 3;
  // .bar {
  //   background: $theme-color;
  // }
  // .peg {
  //   box-shadow: 0 0 10px $theme-color, 0 0 5px $theme-color;
  // }
  // .spinner-icon {
  //   top: 50%;
  //   left: 50%;
  //   width: 50px;
  //   height: 50px;
  //   border: solid 3px transparent;
  //   border-top-color: $theme-color;
  //   border-left-color: $theme-color;
  //   position: absolute;
  // }
  // .spinner {
  //   top: 2px;
  //   left: 0;
  //   height: 100%;
  //   width: 100%;
  //   background: rgb(0, 0, 0, 0.7);
  //   z-index: 9999;
  //   position: fixed;
  // }
}

.el-loading-mask {
  .el-loading-spinner {
    .circular {
      width: 60px;
      height: 60px;
    }
    .path {
      stroke-width: 3px;
    }
  }
}

.el-input__inner {
  font-size: 15px;
  font-weight: 500;
  border: 2px solid $border-color;
}

.el-input__icon {
  font-weight: 600;
}
.el-page-header {
  font-size: 18px;
  .el-page-header__left {
    .el-page-header__title {
      font-size: 18px;
    }
    &:after {
      display: none;
    }
  }
}
.el-popover.el-popper {
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
}
// Element ui style overwrite ================= end
.no-data {
  margin: 200px 0;
  text-align: center;
  * {
    color: $theme-gray-color;
  }
}

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

input[type='number'] {
  -moz-appearance: textfield;
}

.el-table__fixed::before,
.el-table__fixed-right::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background-color: unset;
  z-index: 4;
}

.el-tabs--border-card,
.el-tabs--top {
  .el-tabs__content {
    height: 700px;
    padding: 20px 25px !important;
  }
}

.el-tabs__content {
  padding: 20px;
  background-color: $transparent-half-color;
}

.user-tabs,
.auction {
  .user.el-tabs--top .el-tabs__content {
    padding: 10px 15px;
  }
}

.login-page {
  .el-input,
  .el-input--prefix {
    .el-input__inner {
      border: 2px solid #fff;
      color: $white-color;
      &::placeholder {
        color: $white-color;
      }
    }
    .el-input__icon {
      color: $white-color;
    }
  }
}

.el-input,
.el-input--prefix {
  .el-input__inner {
    background: $transparent-six-color;
    border: 2px solid $border-color;
  }
}

.el-tabs__item {
  &.is-top {
    font-weight: bold;
    outline: none;
  }
}

.vxe-table--body-wrapper {
  &.body--wrapper {
    background: transparent;
  }
}

.vxe-table--render-default.border--default .vxe-table--header-wrapper,
.vxe-table--render-default.border--full .vxe-table--header-wrapper,
.vxe-table--render-default.border--outer .vxe-table--header-wrapper {
  background-color: $transparent-six-color;
}
</style>
