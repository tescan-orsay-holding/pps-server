import dotenv from 'dotenv'
dotenv.config()

import express, { Application } from 'express'
import cors from 'cors'
import mysql from 'mysql2'

import usersRoute from './api/users'
import aclRoute from './api/acl'

export const pool = mysql
  .createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'YOUR_PASSWORD_HERE',
    database: 'proj_public_services',
  })
  .promise()

const app: Application = express()

app.use(cors())
app.use(express.json())
app.use('/api/users', usersRoute)
app.use('/api/acl', aclRoute)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
