const express = require('express')
const router = express.Router()

const loginRouter = require('./login.router')
const signupRouter = require('./signup.router')

router.use('/auth', [loginRouter, signupRouter])

module.exports = router
