const express = require('express')
const router = express.Router()

const loginRouter = require('./login.router')
const signinRouter = require('./signin.router')
const postRouter = require('./post.router')

router.use('/auth', [loginRouter, signinRouter])
router.use('/', [postRouter])

module.exports = router
