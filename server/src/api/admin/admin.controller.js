import fs from 'fs'
import Good from '../../api/good/good.model'
import Order from '../../api/order/order.model'
import User from '../../api/user/user.model'
import DKP from '../../api/dkp/dkp.model'
import History from '../../api/history/history.model'
import Member from '../../api/user/member.model'
import Admin from './admin.model'
import { respondWithResult, handleError, handleEntityNotFound } from '../utils'

const BACKUP_FOLDER = './src/backup/'

// Gets a list of Admins
export function index(req, res) {
  return Admin.find()
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res))
}

// Gets a single Admin from the DB
export function show(req, res) {
  return Admin.findById(req.params.id)
    .exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res))
}

// Creates a new Admin in the DB
export function create(req, res) {
  return Admin.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res))
}

export function upsert(req, res) {
  return Admin.find()
    .exec()
    .then((admins) => {
      if (admins && admins.length) {
        admins[0].announcement = req.body.announcement
        return admins[0]
          .save()
          .then(respondWithResult(res))
          .catch(handleError(res))
      }
      return create(req, res)
    })
}

export function backup(req, res) {
  return Promise.all([
    Good.find().exec(),
    Order.find().exec(),
    User.find().exec(),
    DKP.find().exec(),
    History.find().exec(),
    Member.find().exec(),
  ])
    .then((result) => {
      const AllDataObj = {
        goods: result[0],
        orders: result[1],
        users: result[2],
        dkps: result[3],
        histories: result[4],
        members: result[5],
      }
      const moment = new Date()
      const filename = `${moment.getFullYear()}_${
        moment.getMonth() + 1
      }_${moment.getDate()}_${moment.getTime()}`
      fs.writeFile(
        `${BACKUP_FOLDER}${filename}.json`,
        JSON.stringify(AllDataObj, null, 2),
        (err) => {
          if (err) {
            return res.status(500).json({ message: '数据备份错误' })
          }
          fs.readdir(BACKUP_FOLDER, (err, filenames) => {
            if (err) {
              return res.status(500).json({ message: '获取备份列表错误' })
            }
            const backupFiles = filenames.filter(
              (f) => !['.keep', '.DS_Store'].includes(f)
            )
            return res.status(200).json(backupFiles)
          })
        }
      )
    })
    .catch(handleError(res))
}

export function resetGang(req, res) {
  const _userPromise = () =>
    User.find()
      .exec()
      .then((users) => users)

  const _DKKPromise = () =>
    DKP.find()
      .exec()
      .then((dkps) => dkps)

  return Promise.all([_userPromise(), _DKKPromise()])
    .then(async (data) => {
      const users = data[0]
      const dkps = data[1]
      for (let i = 0; i < users.length; i++) {
        const dkp = dkps.find((dd) => dd._doc.game_id === users[i].game_id)
        await User.findOneAndUpdate(
          { _id: users[i]._id },
          { gang: dkp._doc.gang }
        )
      }
      return res.status(200).json('ok')
    })
    .catch(handleError(res))
}

export function getBackup(req, res) {
  fs.readdir(BACKUP_FOLDER, (err, filenames) => {
    if (err) {
      return res.status(500).json({ message: '获取备份列表错误' })
    }
    const backupFiles = filenames
      .filter((f) => !['.keep', '.DS_Store'].includes(f))
      .reverse()
      .slice(0, 5)

    return res.status(200).json(backupFiles)
  })
}

export function getSearchUsers(req, res) {
  return User.find({}, '-salt')
    .exec()
    .then((users) => {
      const filter = users.filter((u) => u.game_id.includes(req.body.searchStr))
      return res.status(200).json(filter)
    })
    .catch(handleError(res))
}

export function createAdminUser(req, res) {
  const looked_admin = {
    provider: 'local',
    role: 'looked_admin',
    name: 'Looked Admin',
    email: 'admin@muxue.com',
    password: 'adminmuxue',
    game_name: '暮雪管理员',
    game_id: '187632535',
    profession: '玄机',
    gang: '暮雪寒城',
    avatar: '/uploads/images/users/玄机.png',
    is_default_account: true,
    created_at: new Date(),
  }
  const newUser = new User(looked_admin)
  return User.create(newUser)
    .then(respondWithResult(res, 201))
    .catch(handleError(res))
}

export function recover(req, res) {
  const filename = req.body.name
  const rawdata = fs.readFileSync(`${BACKUP_FOLDER}${filename}`)
  const allData = JSON.parse(rawdata)

  return Promise.all([
    User.find({})
      .deleteMany()
      .then(() => User.create(...allData.users)),
    Good.find({})
      .deleteMany()
      .then(() => Good.create(...allData.goods)),
    Order.find({})
      .deleteMany()
      .then(() => Order.create(...allData.orders)),
    DKP.find({})
      .deleteMany()
      .then(() => DKP.create(...allData.dkps)),
    History.find({})
      .deleteMany()
      .then(() => History.create(...allData.histories)),
    Member.find({})
      .deleteMany()
      .then(() => Member.create(...allData.members)),
  ])
    .then(() => res.status(200).json({ message: '恢复成功' }))
    .catch(handleError(res))
}

export function addGoldForAllUsers(req, res) {
  return User.updateMany({}, { gold: 100000 })
    .then(respondWithResult(res))
    .catch(handleError(res))
}

export async function recoverPersonalData(req, res) {
  const { recoverGameId, backupFilename } = req.body
  const rawData = fs.readFileSync(`${BACKUP_FOLDER}${backupFilename}`)
  const { users, dkps, histories } = JSON.parse(rawData)
  const recoverUser = users.find((u) => u.game_id === recoverGameId)
  const recoverDkp = dkps.find((d) => d.game_id === recoverGameId)
  const recoverHistories = histories.filter((h) => h.dkp === recoverDkp._id)
  try {
    const user = await User.findOne({ game_id: recoverGameId })
    const dkp = await DKP.findOne({ game_id: recoverGameId })
    Object.assign(user, recoverUser)
    Object.assign(dkp, recoverDkp)
    await user.save()
    await dkp.save()
    await History.create(...recoverHistories)

    return res.status(200).json({ message: '恢复成功' })
  } catch (error) {
    console.log(error.toString())

    return handleError(res)
  }
}
