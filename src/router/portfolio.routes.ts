import { Router } from 'express'
import authentication from '../middleware/authentication'
import rateLimit from '../middleware/rateLimit'
import portfolioController from '../controller/portfolio.controller'
import { upload } from '../util/fileUpload'

const router = Router()

router.route('/').get(rateLimit, authentication, portfolioController.getAllPortfolios)
router.route('/:id').get(rateLimit, authentication, portfolioController.getPortfolioDetails)
router.route('/add').post(rateLimit, authentication, upload.single('landing_page_photo'), portfolioController.createPortfolio)
router.route('/edit/:id').post(rateLimit, authentication, upload.single('landing_page_photo'), portfolioController.editPortfolio)
router.route('/delete/:id').delete(rateLimit, authentication, portfolioController.deletePortfolio)

export default router
