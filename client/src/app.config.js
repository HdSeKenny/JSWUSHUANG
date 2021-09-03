const app = {
  name: '江湖',
  url: 'www.jianghu.club',
  gangName: 'DKP系统',
}

const GANGS = ['江湖何处来', '江湖如一梦', '江湖与君同', '江湖意相逢', '江湖知我意', '江湖来故人']

const CHI_SIMS = {
  game_id: '游戏ID',
  game_name: '游戏名称',
  profession: '职业',
  call_person: '拉人',
  field: '野外',
  force_and_declaration: '宣/势力战',
  gemstone: '宝石',
  league: '联赛',
  open_red: '开红',
  other: '其他',
  sum: '总和',
  territorial_stronghold: '领地据点',
  created_at: '创建时间',
  current_price: '当前价格',
  desc: '备注',
  end_at: '结束时间',
  good_name: '商品名称',
  min_price: '起拍价格',
  once_price: '一口价格',
  au_type: '竞拍方式',
  range_price: '价格幅度',
  current_payer: '当前竞拍者',

  password: '密码',
  confirm_password: '确认密码',
  enter_password: '请输入密码',
  enter_confirm_password: '请确认密码',
  short_password: '兄弟, 你的密码短了',
  enter_game_id: '请输入游戏id',
  enter_game_name: '请输入游戏名',
  two_different_password: '大哥, 两次密码不一样',

  remember_me: '记住我',
  forgotten_password: '忘记密码?',
  create_account: '申请账户',
  login: '登录',
  signup: '注册',
  application_created_at: '申请时间',

  enter_dkp_value: '输入DKP',
  enter_accepter: '选择交易的人',

  dkp_payer: '转移人',
  dkp_receiver: '接收人',
}

const DKP_HEADERS = {
  game_id: {
    text: '游戏ID',
    type: 'String',
  },
  game_name: {
    text: '游戏名称',
    type: 'String',
  },
  profession: {
    text: '职业',
    type: 'String',
  },
  // fighting_score: {
  //   text: '总战力',
  //   type: 'Number',
  // },
  gang: {
    text: '帮会',
    type: 'String',
  },
  original: {
    text: '原始分',
    type: 'Number',
  },
  sum: {
    text: '总和',
    type: 'Number',
  },
  league_friday: {
    text: '周五联赛',
    type: 'Number',
  },
  league_saturday: {
    text: '周六联赛',
    type: 'Number',
  },
  territorial_stronghold: {
    text: '周日据点',
    type: 'Number',
  },
  field: {
    text: '野外打架',
    type: 'Number',
  },
  payment: {
    text: '消费',
    type: 'Number',
  },
}

const STATUS_TEXTS = {
  0: '等待竞拍',
  1: '正在竞拍',
  2: '竞拍结束',
}

const PROFESSIONS = [
  { label: '碎梦', value: '碎梦' },
  { label: '血河', value: '血河' },
  { label: '铁衣', value: '铁衣' },
  { label: '九灵', value: '九灵' },
  { label: '素问', value: '素问' },
  { label: '龙吟', value: '龙吟' },
  { label: '神相', value: '神相' },
  { label: '玄机', value: '玄机' },
  { label: '鸿音', value: '鸿音' },
]

const USER_TABLE_HEADERS = [
  { field: 'game_id', title: '游戏ID' },
  { field: 'game_name', title: '游戏名称' },
  { field: 'gang', title: '帮会' },
  { field: 'name', title: '名字' },
  { field: 'profession', title: '职业' },
  { field: 'role', title: '权限' },
]

const GAME_NAME_TITLES = ['游戏ID', '游戏名称', '名称', '玩家']

module.exports = {
  GANGS,
  app,
  STATUS_TEXTS,
  CHI_SIMS,
  DKP_HEADERS,
  PROFESSIONS,
  USER_TABLE_HEADERS,
  GAME_NAME_TITLES,
}
