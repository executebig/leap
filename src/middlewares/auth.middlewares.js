const config = require('@config')

const passport = require('@libs/passport')
const UserController = require('@controllers/user.controllers')
const generateLoginJWT = require('@libs/jwt').generateLoginJWT

exports.checkAuth = (req, res, next) => {
  passport.authenticate('_jwt')(req, res, () => {
    res.locals.user = req.user
    next()
  })
}

exports.optionalAuth = (req, res, next) => {
  const auth = req.cookies['_jwt']

  if (auth) {
    return this.checkAuth(req, res, next)
  }

  next()
}
