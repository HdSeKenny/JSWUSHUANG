import express from 'express'
import * as controller from './admin.controller'
import * as auth from '../../auth/auth.service'

const router = express.Router()

router.get('/', controller.index)
router.get('/:id', auth.hasRole('admin'), controller.show)
router.get('/backup/list', auth.hasRole('root'), controller.getBackup)
router.post('/all/users', auth.hasRole('root'), controller.getSearchUsers)

router.post('/backup/resetGang', auth.hasRole('admin'), controller.resetGang)
router.post('/backup', auth.hasRole('admin'), controller.backup)
router.post('/', auth.hasRole('admin'), controller.create)
router.post('/recover', auth.hasRole('root'), controller.recover)
router.post('/recover/personal', auth.hasRole('root'), controller.recoverPersonalData)

router.post('/create/admin_user', auth.hasRole('root'), controller.createAdminUser)
router.post('/gold/add', auth.hasRole('root'), controller.addGoldForAllUsers)

router.put('/', auth.hasRole('admin'), controller.upsert)

// gang admins
router.get('/info/gang_admins', controller.indexGangAdmins)
router.post('/gang_admin', auth.hasRole('root'), controller.createGangAdmin)
router.put('/:id', auth.hasRole('root'), controller.upsertGangAdmin)
router.delete('/:id', auth.hasRole('root'), controller.destroyGangAdmin)

module.exports = router
