import { Router } from 'express'
import authController from '../controller/auth.controller'
import authentication from '../middleware/authentication'
import rateLimit from '../middleware/rateLimit'
import { upload } from '../util/fileUpload'

const router = Router()

router.route('/register').post(rateLimit, upload.single('profile_image'), authController.register)

router.route('/confirmation/:token').put(rateLimit, authController.confirmation)

router.route('/login').post(rateLimit, authController.login)

router.route('/logout').put(rateLimit, authentication, authController.logout)

router.route('/self-identification').get(authController.selfIdentification)

router.route('/refresh-token').get(rateLimit, authController.refreshToken)

router.route('/forgot-password').put(rateLimit, authController.forgotPassword)

router.route('/reset-password/:token').put(rateLimit, authController.resetPassword)

router.route('/change-password').put(rateLimit, authentication, authController.changePassword)

export default router
