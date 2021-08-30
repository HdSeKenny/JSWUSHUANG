const multer = require('multer')
const fs = require('fs')
const qs = require('querystring')
const path = require('path')
const request = require('superagent')
const config = require('../../config/environment')
const UserCtrl = require('../user/user.controller')

const param = qs.stringify({
  grant_type: 'client_credentials',
  client_id: 'nSQe4H4YpD6A13BdbeWXRohc',
  client_secret: 'EAqK4iRyTDqyk0YwXsgePBKtVvtFdNqI',
})

const ACCESS_TOKEN_TARGET = `https://aip.baidubce.com/oauth/2.0/token?${param}`
const OCR_BASE_URL = 'https://aip.baidubce.com/rest/2.0/ocr/v1/webimage'

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(config.upload.target, '..', 'ocr'))
  },
  filename(req, file, cb) {
    const fileParams = file.originalname.split('.')
    const fileFormat = fileParams[fileParams.length - 1]
    const timestamp = new Date().getTime()
    cb(null, `ocr_${fileParams[0]}_${timestamp}.${fileFormat}`)
  },
})

const _upload = multer({ storage })

function handleError(res, statusCode) {
  statusCode = statusCode || 500
  return function (err) {
    res.status(statusCode).send(err)
  }
}

// function to encode file data to base64 encoded string
function base64_encode(res, file) {
  try {
    // read binary data
    const bitmap = fs.readFileSync(file)
    // convert binary data to base64 encoded string
    return Buffer.from(bitmap).toString('base64')
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: '失败了' })
  }
}

export function getAccessToken(req, res) {
  return request
    .get(ACCESS_TOKEN_TARGET)
    .then((response) => {
      return res.status(200).json({
        access_token: response.body.access_token,
      })
    })
    .catch((err) => {
      res.status('500').send(err)
    })
}

export function getImageWordsByOCR(req, res) {
  return request
    .get(ACCESS_TOKEN_TARGET)
    .then((response) => {
      return _upload.fields([{ name: 'image-file' }, { name: 'checked-name' }])(req, res, (err) => {
        if (err) {
          return handleError(res)
        }

        const _name = req.body.name
        if (!req.files['image-file']) {
          console.log(req.body, '============')
          return res.status(500).json({ message: '失败了' })
        }

        const imageInfo = req.files['image-file']
          ? req.files['image-file'][0]
          : { filename: `${new Date().getTime()}_temp.PNG` }
        const _url = `${OCR_BASE_URL}?access_token=${response.body.access_token}`
        const ocrImagePath = path.join(config.upload.target, '..', 'ocr', imageInfo.filename)
        const data = base64_encode(res, ocrImagePath)
        return request
          .post(_url)
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({ image: data })
          .set('accept', 'json')
          .end((baiduerr, baidures) => {
            if (baiduerr) {
              return handleError(res)
            }
            fs.unlink(ocrImagePath, async (err) => {
              if (err) {
                return res.status(500).json({
                  message: '删除OCR临时文件时发生错误',
                })
              }

              if (_name) {
                const [chekced] = baidures.body.words_result
                const checkedName = chekced.words

                if (!checkedName) {
                  return res.status(403).json({ message: '校验失败' })
                }

                const _dkp = await UserCtrl.setUserCheckedName(_name, checkedName)
                return res.status(200).json({ newDKP: _dkp })
              }

              return res.status(200).json(baidures.body)
            })
          })
      })
    })
    .catch((err) => {
      res.status(500).send(err)
    })
}
