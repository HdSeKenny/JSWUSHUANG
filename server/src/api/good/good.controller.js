'use strict'

import { applyPatch } from 'fast-json-patch'
import multer from 'multer'
import path from 'path'
import Good from './good.model'
import DKP from '../dkp/dkp.model'
import User from '../user/user.model'
import config from '../../config/environment'

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(config.upload.target, 'goods'))
  },
  filename(req, file, cb) {
    const fileParams = file.originalname.split('.')
    const fileFormat = fileParams[fileParams.length - 1]
    const timestamp = new Date().getTime()
    cb(null, `good_${fileParams[0]}_${timestamp}.${fileFormat}`)
  },
})

const _upload = multer({ storage })

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity)
    }
    return null
  }
}

function patchUpdates(patches) {
  return function (entity) {
    try {
      applyPatch(entity, patches, /*validate*/ true)
    } catch (err) {
      return Promise.reject(err)
    }

    return entity.save()
  }
}

// function removeEntity(res) {
//   return function (entity) {
//     if (entity) {
//       return entity.remove().then(() => res.status(204).end())
//     }
//   }
// }

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end()
      return null
    }
    return entity
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500
  return function (err) {
    res.status(statusCode).send(err)
  }
}

// Gets a list of Things
export function index(req, res) {
  return Good.find()
    .populate('current_payer')
    .populate('previous_payer')
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res))
}

// Gets a single Good from the DB
export function show(req, res) {
  return Good.findById(req.params.id)
    .exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res))
}

// Creates a new Good in the DB
export function create(req, res) {
  return _upload.fields([{ name: 'good-file' }, { name: 'good-info' }])(req, res, (err) => {
    if (err) {
      return handleError(res)
    }

    const imageInfo = req.files['good-file'][0]
    const goodInfo = JSON.parse(req.body['good-info'])
    const newGood = {
      good_name: goodInfo.goodName,
      min_price: parseInt(goodInfo.minPrice, 10),
      range_price: parseInt(goodInfo.rangePrice, 10),
      current_price: parseInt(goodInfo.minPrice, 10),
      range_hours: goodInfo.rangeHours,
      range_minutes: goodInfo.rangeMinutes,
      au_type: goodInfo.auType,
      created_at: goodInfo.created_at,
      desc: goodInfo.desc,
      status: 0,
      image_url: `/uploads/images/goods/${imageInfo.filename}`,
    }
    return Good.create(newGood).then(respondWithResult(res, 201)).catch(handleError(res))
  })
}

// Upserts the given Good in the DB at the specified ID
export function upsert(req, res) {
  if (req.body._id) {
    Reflect.deleteProperty(req.body, '_id')
  }
  return Good.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true,
  })
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res))
}

// Updates an existing Good in the DB
export function patch(req, res) {
  if (req.body._id) {
    Reflect.deleteProperty(req.body, '_id')
  }
  return Good.findById(req.params.id)
    .exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res))
}

// Deletes a Good from the DB
export async function destroy(req, res) {
  try {
    const good = await Good.findById(req.params.id).populate('current_payer')
    if (!good) {
      return res.status(404).end()
    }

    if (good.current_payer) {
      const { current_price, current_payer, au_type } = good
      const isDKPAuction = au_type === 'DKP'
      const currentPayerFilter = {
        game_name: current_payer.game_name,
      }
      const _updateOptions = {
        new: true,
      }

      if (isDKPAuction) {
        const currentPayerDKPCalc = {
          $inc: {
            payment: -parseInt(current_price),
            sum: parseInt(current_price),
          },
          updated: new Date(),
        }
        await DKP.findOneAndUpdate(currentPayerFilter, currentPayerDKPCalc, _updateOptions)
      } else {
        const currentPayerGoldCalc = {
          $inc: { gold: parseInt(current_price) },
        }
        await User.findOneAndUpdate(currentPayerFilter, currentPayerGoldCalc, _updateOptions)
      }
    }

    await good.remove()
    return res.status(204).end()
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
}

export function saveGoodAuctionInfo(_id, data) {
  return Good.findOneAndUpdate({ _id }, data, { new: true })
    .exec()
    .then((newGood) => newGood)
    .catch((err) => handleError(err))
}

export function onStartAuction(data) {
  return Good.findOneAndUpdate(
    { _id: data._id },
    { status: 1, started_at: data.started_at },
    { new: true }
  )
    .exec()
    .then((newGood) => newGood)
    .catch((err) => handleError(err))
}

export function onEndAuction(data) {
  return Good.findOneAndUpdate(
    { _id: data._id },
    { status: 2, ended_at: data.ended_at },
    { new: true }
  )
    .exec()
    .then((newGood) => newGood)
    .catch((err) => handleError(err))
}

export async function updatePayersDkp(data) {
  try {
    const { current_price, previous_price, current_payer, previous_payer, au_type } = data
    const isCurrentPayer = current_payer._id === previous_payer._id
    const isDKPAuction = au_type === 'DKP'
    const currentPayerFilter = { game_name: current_payer.game_name }
    const previousPayerFilter = { game_name: previous_payer.game_name }
    const currentPayerCalc = {
      payment: parseInt(current_price),
      sum: -parseInt(current_price),
    }
    const previousPayerCalc = {
      payment: -parseInt(previous_price),
      sum: parseInt(previous_price),
    }
    if (isCurrentPayer) {
      if (isDKPAuction) {
        await DKP.findOneAndUpdate(
          currentPayerFilter,
          {
            $inc: currentPayerCalc,
            updated: new Date(),
          },
          { new: true }
        )
      } else {
        await User.findOneAndUpdate(
          currentPayerFilter,
          {
            $inc: { gold: -parseInt(current_price) },
          },
          { new: true }
        )
      }
    } else {
      if (isDKPAuction) {
        await DKP.findOneAndUpdate(
          currentPayerFilter,
          {
            $inc: currentPayerCalc,
            updated: new Date(),
          },
          { new: true }
        )
        await DKP.findOneAndUpdate(
          previousPayerFilter,
          {
            $inc: previousPayerCalc,
            updated: new Date(),
          },
          { new: true }
        )
      } else {
        await User.findOneAndUpdate(
          currentPayerFilter,
          {
            $inc: { gold: -parseInt(current_price) },
          },
          { new: true }
        )
        await User.findOneAndUpdate(
          previousPayerFilter,
          {
            $inc: { gold: parseInt(previous_price) },
          },
          { new: true }
        )
      }
    }
  } catch (error) {
    console.error(error)
  }
}
