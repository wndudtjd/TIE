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
    const { userId } = jwt.verify(authToken, process.env.TOKEN - KEY)

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
