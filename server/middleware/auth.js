import {sql} from '../config/db.js'
import jwt from 'jsonwebtoken'
export const protect = async (req, res, next) => {
    const token = req.cookies?.token
    if (!token) {
        return res.status(401).json({error:'unauthorized please log in'})
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const [user] = await sql`SELECT id, name, email, storage_used, storage_limit,
        created_at, updated_at FROM users WHERE id = ${decoded.id}`
        if (!user) {
            return res.status(401).json({error:'user no longer exists'})
        }
        req.user = user
        next()
    } catch  {
        return res.status(401).json({error:'token invalid or expired please log in again'})
    }
}