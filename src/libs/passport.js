/**
    @author Mingjie Jiang
    @source https://reallifeprogramming.com/how-to-implement-magic-link-authentication-using-jwt-in-node-8193196bcd78
    Configure passport
 */

const config = require('@config')

const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const UserController = require('@controllers/user.controllers')

const jwtOptions = {
  issuer: config.domain,
  audience: config.domain,
  secretOrKey: config.auth.secret,
  algorithms: 'HS256',
  jwtFromRequest: (req) => {
    if (req.query.token) {
      return ExtractJwt.fromUrlQueryParameter('token')(req)
    } else {
      return req && req.cookies['_jwt']
    }
  }
}

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})

passport.use(
  'jwt',
  new JwtStrategy(jwtOptions, (token, done) => {
    const uuid = token.sub

    UserController.getUserById(uuid).then((user) => {
      if (user) {
        done(null, user)
      } else {
        done(null, false)
      }
    })
  })
)

module.exports = passport
