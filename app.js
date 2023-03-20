const express = require('express')
const cors = require('cors')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const app = express()
const port = 3000
const globalRouter = require('./routes')

app.use(
    cors({
        origin: '*',
        credentials: true,
        optionsSuccessStatus: 200,
    })
)
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))
// 정적 파일로 제공하기 위한 미들웨어
// 클라이언트에서 요청할때 브라우저에서 직접 접근 가능해짐.
app.use(express.static('public'))

app.use('/api', globalRouter)


app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})
