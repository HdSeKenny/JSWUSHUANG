'use strict'

import jwt from 'jsonwebtoken'
// import crypto from 'crypto'
import multer from 'multer'
import path from 'path'
import User from './user.model'
import DKP from '../dkp/dkp.model'
import Member from './member.model'
import config from '../../config/environment'

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200
  if (res.salt) {
    Reflect.deleteProperty(res, 'salt')
  }

  if (res.password) {
    Reflect.deleteProperty(res, 'password')
  }

  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity)
    }
    return null
  }
}

function validationError(res, statusCode) {
  statusCode = statusCode || 422
  return function (err) {
    return res.status(statusCode).json(err)
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500
  return function (err) {
    return res.status(statusCode).send(err)
  }
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  return User.find({ role: 'user' }, '-salt -password')
    .exec()
    .then((users) => {
      res.status(200).json(users)
    })
    .catch(handleError(res))
}

export function indexMembers(req, res) {
  return Member.find({}, '-salt -password')
    .exec()
    .then((members) => {
      res.status(200).json(members)
    })
    .catch(handleError(res))
}

/**
 * Creates a new user
 */
export function create(req, res) {
  const newUser = new User(req.body)
  newUser.provider = 'local'
  newUser.role = 'user'
  newUser.created_at = new Date()
  return DKP.findOne({ game_id: newUser.game_id })
    .exec()
    .then((dkp) => {
      if (!dkp) {
        return res.status(403).json({
          message: '你输入的游戏id无效, 如果id正确请联系管理员',
        })
      }
      return User.findOne({ game_id: newUser.game_id })
        .exec()
        .then((user) => {
          if (user) {
            return res.status(403).json({
              message: '你已经是该网站的用户了',
            })
          }

          newUser.name = dkp._doc.game_name
          newUser.game_name = dkp._doc.game_name
          newUser.gang = dkp._doc.gang
          newUser.profession = dkp._doc.profession
          newUser.avatar = `/uploads/images/users/user.png`

          return Member.create(newUser).then(respondWithResult(res, 201)).catch(handleError(res))
        })
        .catch(handleError(res))
    })
    .catch(handleError(res))
}

export function thoughMemberToUser(req, res) {
  const { game_id } = req.body
  const findMemberDkp = () => DKP.findOne({ game_id }).exec()
  const findMember = () => Member.findOne({ _id: req.params.id }).exec()
  return Promise.all([findMemberDkp(), findMember()])
    .then((data) => {
      if (!data[0]) {
        return res.status(500).json({ message: '数据中没有找到该玩家, 请先添加此人dkp' })
      }
      const dkp = data[0]._doc
      const member = data[1]._doc
      Reflect.deleteProperty(member, '_id')
      Reflect.deleteProperty(member, '__v')
      const newMember = Object.assign({}, member, { dkp_score: dkp._id, game_name: dkp.game_name, gang: dkp.gang })
      return User.create(newMember)
        .then(() => {
          return Member.findByIdAndRemove(req.params.id)
            .exec()
            .then(() => res.status(204).end())
            .catch(handleError(res))
        })
        .catch(validationError(res))
    })
    .catch(handleError(res))
}

export function createUser(req, res) {
  const newUser = new User(req.body)
  newUser.provider = 'local'
  newUser.role = 'user'
  return newUser
    .save()
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, config.secrets.session, {
        expiresIn: 60 * 60 * 5,
      })
      return res.json({ token })
    })
    .catch(validationError(res))
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  const userId = req.params.id

  return User.findById(userId)
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(404).end()
      }
      res.json(user.profile)
    })
    .catch((err) => next(err))
}

export function showByGameId(req, res, next) {
  return User.find({ game_id: req.params.gameId }, '-salt -password')
    .exec()
    .then((users) => {
      if (!users.length) {
        return res.status(404).end()
      }
      return res.json(users[0])
    })
    .catch((err) => next(err))
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id)
    .exec()
    .then(function () {
      res.status(204).end()
    })
    .catch(handleError(res))
}

export function destroyMember(req, res) {
  return Member.findByIdAndRemove(req.params.id)
    .exec()
    .then(function () {
      res.status(204).end()
    })
    .catch(handleError(res))
}

/**
 * Change a users password
 */
export function changePassword(req, res) {
  const userId = req.params.id
  const oldPass = String(req.body.oldPassword)
  const newPass = String(req.body.newPassword)
  return User.findById(userId)
    .exec()
    .then((user) => {
      if (user.authenticate(oldPass)) {
        user.password = newPass
        user
          .save()
          .then(() => {
            res.status(200).json({ message: '密码修改成功' })
          })
          .catch(validationError(res))
      } else {
        res.status(403).json({ message: '你输入的旧密码不正确' })
      }
    })
}

// function encryptPassword(_salt, password, callback) {
//   const defaultIterations = 10000
//   const defaultKeyLength = 64
//   const salt = Buffer.from(_salt, 'base64')

//   if (!callback) {
//     return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength, 'sha256').toString('base64')
//   }

//   return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, 'sha256', (err, key) => {
//     if (err) {
//       return callback(err)
//     } else {
//       return callback(null, key.toString('base64'))
//     }
//   })
// }

export function resetPassword(req, res) {
  return User.findById(req.params.id)
    .exec()
    .then((user) => {
      user.password = '666666'
      return user
        .save()
        .then(() => {
          return res.status(200).json({ message: '密码修改成功' })
        })
        .catch(validationError(res))
    })
}

// Upserts the given Thing in the DB at the specified ID
export function upsert(req, res) {
  if (req.body._id) {
    Reflect.deleteProperty(req.body, '_id')
  }
  return User.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true,
  })
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res))
}

export function changeUserInfo(req, res) {
  if (req.body._id) {
    Reflect.deleteProperty(req.body, '_id')
  }
  return Promise.all([
    User.findOneAndUpdate({ game_id: req.params.id }, req.body, {
      new: true,
    }).exec(),
    DKP.findOneAndUpdate({ game_id: req.params.id }, req.body, {
      new: true,
    }).exec(),
  ])
    .then(() => {
      return res.status(200).json(req.body)
    })
    .catch(handleError(res))
}

export function me(req, res, next) {
  return User.findOne({ _id: req.user._id }, '-salt -password')
    .populate({
      path: 'orders',
      populate: [
        {
          path: 'good_id',
          model: 'Good',
        },
        {
          path: 'payer_id',
          model: 'User',
        },
      ],
    })
    .populate({
      path: 'dkp_score',
      populate: {
        path: 'histories',
        model: 'History',
      },
    })
    .exec()
    .then((user) => {
      // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end()
      }
      return res.json(user)
    })
    .catch((err) => next(err))
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/')
}

// Upload profile image
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(config.upload.target, 'users'))
  },
  filename(req, file, cb) {
    const fileParams = file.originalname.split('.')
    const fileFormat = fileParams[fileParams.length - 1]
    cb(null, `avatar.${fileFormat}`)
  },
})

const upload = multer({ storage })

export function changeUserAvatar(req, res) {
  return upload.single(req.query.fieldname)(req, res, (err) => {
    if (err) return res.status(500).json(err)
    return User.findById(req.params.id)
      .exec()
      .then((user) => {
        user.avatar = `/uploads/images/users/${req.file.filename}`
        return user
          .save()
          .then(() =>
            res.status(200).json({
              message: 'Upload successfully',
              avatar: user.avatar,
            })
          )
          .catch(validationError(res))
      })
  })
}

export async function dealDkp(req, res) {
  Promise.all([
    DKP.findOne({ game_id: req.body.payer.game_id }).exec(),
    DKP.findOne({ game_id: req.body.receiver.game_id }).exec(),
    User.findOne({ _id: req.params.id }).exec(),
    User.findOne({ _id: req.body.receiver._id }).exec(),
  ])
    .then((data) => {
      const payer_dkp = data[0]._doc
      const receiver_dkp = data[1]._doc
      const payer = data[2]._doc
      const receiver = data[3]._doc
      const record = {
        amount: req.body.amount,
        note: req.body.note,
        payer: {
          game_id: payer.game_id,
          game_name: payer.game_name,
        },
        receiver: {
          game_id: receiver.game_id,
          game_name: receiver.game_name,
        },
        created: new Date(),
      }

      const payer_dkp_update = {
        sum: parseInt(payer_dkp.sum) - parseInt(req.body.amount),
        transaction: parseInt(payer_dkp.transaction || 0) - parseInt(req.body.amount),
      }

      const receiver_dkp_update = {
        sum: parseInt(receiver_dkp.sum) + parseInt(req.body.amount),
        transaction: parseInt(receiver_dkp.transaction || 0) + parseInt(req.body.amount),
      }

      const payer_transactions = payer.dkp_transaction_records || []
      const receiver_transactions = receiver.dkp_transaction_records || []
      payer_transactions.push(record)
      receiver_transactions.push(record)

      Promise.all([
        DKP.findOneAndUpdate({ _id: payer_dkp._id }, payer_dkp_update, { new: true }).exec(),
        DKP.findOneAndUpdate({ _id: receiver_dkp._id }, receiver_dkp_update, { new: true }).exec(),
        User.findOneAndUpdate(
          { _id: payer._id },
          { dkp_transaction_records: payer_transactions },
          { new: true }
        ).exec(),
        User.findOneAndUpdate(
          { _id: receiver._id },
          { dkp_transaction_records: receiver_transactions },
          { new: true }
        ).exec(),
      ])
        .then(() => {
          res.json({
            new_transaction_records: payer_transactions,
            new_dkp_update: payer_dkp_update,
          })
        })
        .catch(handleError(res))
    })
    .catch(handleError(res))
}

export async function setUserCheckedName(name, checkedName) {
  console.log('setUserCheckedName')
  try {
    await User.findOneAndUpdate({ game_name: name }, { checked_name: checkedName }).exec()
    await DKP.findOneAndUpdate({ game_name: name }, { checked_name: checkedName }).exec()
  } catch (error) {
    console.log(error)
    handleError(error)
  }
}
