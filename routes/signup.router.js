const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const { Users } = require('../models')

// 아이디 중복체크 API
router.post('/signup/check', async (req, res) => {
  try {
    const { userId } = req.body
    const existUsers = await Users.findOne({
      where: {
        userId,
      },
    })

    let checkuserId = /^[a-zA-Z0-9]{3,12}$/

    if (!checkuserId.test(userId)) {
      res.status(400).send({
        errorMessage: '아이디 형식이 올바르지 않습니다.',
      })
      return
    }
    if (userId.length === 0) {
      res.status(400).send({
        errorMessage: '아이디를 입력해주세요',
      })
      return
    }
    if (existUsers) {
      res.status(400).send({
        duplicationResult: true,
        errorMessage: '중복된 아이디가 존재합니다.',
      })
      return
    }
    res.status(201).send({
      duplicationResult: false,
      message: '사용가능한 아이디 입니다.',
    })
  } catch (err) {
    console.error(err)

    res.status(400).send({
      errorMessage: '요청한 데이터 형식이 올바르지 않습니다.',
    })
  }
})

// 회원가입 API
router.post('/signup', async (req, res) => {
  const { userId, nickname, password, confirm } = req.body

  let checkNickname = /^[a-zA-Z가-힣0-9]{2,10}$/
  let checkPassword = /^[a-zA-Z0-9]{8,30}$/

  const hashedPw = bcrypt.hashSync(password, 10)
  try {
    // 비밀 번호와 정규식 비교
    if (!checkPassword.test(password)) {
      res.status(400).send({
        errorMessage: '비밀번호 형식이 올바르지 않습니다.',
      })
      return
    }

    if (!checkNickname.test(nickname)) {
      res.status(400).send({
        errorMessage: '닉네임 형식이 올바르지 않습니다.',
      })
      return
    }

    // 비밀번호와 확인비번이 다른경우
    if (password !== confirm) {
      res.status(400).send({
        errorMessage: '패스워드가 패스워드 확인란과 동일하지 않습니다.',
      })
      return
    }

    const user = new Users({ userId, nickname, password: hashedPw })
    await user.save()

    res.status(201).send({
      message: '회원가입 성공',
    })
  } catch (err) {
    console.error(err)

    res.status(400).send({
      errorMessage: '요청한 데이터 형식이 올바르지 않습니다.',
    })
  }
})

module.exports = router
