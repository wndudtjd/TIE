const express = require('express')
const router = express.Router()
require('dotenv').config()
const jwt = require('jsonwebtoken')
const { Users } = require('../models')
const bcrypt = require('bcrypt')

// 로그인 API
router.post('/login', async (req, res) => {
  const { userId, password } = req.body

  const user = await Users.findOne({
    where: { userId },
  })

  const match = bcrypt.compareSync(password, user.password)

  if (!user || !match) {
    res.status(400).json({
      errorMessage: '아이디와 비밀번호를 다시 확인해 주세요',
    })
    return
  }

  const token = jwt.sign({ nickname: user.nickname, userId: user.userId }, process.env.TOKEN_KEY)

  res.cookie('authorization', `Bearer ${token}`)
  res.status(200).json({
    token,
    success: true,
    message: '로그인에 성공했습니다.',
  })
})

module.exports = router
