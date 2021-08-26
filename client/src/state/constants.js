export const CHINESE_REGEX = /[^[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]]/g

export const MESSAGES = {
  AUTH_FAILED: '请先登录',
}

export const ACTIONS = {
  GET_USERS_SUCCESS: 'GET_USERS_SUCCESS',
  DEAL_DKP_SUCCESS: 'DEAL_DKP_SUCCESS',
  GET_CURRENT_USER_SUCCESS: 'GET_CURRENT_USER_SUCCESS',
  GET_TOKEN_SUCCESS: 'GET_TOKEN_SUCCESS',
  CHANGE_USER_INFO_SUCCESS: 'CHANGE_USER_INFO_SUCCESS',

  GET_MEMBERS_SUCCESS: 'GET_MEMBERS_SUCCESS',
  DELETE_MEMBERS_SUCCESS: 'DELETE_MEMBERS_SUCCESS',

  GET_DKP_DATA_SUCCESS: 'GET_DKP_DATA_SUCCESS',
  IMPORT_DKP_DATA_SUCCESS: 'IMPORT_DKP_DATA_SUCCESS',
  UPDATE_DKP_DATA_SUCCESS: 'UPDATE_DKP_DATA_SUCCESS',
  UPDATE_MANY_DKP_SUCCESS: 'UPDATE_MANY_DKP_SUCCESS',
  CLEAR_DKP_DATA_SUCCESS: 'CLEAR_DKP_DATA_SUCCESS',
  DELETE_DKP_SUCCESS: 'DELETE_DKP_SUCCESS',
  ADD_NEW_DKP_SUCCESS: 'ADD_NEW_DKP_SUCCESS',

  GET_GOODS_SUCCESS: 'GET_GOODS_SUCCESS',
  UPDATE_GOOD_STATUS_SUCCESS: 'UPDATE_GOOD_STATUS_SUCCESS',

  // backup
  GET_BACKUP_LIST_SUCCESS: 'GET_BACKUP_LIST_SUCCESS',
  UPDATE_BACKUP_LIST_SUCCESS: 'UPDATE_BACKUP_LIST_SUCCESS',

  // goods
  ADD_GOOD_SUCCESS: 'ADD_GOOD_SUCCESS',
  DELETE_GOOD_SUCCESS: 'DELETE_GOOD_SUCCESS',
  UPDATE_GOOD_TAB_SUCCESS: 'UPDATE_GOOD_TAB_SUCCESS',

  // order
  GET_ORDERS_SUCCESS: 'GET_ORDERS_SUCCESS',
  DELETE_ORDER_SUCCESS: 'DELETE_ORDER_SUCCESS',

  // admin
  GET_ANNOUNCEMENT_SUCCESS: 'GET_ANNOUNCEMENT_SUCCESS',
  UPDATE_ANNOUNCEMENT_SUCCESS: 'UPDATE_ANNOUNCEMENT_SUCCESS',
  UPDATE_SETTINGS_TAB_SUCCESS: 'UPDATE_SETTINGS_TAB_SUCCESS',
  RESET_DKP_INFO_SUCCESS: 'RESET_DKP_INFO_SUCCESS',

  UPDATE_AVATAR_SUCCESS: 'UPDATE_AVATAR_SUCCESS',
}

export const UNREADABLE_WORDS = {
  雪穗: '雪穂',
  卷耳兔: '巻耳兔',
  笙零: '笙雩',
  需米觉得不妥: '糯米觉得不妥',
  北: '北笙',
  人间客了: '人间客',
  樱花少: '樱花',
  难的大姐: '难哄的大姐',
  膜: '腼腆',
  到霉蛋陈平安: '倒霉蛋陈平安',
  唐飞琛: '唐琛',
  唐飞炎: '唐炎',
  唐飞伟: '唐伟',
  唐飞剑: '唐剑',
  唐飞男: '唐男',
  唐飞桥: '唐桥',
  唐飞北: '唐北',
  唐飞强: '唐强',
  唐飞鑫: '唐鑫',
  蓝池: '蓝沁',

  如果儿: '如果ル',
}

export const UNREADABLE_CHARACTER = ['丶', '乀', '丨', 'ち', 'ゃ', 'ん', '人', 'ル']

export const FILTERED_CHARACTERS = [
  '一',
  '二',
  '三',
  '四',
  '五',
  '六',
  '七',
  '八',
  '九',
  '连云寨',
  '连云',
  '云寨',
  '连云赛',
  '连云寨(一',
  '医庐(',
  '医庐(一',
  '医庐(一)',
  '69',
]
export const INVALID_CHARACTERS = ['69', '连云', '云寨', '连云寨', '医庐']

export const MESSAGE_TYPES = {
  SUCCESS: {
    type: 'success',
    message: '操作成功',
  },
  ERROR: {
    type: 'error',
    message: '操作失败',
  },
}
