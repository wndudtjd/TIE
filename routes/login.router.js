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

  res.cookie('authorization', `Bearer ${token}`, {
    httpOnly: false,
    sameSite: false,
  })
  res.status(200).json({
    token,
    success: true,
    message: '로그인에 성공했습니다.',
  })
})

/* ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ */
// Access Token, Refresh Token
// router.post('/login', async (req, res, next) => {
//   // 입력 값 받아오기
//   const { userId, password } = req.body

//   const user = await Users.findOne({
//     where: { userId },
//   })

//   const match = bcrypt.compareSync(password, user.password)

//   if (!user || !match) {
//     res.status(400).json({
//       errorMessage: '아이디와 비밀번호를 다시 확인해 주세요',
//     })
//     return
//   }

//   // Access Token 발급
//   const accessToken = jwt.sign({ userId: user.userId, nickname: user.nickname }, process.env.TOKEN_KEY, { expiresIn: '30m' })

//   // Refresh Token 발급
//   const refreshToken = jwt.sign({ userId: user.userId, nickname: user.nickname }, process.env.TOKEN_KEY, { expiresIn: '1d' })

//   // refreshToken 쿠키에 전달
//   console.log(res.cookie('refreshToken', refreshToken))

//   // accessToken body로 전달
//   return res.json({
//     token: accessToken,
//     userId: user.userId,
//   })
// })

module.exports = router
