const config = require('@config')

const jwt = require('jsonwebtoken')

const jwtConfig = {
  issuer: config.domain,
  audience: config.domain,
  algorithm: 'HS256',
  expiresIn: '7d'
}

const generateLoginJWT = (user) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        sub: user.user_id
      },
      config.auth.secret,
      jwtConfig,
      (err, token) => {
        if (err) {
          reject(err)
        } else {
          resolve(token)
        }
      }
    )
  })
}

module.exports = { generateLoginJWT }
