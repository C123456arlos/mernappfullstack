import express from 'express'
import { protect } from '../middleware/auth.js'
import { createFolder, getFolderDetails, getFolders, moveFolder, permanentDeleteFolder, renameFolder, restoreFolder, softDeleteFolder } from '../controllers/folderController.js'
const router = express.Router()
router.use(protect)
router.post('/', createFolder)
router.get('/', getFolders)
router.get('/:id', getFolderDetails)
router.patch('/:id/rename', renameFolder)
router.patch('/:id/move', moveFolder)
router.delete('/:id', softDeleteFolder)
router.post('/:id/restore', restoreFolder)
router.delete('/:id/permanent', permanentDeleteFolder)
export default router