'use strict'

const express = require('express')
const controller = require('./ocr.controller')

const router = express.Router()

router.get('/access_token', controller.getAccessToken)
router.post('/', controller.getImageWordsByOCR)
module.exports = router
