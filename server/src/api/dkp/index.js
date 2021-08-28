import express from 'express'
import * as controller from './dkp.controller'
import * as auth from '../../auth/auth.service'

const router = express.Router()

router.get('/', controller.index)
router.get('/:id', controller.show)
router.post('/', controller.create)
router.post('/:dkpId/info', auth.hasRole('admin'), controller.updateDKPInfo)
router.post('/all', controller.importAll)
router.put('/:id', controller.upsert)
router.patch('/:id', controller.patch)
router.delete('/:id', controller.destroy)

router.post('/some/update', auth.hasRole('admin'), controller.findManyAndUpdate)
router.get('/all/download', auth.hasRole('admin'), controller.downloadDKPExcel)
router.post('/:id/setAdmin', auth.hasRole('admin'), controller.setUserGangeAdmin)

router.post('/reset', auth.hasRole('admin'), controller.resetDKPInfo)

module.exports = router
