const multer = require('multer')
const fs = require('fs')
const qs = require('querystring')
const path = require('path')
const request = require('superagent')
const config = require('../../config/environment')

const param = qs.stringify({
  grant_type: 'client_credentials',
  client_id: 'nSQe4H4YpD6A13BdbeWXRohc',
  client_secret: 'EAqK4iRyTDqyk0YwXsgePBKtVvtFdNqI'
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
  }
})

const _upload = multer({ storage })

function handleError(res, statusCode) {
  statusCode = statusCode || 500
  return function(err) {
    res.status(statusCode).send(err)
  }
}

// function to encode file data to base64 encoded string
function base64_encode(file) {
  // read binary data
  const bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return Buffer.from(bitmap).toString('base64')
}

export function getAccessToken(req, res) {
  return request.get(ACCESS_TOKEN_TARGET)
    .then((response) => {
      return res.status(200).json({
        access_token: response.body.access_token
      })
    })
    .catch(err => {
      res.status('500').send(err)
    })
}

export function getImageWordsByOCR(req, res) {
  return request.get(ACCESS_TOKEN_TARGET)
    .then((response) => {
      return _upload.fields([
        { name: 'image-file' }
      ])(req, res, (err) => {
        if (err) {
          return handleError(res)
        }

        const imageInfo = req.files['image-file'][0]
        const _url = `${OCR_BASE_URL}?access_token=${response.body.access_token}`
        const ocrImagePath = path.join(config.upload.target, '..', 'ocr', imageInfo.filename)
        const data = base64_encode(ocrImagePath)
        return request.post(_url)
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({ image: data })
          .set('accept', 'json')
          .end((err, _res) => {
            if (err) {
              return handleError(res)
            }
            fs.unlink(ocrImagePath, (err) => {
              if (err) {
                return res.status(500).json({
                  message: '删除OCR临时文件时发生错误'
                })
              }
              return res.status(200).json(_res.body)
            })
          })
      })
    })
    .catch(err => {
      res.status(500).send(err)
    })
}
