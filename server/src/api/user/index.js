import { Router } from 'express'
import * as controller from './user.controller'
import * as auth from '../../auth/auth.service'

const router = Router()

router.get('/', auth.isAuthenticated(), controller.index)
router.get('/me', auth.isAuthenticated(), controller.me)
router.get('/:id', auth.isAuthenticated(), controller.show)
router.get('/:gameId/info', auth.isAuthenticated(), controller.showByGameId)
router.get('/accept/members', auth.hasRole('admin'), controller.indexMembers)

router.put('/:id/password', auth.isAuthenticated(), controller.changePassword)
router.put('/:id/password/reset', auth.hasRole('root'), controller.resetPassword)
router.put('/:id', auth.isAuthenticated(), controller.upsert)

router.post('/', controller.create)
router.post('/:id/avatar', controller.changeUserAvatar)
router.post('/:id/deal/dkp', controller.dealDkp)
router.post('/:id/change/userinfo', controller.changeUserInfo)
router.post('/:id/though/application', controller.thoughMemberToUser)

router.delete('/:id', auth.hasRole('admin'), controller.destroy)
router.delete('/:id/member', controller.destroyMember)

module.exports = router
