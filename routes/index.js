const express = require('express')
const router = express.Router()

const loginRouter = require('./login.router')
const signinRouter = require('./signin.router')
const postRouter = require('./post.router')
const commentRouter = require('./comment.router')

router.use('/auth', [loginRouter, signinRouter])
router.use('/posts', [postRouter, commentRouter])

module.exports = router
