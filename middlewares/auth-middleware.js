const jwt = require('jsonwebtoken')
const { Users } = require('../models')
require('dotenv').config()

module.exports = async (req, res, next) => {
  const { authorization } = req.cookies

  const [authType, authToken] = (authorization ?? '').split(' ')

  if (authType !== 'Bearer' || !authToken) {
    return res.status(401).json({
      errorMessage: '로그인 후에 사용하세요.',
    })
  }

  try {
    const { userId } = jwt.verify(authToken, process.env.TOKEN_KEY)

    const user = await Users.findOne({ where: { userId } })

    res.locals.user = user
    next()
  } catch (err) {
    console.error(err)

    return res.status(401).json({
      errorMessage: '로그인 후에 사용하세요',
    })
  }
}
/* ------------------------------------------------------------------------------------- */
// Access Token, Refresh Token
// module.exports = (req, res, next) => {
//   const { authorization } = req.headers

//   const { refreshToken } = req.cookies

//   const [authType, authToken] = (authorization ?? '').split(' ')
//   if (authType !== 'Bearer' || refreshToken === null) {
//     res.status(403).send({ errorMessage: '로그인 후 이용 가능한 기능입니다.' })
//     return
//   }

//   try {
//     const { userId } = jwt.verify(authToken, process.env.TOKEN_KEY)
//     Users.findByPk(userId).then((user) => {
//       res.locals.user = user
//       next()
//     })
//   } catch (error) {
//     // 리프래쉬 토큰이 만료되었는지 부터 확인
//     if (validateRefreshToken(refreshToken) === false) {
//       res.status(401).send({ errorMessage: '로그인 후 이용 가능한 기능입니다.' })
//       return
//     }

//     // 만료 안되었습면 그걸로 사용자 정보 찾아서 넘겨준다.
//     const { userId } = jwt.verify(refreshToken, process.env.TOKEN_KEY)
//     Users.findByPk(userId).then((user) => {
//       res.locals.user = user
//       next()
//     })
//   }
// }

// // RefreshToken 유효성 검증
// function validateRefreshToken(refreshToken) {
//   try {
//     jwt.verify(refreshToken, process.env.TOKEN_KEY)
//     return true
//   } catch (error) {
//     return false
//   }
// }
