import dotenv from 'dotenv'
dotenv.config()

import express, { Application } from 'express'
import cors from 'cors'
import mysql from 'mysql2'

import usersRoute from './api/users'
import aclRoute from './api/acl'

export const pool = mysql
  .createPool({
    host: process.env.DB_HOST ?? 'localhost',
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? 'root',
    database: process.env.DB_NAME ?? 'proj_public_services',
  })
  .promise()

const app: Application = express()

app.use(cors())
app.use(express.json())
app.use('/api/users', usersRoute)
app.use('/api/acl', aclRoute)

const PORT = process.env.PORT ?? 5000

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
