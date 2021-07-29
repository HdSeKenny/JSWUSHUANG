'use strict'

const express = require('express')
const controller = require('./order.controller')
const auth = require('../../auth/auth.service')

const router = express.Router()

router.get('/', auth.hasRole('admin'), controller.index)
router.get('/:id', controller.show)
// router.post('/', controller.create)
router.put('/:id', controller.upsert)
router.patch('/:id', controller.patch)
router.delete('/:id', controller.destroy)

router.post('/:id/through', controller.thorough)

module.exports = router
