import Vue from 'vue'
import 'xe-utils'
import {
  VXETable,
  Table,
  Column,
  Header,
  // Footer,
  // Filter,
  // Edit,
  // Menu,
  // Export,
  // Keyboard,
  // Validator,

  // Grid,
  // Toolbar,
  // Pager,
  // Checkbox,
  // Radio,
  // Input,
  // Button,
  // Modal,
  // Tooltip,
  // Form,
  // Select,
  // Switch,
  // List,
  // Icon
} from 'vxe-table'
import 'vxe-table/lib/style.css'

// 按需加载的方式默认是不带国际化的，需要自行导入
// VXETable.setup({
//   i18n: (key, args) => i18n.t(key, args)
// })

// 先安装依赖模块
// Vue.use(Icon)
Vue.use(VXETable)
Vue.use(Column)
Vue.use(Header)
// Vue.use(Footer)
// Vue.use(Filter)
// Vue.use(Edit)
// Vue.use(Menu)
// Vue.use(Export)
// Vue.use(Keyboard)
// Vue.use(Validator)

// Vue.use(Tooltip)
// Vue.use(Grid)
// Vue.use(Toolbar)
// Vue.use(Pager)
// Vue.use(Form)
// Vue.use(Checkbox)
// Vue.use(Radio)
// Vue.use(Switch)
// Vue.use(Input)
// Vue.use(Select)
// Vue.use(Button)
// Vue.use(Modal)
// Vue.use(List)

// 再安装核心库
Vue.use(Table)

// 给 vue 实例挂载内部对象，例如：
Vue.prototype.$XModal = VXETable.modal
Vue.prototype.$XPrint = VXETable.print
Vue.prototype.$XSaveFile = VXETable.saveFile
Vue.prototype.$XReadFile = VXETable.readFile

// 给 vue 实例挂载内部对象，例如：
// Vue.prototype.$XModal = VXETable.modal
// Vue.prototype.$XPrint = VXETable.print
// Vue.prototype.$XSaveFile = VXETable.saveFile
// Vue.prototype.$XReadFile = VXETable.readFile

// VXETable.setup({
// size: null, // 全局尺寸
// zIndex: 999, // 全局 zIndex 起始值，如果项目的的 z-index 样式值过大时就需要跟随设置更大，避免被遮挡
// version: 0, // 版本号，对于某些带数据缓存的功能有用到，上升版本号可以用于重置数据
// table: {
//   showHeader: true,
//   keepSource: false,
//   delayHover: 250,
//   showOverflow: null,
//   showHeaderOverflow: null,
//   showFooterOverflow: null,
//   size: null,
//   resizable: false,
//   autoResize: false,
//   stripe: false,
//   border: false,
//   round: false,
//   emptyText: '暂无数据',
//   radioConfig: {
//     trigger: 'default'
//   },
//   checkboxConfig: {
//     strict: false,
//     highlight: false,
//     range: false,
//     trigger: 'default'
//   },
//   sortConfig: {
//     remote: false,
//     trigger: 'default',
//     orders: ['asc', 'desc', null],
//     sortMethod: null
//   },
//   filterConfig: {
//     remote: false,
//     filterMethod: null
//   },
//   expandConfig: {
//     trigger: 'default',
//     showIcon: true
//   },
//   treeConfig: {
//     children: 'children',
//     hasChild: 'hasChild',
//     indent: 20,
//     showIcon: true
//   },
//   tooltipConfig: {
//     theme: 'dark',
//     enterable: false
//   },
//   menuConfig: {
//     visibleMethod () {}
//   },
//   rowId: '_XID', // 行数据的唯一主键字段名
//   editConfig: {
//     mode: 'cell',
//     showAsterisk: true
//   },
//   importConfig: {
//     modes: ['insert', 'covering']
//   },
//   exportConfig: {
//     modes: ['current', 'selected']
//   },
//   customConfig: {
//    storage: false
//   },
//   scrollX: {
//     gt: 60
//   },
//   scrollY: {
//     gt: 100
//   }
// },
// grid: {
//   size: null,
//   zoomConfig: {
//     escRestore: true
//   },
//   pagerConfig: {
//     perfect: false
//   },
//   toolbarConfig: {
//     perfect: false
//   },
//   proxyConfig: {
//     autoLoad: true,
//     message: true,
//     props: {
//       list: null, // 用于列表，读取响应数据
//       result: 'result', // 用于分页，读取响应数据
//       total: 'page.total' // 用于分页，读取总条数
//     }
//     beforeItem: null,
//     beforeColumn: null,
//     beforeQuery: null,
//     afterQuery: null,
//     beforeDelete: null,
//     afterDelete: null,
//     beforeSave: null,
//     afterSave: null
//   }
// },
// pager: {
//   size: null,
//   autoHidden: false,
//   perfect: true,
//   pageSize: 10,
//   pagerCount: 7,
//   pageSizes: [10, 15, 20, 50, 100],
//   layouts: ['PrevJump', 'PrevPage', 'Jump', 'PageCount', 'NextPage', 'NextJump', 'Sizes', 'Total']
// },
// form: {
//   preventSubmit: false
//   validConfig: {
//     autoPos: true
//   },
//   size: null,
//   colon: false,
//   titleAsterisk: true
// },
// input: {
//   size: null,
//   transfer: false
//   parseFormat: 'yyyy-MM-dd HH:mm:ss.SSS',
//   labelFormat: '',
//   valueFormat: '',
//   startDay: 1,
//   digits: 2,
//   controls: true
// },
// textarea: {
//   size: null
//   autosize: {
//     minRows: 1,
//     maxRows: 10
//   }
// },
// select: {
//   size: null,
//   transfer: false,
//   multiCharOverflow: 8
// },
// toolbar: {
//   size: null,
//   import: {
//     mode: 'covering'
//   },
//   export: {
//     types: ['csv', 'html', 'xml', 'txt']
//   },
//   custom: {
//     isFooter: true
//   },
//   buttons: [],
//   tools: []
// },
// button: {
//   size: null,
//   transfer: false
// },
// radio: {
//   size: null
// },
// checkbox: {
//   size: null
// },
// switch: {
//   size: null
// },
// modal: {
//   // size: null,
//   minWidth: 340,
//   minHeight: 200,
//   lockView: true,
//   mask: true,
//   duration: 3000,
//   marginSize: 0,
//   dblclickZoom: true,
//   showTitleOverflow: true
//   storage: false
// },
// list: {
//   scrollY: {
//     gt: 100
//   }
// }
// })
