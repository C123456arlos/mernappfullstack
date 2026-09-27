import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { initDb } from './config/db.js'
import authRouter from './routes/authRoutes.js'
import folderRouter from './routes/folderRoutes.js'
const app = express()
const allowedOrigins = process.env.ORIGINS.split(',')
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.get('/', (_req, res) => res.send('server is running'))
app.use('/api/auth', authRouter)
app.use('/api/folders', folderRouter)
app.use((err, _req, res, _next) => {
    res.status(err.status || 500).json({error:err.message || 'something went wrong'})
})
const port = process.env.PORT || 3000
initDb().then(() => {
    app.listen(port, () => {
        console.log(`server running at http://localhost:${port}`)
    })
})