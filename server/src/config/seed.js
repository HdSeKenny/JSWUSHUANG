/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict'

import Good from '../api/good/good.model'
import Order from '../api/order/order.model'
import User from '../api/user/user.model'
import DKP from '../api/dkp/dkp.model'
import History from '../api/history/history.model'
import Member from '../api/user/member.model'
import config from './environment/'

const defaultUsers = [
  {
    provider: 'local',
    role: 'user',
    name: 'Test User 1',
    email: 'test@example.com',
    password: 'test..',
    game_name: '测试用户_1',
    game_id: '187632523',
    profession: '碎梦',
    gang: '未梦幽',
    avatar: '/uploads/images/users/user.png',
    is_default_account: true,
  },
  {
    provider: 'local',
    role: 'user',
    name: 'Test User 2',
    email: 'test2@example.com',
    password: 'test..',
    game_name: '测试用户_2',
    game_id: '187632524',
    profession: '血河',
    gang: '未梦幽',
    avatar: '/uploads/images/users/user.png',
    is_default_account: true,
  },
  {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'admin@wmy',
    password: 'wmy2021',
    game_name: '管理员',
    game_id: '187632534',
    profession: '玄机',
    gang: '未梦幽',
    avatar: '/uploads/images/users/user.png',
    is_default_account: true,
  },
  {
    provider: 'local',
    role: 'looked_admin',
    name: 'Looked Admin',
    email: 'looked@wmy',
    password: 'wmy2021',
    game_name: '普通管理员',
    game_id: '187632535',
    profession: '玄机',
    gang: '未梦幽',
    avatar: '/uploads/images/users/user.png',
    is_default_account: true,
  },
  {
    provider: 'local',
    role: 'root',
    name: 'Super Admin',
    email: 'super_admin@wmy',
    password: 'wmy2021',
    game_name: '超级管理员',
    game_id: '187632536',
    profession: '玄机',
    gang: '未梦幽',
    avatar: '/uploads/images/users/user.png',
    is_default_account: true,
  },
]

const defaultDKPs = [
  {
    game_id: '187632523',
    game_name: '测试用户_1',
    profession: '碎梦',
    gang: '未梦幽',
    league_friday: 10,
    league_saturday: 10,
    gemstone: 10,
    field: 10,
    territorial_stronghold: 10,
    tianjiang: 10,
    original: 10,
    sum: 70,
    updated: new Date(),
  },
  {
    game_id: '187632524',
    game_name: '测试用户_2',
    profession: '血河',
    gang: '未梦幽',
    league_friday: 10,
    league_saturday: 10,
    gemstone: 10,
    field: 10,
    territorial_stronghold: 10,
    tianjiang: 10,
    original: 10,
    sum: 70,
    updated: new Date(),
  },
  {
    game_id: '187632534',
    game_name: '管理员',
    profession: '玄机',
    gang: '未梦幽',
    league_friday: 1000,
    league_saturday: 1000,
    gemstone: 1000,
    field: 1000,
    territorial_stronghold: 1000,
    tianjiang: 1000,
    original: 1000,
    sum: 7000,
    updated: new Date(),
  },
  {
    game_id: '187632535',
    game_name: '暮雪管理员',
    profession: '玄机',
    gang: '未梦幽',
    league_friday: 1000,
    league_saturday: 1000,
    gemstone: 1000,
    field: 1000,
    territorial_stronghold: 1000,
    tianjiang: 1000,
    original: 1000,
    sum: 7000,
    updated: new Date(),
  },
  {
    game_id: '187632536',
    game_name: '超级管理员',
    profession: '玄机',
    gang: '未梦幽',
    league_friday: 1000,
    league_saturday: 1000,
    gemstone: 1000,
    field: 1000,
    territorial_stronghold: 1000,
    tianjiang: 1000,
    original: 1000,
    sum: 7000,
    updated: new Date(),
  },
]

export default () =>
  new Promise((resolve, reject) => {
    if (!JSON.parse(config.seedDB)) {
      resolve()
      return
    } else {
      const userPromise = () =>
        User.find({})
          .deleteMany()
          .then(() =>
            User.create(...defaultUsers)
              .then((users) => users)
              .catch((err) => Promise.reject(err))
          )

      const GoodPromise = () =>
        Good.find({})
          .deleteMany()
          .then(() => console.log('===> finished populating goods'))
          .catch((err) => console.log('error populating goods', err))

      const OrderPromise = () =>
        Order.find({})
          .deleteMany()
          .then(() => console.log('===> finished populating orders'))
          .catch((err) => console.log('error populating orders', err))

      const MemberPromise = () =>
        Member.find({})
          .deleteMany()
          .then(() => console.log('===> finished populating members'))
          .catch((err) => console.log('error populating members', err))

      const DKKPromise = () =>
        DKP.find({})
          .deleteMany()
          .then(() =>
            DKP.create(...defaultDKPs).then((dkps) => {
              console.log('===> finished populating dkps')
              return dkps
            })
          )
          .catch((err) => Promise.reject(err))

      const HistoryPromise = () =>
        History.find({})
          .deleteMany()
          .then(() => console.log('===> finished populating history'))
          .catch((err) => console.log('error populating history', err))

      Promise.all([
        userPromise(),
        DKKPromise(),
        GoodPromise(),
        OrderPromise(),
        MemberPromise(),
        HistoryPromise(),
      ])
        .then(async (data) => {
          const users = data[0]
          const dkps = data[1]
          for (let i = 0; i < users.length; i++) {
            const dkp = dkps.find((dd) => dd._doc.game_id === users[i].game_id)
            await User.findOneAndUpdate({ _id: users[i]._id }, { dkp_score: dkp._doc._id })
          }

          resolve()
        })
        .catch((err) => reject(err))
    }
  })
