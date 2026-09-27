import express from 'express'
import { protect } from '../middleware/auth.js'
import { emptyTrash, getTrashItems } from '../controllers/trashController.js'
const router = express.Router()
router.use(protect)
router.get('/', getTrashItems)
router.post('/empty', emptyTrash)
export default router