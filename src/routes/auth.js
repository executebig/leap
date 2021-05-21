/** 
  Express syntax router that handles authentication through OpenID
*/

const config = require('@config')
const db = require('@db')

const router = require('express').Router()
const UserController = require('@controllers/user.controllers')
const generateLoginJWT = require('@libs/jwt').generateLoginJWT
const mailer = require('@libs/mailer')
const passport = require('@libs/passport')

router.get(
  '/login',
  (req, res, next) => {
    const { incorrectToken, token } = req.query

    if (token) {
      next()
    } else {
      res.render('pages/account/invalid-token', { title: 'Invalid Token' })
    }
  },
  passport.authenticate('jwt', {
    successReturnToOrRedirect: '/dash',
    failureRedirect: '/login?incorrectToken=true'
  }),

  (req, res) => {}
)

router.post('/login', async (req, res) => {
  const email = req.body.email.toLowerCase()
  const validate = require('@libs/validateEmail')

  if (!validate(email)) {
    return req.flash('error', 'Invalid email format. Please check your input and try again!')
  }

  // valid email from this point on
  const user = await UserController.getOrCreateUserByEmail(email)

  // user with $email now exists, send magic link
  generateLoginJWT(user).then((token) => {
    mailer.sendMagic(email, token)
  })

  res.redirect('/auth/link-sent?email=' + email)
})

router.get('/link-sent', (req, res) => {
  let email = req.query.email
  res.render('pages/auth/link-sent', {
    email
  })
})

module.exports = router
