import { Router } from 'express'
import { upload } from '../util/fileUpload'
import rateLimit from '../middleware/rateLimit'
import authentication from '../middleware/authentication'
import userController from '../controller/user.controller'

const router = Router()

router.route('/').get(rateLimit, authentication, userController.getAllUsers)
router.route('/:id').get(rateLimit, authentication, userController.getUserDetails)
router.route('/edit/:id').post(rateLimit, authentication, upload.single('landing_page_photo'), userController.updateUser)
router.route('/delete/:id').delete(rateLimit, authentication, userController.deleteUser)

export default router
