const express = require('express')
const router = express.Router()

const loginRouter = require('./login.router')
const signupRouter = require('./signup.router')
const postRouter = require('./post.router')
const commentRouter = require('./comment.router')

router.use('/', [loginRouter, signupRouter])
router.use('/posts', [postRouter, commentRouter])

module.exports = router
