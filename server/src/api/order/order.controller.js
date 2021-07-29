'use strict'

import { applyPatch } from 'fast-json-patch'
import Order from './order.model'
import User from '../user/user.model'
import DKP from '../dkp/dkp.model'

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200
  return function(entity) {
    if (entity) {
      return res.status(statusCode).json(entity)
    }
    return null
  }
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      applyPatch(entity, patches, /*validate*/ true)
    } catch (err) {
      return Promise.reject(err)
    }

    return entity.save()
  }
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.remove().then(() => res.status(204).end())
    }
  }
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end()
      return null
    }
    return entity
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500
  return function(err) {
    res.status(statusCode).send(err)
  }
}

// Gets a list of Orders
export function index(req, res) {
  return Order
    .find()
    .populate('good_id')
    .populate('payer_id')
    .exec()
    .then(respondWithResult(res))
    .catch(handleError(res))
}

// Gets a single Order from the DB
export function show(req, res) {
  return Order.findById(req.params.id)
    .exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res))
}

export function showOneByGoodId(id) {
  return Order.findOne({ good_id: id })
    .populate('good_id')
    .populate('payer_id')
    .exec()
}

// Creates a new Order in the DB
export function onCreateNewOrder(data) {
  return Order.create(data)
    .then((order) => {
      return User.findById(order.payer_id)
        .then((payer) => {
          payer.orders.push(order._id)
          return payer.save()
        })
        .catch(err => Promise.reject(err))
    })
    .catch(err => Promise.reject(err))
}

// Upserts the given Order in the DB at the specified ID
export function upsert(req, res) {
  if (req.body._id) {
    Reflect.deleteProperty(req.body, '_id')
  }
  return Order.findOne({ _id: req.params.id })
    .exec()
    .then((order) => {
      if (order.displayOrder !== 0) {
        return Order.findOneAndUpdate({ _id: req.params.id }, req.body, {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true
        })
          .exec()
          .then(respondWithResult(res))
          .catch(handleError(res))
      } else {
        res.json(order)
      }
    })
}

// Updates an existing Order in the DB
export function patch(req, res) {
  if (req.body._id) {
    Reflect.deleteProperty(req.body, '_id')
  }
  return Order.findById(req.params.id)
    .exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res))
}

// Deletes a Order from the DB
export function destroy(req, res) {
  return Order.findById(req.params.id)
    .exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res))
}

export async function thorough(req, res) {
  const { game_id, sum, payment } = req.body
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id },
    { status: 0 },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true
    }
  ).exec()

  const dkp = await DKP.findOneAndUpdate(
    { game_id },
    { sum, payment },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true
    }
  ).exec()

  return res.status(200).json({ order, dkp })
}
