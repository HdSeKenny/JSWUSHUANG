import XLSX from 'xlsx'
import DKP from './dkp.model'
import History from '../history/history.model'
import User from '../user/user.model'
import defaultSchema from '../../../schema'
import {
  respondWithResult,
  patchUpdates,
  removeEntity,
  handleEntityNotFound,
  handleError,
} from '../utils'

export function index(req, res) {
  return DKP.find()
    .populate({
      path: 'histories',
      populate: [
        {
          path: 'operator',
          select: 'game_name',
          model: 'User',
        },
      ],
    })
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res))
}

// Gets a single DKP from the DB
export async function show(req, res) {
  try {
    const dkps = await DKP.find({
      $or: [{ game_id: req.params.id }, { isGangAdmin: true }],
    })
      .populate({
        path: 'histories',
        populate: [
          {
            path: 'operator',
            select: 'game_name',
            model: 'User',
          },
        ],
      })
      .exec()

    const users = await User.find({
      $or: [{ game_id: req.params.id }, { isGangAdmin: true }],
    }).exec()

    for (let i = 0; i < dkps.length; i++) {
      const dkp = dkps[i]
      const user = users.find((u) => u.game_id === dkp.game_id)
      dkp.wechat = user ? user.wechat : ''
    }
    res.status(200).json(dkps)
  } catch (error) {
    handleError(res, 500, error)
  }
}

// Creates a new DKP in the DB
export function create(req, res) {
  return DKP.findOne({ game_id: req.body.game_id }).then((dkp) => {
    if (dkp) {
      return res.status(403).json({
        message: '该DKP已经存在, 请勿重复添加',
      })
    }
    return DKP.create(req.body).then(respondWithResult(res, 201)).catch(handleError(res))
  })
}

export function importAll(req, res) {
  const data = req.body.map((rb) => {
    return Object.assign({}, rb, { updated: new Date() })
  })

  return DKP.deleteMany().then(() =>
    DKP.insertMany(data).then(respondWithResult(res, 201)).catch(handleError(res))
  )
}

// Upserts the given DKP in the DB at the specified ID
export function upsert(req, res) {
  if (req.body._id) {
    Reflect.deleteProperty(req.body, '_id')
  }
  return DKP.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true,
  })
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res))
}

// Updates an existing DKP in the DB
export function patch(req, res) {
  if (req.body._id) {
    Reflect.deleteProperty(req.body, '_id')
  }
  return DKP.findById(req.params.id)
    .exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res))
}

// Updates an existing DKP in the DB
export function updateDKPInfo(req, res) {
  if (req.body._id) {
    Reflect.deleteProperty(req.body, '_id')
  }

  const { edittedObj, edittedHistory, operator } = req.body
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
    sum += edittedObj[field] || 0
  }

  for (let i = 0; i < reduceFields.length; i++) {
    const field = reduceFields[i]
    sum -= edittedObj[field] || 0
  }

  edittedObj.sum = sum
  edittedObj.updated = new Date()

  return Promise.all([
    History.create({
      type: edittedHistory.type,
      fields: edittedHistory.fields,
      operator,
      created: new Date(),
      sum_after_changed: edittedObj.sum,
      dkp: req.params.dkpId,
    }),
    DKP.findOneAndUpdate({ _id: req.params.dkpId }, edittedObj, {
      new: true,
    }).exec(),
  ]).then((result) => {
    const newHistory = result[0]
    const newDkp = result[1]
    if (newDkp.histories) {
      newDkp.histories.push(newHistory._id)
    } else {
      newDkp.histories = [newHistory._id]
    }

    DKP.findOneAndUpdate({ _id: newDkp._id }, { histories: newDkp.histories }, { new: true })
      .populate({
        path: 'histories',
        populate: [
          {
            path: 'operator',
            select: 'game_name',
            model: 'User',
          },
        ],
      })
      .exec()
      .then(handleEntityNotFound(res))
      .then(respondWithResult(res))
      .catch(handleError(res))
  })
}

// Deletes a DKP from the DB
export function destroy(req, res) {
  return DKP.findById(req.params.id)
    .exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res))
}

const findOneAndUpdatePromise = (query, data) => {
  return new Promise((resolve, reject) => {
    return DKP.findOneAndUpdate(query, data, { new: true })
      .populate({
        path: 'histories',
        populate: [
          {
            path: 'operator',
            select: 'game_name',
            model: 'User',
          },
        ],
      })
      .exec()
      .then((newOne) => resolve(newOne))
      .catch((err) => reject(err))
  })
}

export function findManyAndUpdate(req, res) {
  return History.create(...req.body.histories)
    .then((newHistories) => {
      const updatePromises = req.body.newData.map((b) => {
        const bHistory = newHistories.find((nh) => nh._doc.dkp.toString() === b.dkpId)
        if (!b.histories || !b.histories.length) {
          b.data.histories = [bHistory._doc._id]
        } else {
          b.histories.push(bHistory._doc._id)
          b.data.histories = b.histories
        }
        b.data.updated = new Date()
        return findOneAndUpdatePromise({ game_id: b.game_id }, b.data)
      })
      return Promise.all(updatePromises).then(respondWithResult(res)).catch(handleError(res))
    })
    .catch(handleError(res))
}

export function downloadDKPExcel(req, res) {
  const wb = {
    SheetNames: [],
    Sheets: {},
    Props: {
      Title: 'DKP数据',
      Author: 'kenny',
    },
  }

  return DKP.find()
    .exec()
    .then((dkps) => {
      const DKP_EXCEL_HEASERS = defaultSchema.dkp_table_headers
      const data = dkps.map((ds) => {
        const _dObj = {}
        Object.keys(DKP_EXCEL_HEASERS).forEach((deh) => {
          _dObj[DKP_EXCEL_HEASERS[deh].text] = ds[deh] || 0
        })
        return _dObj
      })
      const ws = XLSX.utils.json_to_sheet(data)
      const ws_name = 'DataSheet1'
      XLSX.utils.book_append_sheet(wb, ws, ws_name)

      // create file 'in memory'
      const moment = new Date()
      const filename = `${moment.getMonth() + 1}_${moment.getDate()}_${moment.getTime()}`
      const wbout = Buffer.from(XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }))
      const formateFileName = `dkps_${filename}.xlsx`

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      res.setHeader('Content-Disposition', `attachment; filename=${formateFileName}`)
      res.send(wbout)
    })
    .catch(handleError(res))
}

export function resetDKPInfo(req, res) {
  return Promise.all([
    DKP.findOne({ game_id: req.body.game_id }),
    User.findOne({ game_id: req.body.game_id }),
  ]).then((result) => {
    const [dkp, user] = result
    return Promise.all([
      User.findOneAndUpdate(
        { _id: user._doc._id },
        {
          game_name: dkp._doc.game_name,
          name: dkp._doc.game_name,
          profession: dkp._doc.profession,
          gang: dkp._doc.gang,
        }
      ).exec(),
    ])
      .then(respondWithResult(res))
      .catch(handleError(res))
  })
}

export async function setUserGangeAdmin(req, res) {
  try {
    const dkp = await DKP.findOneAndUpdate(
      { game_id: req.params.id },
      { isGangAdmin: true },
      { new: true }
    ).exec()
    await User.findOneAndUpdate(
      { game_id: req.params.id },
      { isGangAdmin: true },
      { new: true }
    ).exec()
    return res.status(200).json(dkp)
  } catch (error) {
    handleError(res, 500, error)
  }
}
