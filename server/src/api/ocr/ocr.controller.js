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

// eslint-disable-next-line
export const CHINESE_REGEX =
  /[^[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]]/g

export const UNREADABLE_WORDS = {
  雪穗: '雪穂',
  卷耳兔: '巻耳兔',
  笙零: '笙雩',
  需米觉得不妥: '糯米觉得不妥',
  北: '北笙',
  人间客了: '人间客',
  樱花少: '樱花',
  难的大姐: '难哄的大姐',
  膜: '腼腆',
  到霉蛋陈平安: '倒霉蛋陈平安',
  唐飞琛: '唐琛',
  唐飞炎: '唐炎',
  唐飞伟: '唐伟',
  唐飞剑: '唐剑',
  唐飞男: '唐男',
  唐飞桥: '唐桥',
  唐飞北: '唐北',
  唐飞强: '唐强',
  唐飞鑫: '唐鑫',
  蓝池: '蓝沁',
}

export const UNREADABLE_CHARACTER = ['丶', '乀']

export const INVALID_CHARACTERS = [
  '一',
  '二',
  '三',
  '四',
  '五',
  '六',
  '七',
  '八',
  '九',
  '连云寨',
  '连云',
  '云寨',
  '连云赛',
]

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
function base64_encode(file) {
  // read binary data
  const bitmap = fs.readFileSync(file)
  // convert binary data to base64 encoded string
  return Buffer.from(bitmap).toString('base64')
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
        const imageInfo = req.files['image-file'][0]
        const _url = `${OCR_BASE_URL}?access_token=${response.body.access_token}`
        const ocrImagePath = path.join(config.upload.target, '..', 'ocr', imageInfo.filename)
        const data = base64_encode(ocrImagePath)
        return request
          .post(_url)
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({ image: data })
          .set('accept', 'json')
          .end((err, _res) => {
            if (err) {
              return handleError(res)
            }
            fs.unlink(ocrImagePath, async (err) => {
              if (err) {
                return res.status(500).json({
                  message: '删除OCR临时文件时发生错误',
                })
              }

              if (_name) {
                let checkedName = null
                let original = _name.replace(CHINESE_REGEX, '')
                _res.body.words_result.forEach((wr) => {
                  let ocrChinese = wr.words.replace(CHINESE_REGEX, '')
                  const readableWords = UNREADABLE_WORDS[ocrChinese] || ocrChinese
                  UNREADABLE_CHARACTER.forEach((uc) => {
                    ocrChinese = ocrChinese.replace(uc, '')
                    original = original.replace(uc, '')
                  })

                  if (readableWords && !INVALID_CHARACTERS.includes(readableWords) && original.includes(ocrChinese)) {
                    checkedName = ocrChinese
                  }
                })

                if (!checkedName) {
                  return res.status(403).json({ message: '校验失败' })
                }

                await UserCtrl.setUserCheckedName(_name, checkedName)
                return res.status(200).json()
              }

              return res.status(200).json(_res.body)
            })
          })
      })
    })
    .catch((err) => {
      res.status(500).send(err)
    })
}
