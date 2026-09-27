import { sql } from "../config/db.js"
import path from 'path'
import crypto from 'crypto'
import { getSignedFileUrl, uploadToStorage } from "../utils/s3Helper.js"
import { adjustUserStorage, cleanupShareLinks, permanentlyDeleteFileRecord } from "../services/storageService.js"
const SORT_MAP = {
    name_asc: 'name ASC',
    name_desc: 'name DESC',
    date_asc: 'created_at ASC',
    date_desc: 'created_at DESC',
    size_asc: 'size ASC',
    size_desc:'size DESC'
}
export const uploadFiles = async (req, res) => {
    try {
        if (!req.files?.length) {
            return res.status(400).json({error:'no files uploaded'})
        }
        const folderId = req.body.folder_id || req.body.folderId
        let targetFolderId = null
        if (folderId && folderId !== 'null' && folderId !== 'root') {
            const [folder] = await sql`SELECT id FROM folders 
            WHERE id = ${folderId} AND owner_id=${req.user.id} AND is_trashed=false`
            if (!folder) {
                return res.status(404).json({error:'target folder not found'})
            }
            targetFolderId= folder.id
        }
        const totalNewBytes = req.files.reduce((acc, f) => acc + f.size, 0)
        if (Number(req.user.storage_used) + totalNewBytes > Number(req.user.storage_limit)) {
            const limitGb = (Number(req.user.storage_limit) / (1024 * 1024 * 1024)).toFixed(1)
            return res.status(400).json({error:`upload exceeds storage quota limit of ${limitGb} gb`})
        }
        const createdFiles = await Promise.all(
            req.files.map(async (multerFile) => {
                const fileExt = path.extname(multerFile.originalname)
                const randomString = crypto.randomBytes(8).toString('hex')
                const s3Key = `users/${req.user.id}/${Date.now()}_${randomString}${fileExt}`
                await uploadToStorage(multerFile.buffer, s3Key, multerFile.mimeType)
                const [row] = await sql`
                INSERT INTO files (name, original_name, mime_type, size, s3_key, folder_id, owner_id) 
                VALUES (${multerFile.originalname}, ${multerFile.originalname}, ${multerFile.mimeType}, ${multerFile.size},
                ${s3Key}, ${targetFolderId}, ${req.user.id}) 
                RETURNING *
                `
                return row
            })
        )
        const updatedStorage = await adjustUserStorage(req.user.id, totalNewBytes)
        return res.status(201).json({files:createdFiles, storage_used:updatedStorage})
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}
export const getFiles = async (req, res) => {
    try {
        const { folder, folder_id, search, sort = 'name_asc', page = 1, limit = 50 } = req.query
        const pageNum= Math.max(1, parseInt(page,10) || 1)
        const limitNum = Math.max(1, parseInt(limit, 10) || 50)
        const offset = (pageNum - 1) * limitNum
        const orderBy = SORT_MAP[sort] || SORT_MAP.name_asc
        const targetFolder = folder_id ?? folder
        const targetFolderId = !targetFolder || targetFolder === 'null' || targetFolder === 'root' ? null : targetFolder
        const isSearch = Boolean(search?.trim())
        const pattern = `%${search?.trim()}%`
        const [rows, countRows] = await Promise.all([
            sql`SELECT * FROM files 
            WHERE owner_id=${req.user.id} AND is_trashed=false
            AND (${isSearch}::boolean=true AND name ILIKE ${pattern} OR ${isSearch}::boolean=false 
            AND folder_id IS NOT DISTINCT FROM ${targetFolderId})
            ORDER BY ${sql.unsafe(orderBy)}
            LIMIT ${limitNum} OFFSET ${offset}`,
            sql`SELECT COUNT(*)::int AS total FROM files
            WHERE owner_id=${req.user.id} AND is_trashed=false
            AND (${isSearch}::boolean=true AND name ILIKE ${pattern} OR ${isSearch}
            ::boolean= false AND folder_id IS NOT DISTINCT FROM ${targetFolderId})`
        ])
        const totalFiles = countRows[0].total
        return res.status(200).json({
            files: rows,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalFiles,
                totalPages:Math.ceil(totalFiles/limitNum),
            }
        })
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}
export const getFilePreviewUrl = async (req, res) => {
    try {
        const [file] = await sql`
        SELECT * FROM files WHERE id = ${req.params.id} AND owner_id=${req.user.id}`
        if (!file) {
            return res.status(404).json({error:'file not found'})
        }
        const downloadUrl = await getSignedFileUrl(file.s3_key)
        return res.status(200).json({url:downloadUrl, file})
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}
export const renameFile = async (req, res) => {
    try {
        const { name } = req.body
        if (!name?.trim()) {
            return res.status(400).json({error:'file name is required'})
        }
        const [file] = await sql`
        UPDATE files SET name=${name.trim()}, updated_at=NOW()
        WHERE id= ${req.params.id} AND owner_id=${req.user.id} AND is_trashed=false
        RETURNING *`
        if (!file) {
            return res.status(404).json({error:'file not found'})
        }
        return res.status(200).json({file})
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}
export const moveFile = async (req, res) => {
    try {
        const targetFolder = req.body.target_folder ?? req.body.targetFolder
        if (targetFolder) {
            const [destFolder] = await sql`
            SELECT id FROM folders
            WHERE id =${targetFolder} AND owner_id=${req.user.id} AND is_trashed=false
            `
            if (!destFolder) {
                return res.status(404).json({error:'destination folder not found'})
            }
        }
        const [file] = await sql`UPDATE files SET folder_id= ${targetFolder || null}, updated_at=NOW()
        WHERE id=${req.params.id} AND owner_id=${req.user.id} AND is_trashed=false RETURNING *`
        if (!file) {
            return res.status(404).json({error:'file not found'})
        }
        return res.status(200).json({file})
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}
export const softDeleteFile = async (req, res) => {
    try {
        const [file] = await sql`
        UPDATE files SET is_trashed =true, trashed_at=NOW(), updated_at=NOW()
        WHERE id = ${req.params.id} AND owner_id=${req.user.id} AND is_trashed=false
        RETURNING *
        `
        if (!file) {
            return res.status(404).json({error:'file not found'})
        }
        await cleanupShareLinks([file.id], [])
        return res.status(200).json({message:'file moved to trash'})
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}
export const restoreFile = async (req, res) => {
    try {
        const [file] = await sql`
        UPDATE files SET is_trashed=false, trashed_at=NULL , updated_at=NOW()
        WHERE id =${req.params.id} AND owner_id=${req.user.id} AND is_trashed=true
        RETURNING id
        `
        if (!file) {
            return res.status(404).json({error:'file not found in trash'})
        }
        return res.status(200).json({message:'file restored from trash'})
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}
export const permanentDeleteFile = async (req, res) => {
    try {
        const [file] = await sql`
        SELECT * FROM files WHERE id =${req.params.id} AND owner_id=${req.user.id}`
        if (!file) {
            return res.status(404).json({error:'file not found'})
        }
        await permanentlyDeleteFileRecord(file, req.user.id)
        return res.status(200).json({message:'file permanently deleted'})
    } catch (error) {
        return res.status(500).json({error:error.message})
    }
}