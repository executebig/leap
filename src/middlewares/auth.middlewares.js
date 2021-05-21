const passport = require('@libs/passport')

exports.checkAuth = (req, res, next) => {
  passport.authenticate('jwt')

  res.locals.user = req.user
  next()
}

exports.optionalAuth = (req, res, next) => {
  const auth = req.header('Authorization')

  if (auth) {
    this.checkAuth(req, res, next)
  }

  next()
}
