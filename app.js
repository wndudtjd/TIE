const express = require('express')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const app = express()
const port = 3000
const globalRouter = require('./routes')

app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

app.use('/api', globalRouter)

// cors 미들웨어 사용
const cors = require('cors')
app.use(cors())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-origin', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  next()
})

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})
