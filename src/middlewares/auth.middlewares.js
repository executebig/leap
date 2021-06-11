const config = require('@config')

const passport = require('@libs/passport')
const UserController = require('@controllers/user.controllers')
const generateLoginJWT = require('@libs/jwt').generateLoginJWT

exports.checkAuth = (req, res, next) => {
  passport.authenticate('_jwt')(req, res, () => {
    if (!req.user) {
      req.flash('error', 'Please log in first!')
      res.redirect('/')
    } else {
      res.locals.user = req.user
      next()
    }
  })
}

exports.optionalAuth = (req, res, next) => {
  if (req.user) {
    // If session cookie exists
    res.locals.user = req.user
    next()
  } else if (req.cookies['_jwt']) {
    // If jwt cookie exists
    passport.authenticate('_jwt')(req, res, () => {
      res.locals.user = req.user
      next()
    })
  } else {
    // Otherwise, not authed
    next()
  }
}
