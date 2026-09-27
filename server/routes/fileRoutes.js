import express from 'express'
import { protect } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'
import { getFilePreviewUrl, getFiles, moveFile, permanentDeleteFile, renameFile, restoreFile, softDeleteFile, uploadFiles } from '../controllers/fileController.js'
const router = express.Router()
router.use(protect)
router.post('/upload', upload.array('files', 10), uploadFiles)
router.get('/', getFiles)
router.get('/:id/preview', getFilePreviewUrl)
router.patch('/:id/rename', renameFile)
router.patch('/:id/move', moveFile)
router.delete('/:id', softDeleteFile)
router.post('/:id/restore', restoreFile)
router.delete('/:id/permanent', permanentDeleteFile)
export default router