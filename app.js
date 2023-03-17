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

app.use("/api", globalRouter)


app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})

