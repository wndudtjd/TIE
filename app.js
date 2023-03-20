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

// cors 미들웨어 사용
const cors = require('cors')
app.use(
  cors({
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200,
  })
)
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   res.setHeader('Access-Control-Allow-Headers', '*')
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
//   next()
// })

// 정적 파일로 제공하기 위한 미들웨어
// 클라이언트에서 요청할때 브라우저에서 직접 접근 가능해짐.
app.use(express.static('public'))

app.use('/api', globalRouter)

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})
