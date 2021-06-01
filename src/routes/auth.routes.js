/** 
  Express syntax router that handles authentication through OpenID
*/

const config = require('@config')
const db = require('@db')

const router = require('express').Router()
const crypto = require('crypto')

const UserController = require('@controllers/user.controllers')
const generateLoginJWT = require('@libs/jwt').generateLoginJWT
const mailer = require('@libs/mailer')
const passport = require('@libs/passport')
const hcaptcha = require('@libs/hCaptcha')
const redis = require('@db/redis').client
const io = require('@socket').io()

const TOKEN_EXPIRATION = 15 * 60 // 15 mins
const HASH_LENGTH = 12

const stopLoggedInUsers = (req, res, next) => {
  if (req.user) {
    req.flash('error', 'You are already logged in!')
    res.redirect('/dash')
  }
}

/** /login accepts the token only. hashes should be request to /magic */
router.get(
  '/login',
  stopLoggedInUsers,
  (req, res, next) => {
    const { incorrectToken, token } = req.query

    if (token) {
      res.cookie('_jwt', token, {
        httpOnly: true,
        secure: config.env === 'production',
        maxAge: 12 * 3600 * 1000
      })
      next()
    } else {
      req.flash('error', 'Invalid token. Please try logging in again.')
      res.redirect('/')
    }
  },
  passport.authenticate('jwt', {
    successReturnToOrRedirect: '/dash',
    failureRedirect: '/',
    failureFlash: 'Invalid token. Please try logging in again.'
  }),

  (req, res) => {
    console.log(token)
  }
)

/** /magic accepts the hash and translates it to the token if possible */
router.get('/magic', stopLoggedInUsers, (req, res) => {
  const hash = req.query.hash

  if (!hash || hash.length !== HASH_LENGTH) {
    req.flash('error', 'Invalid login link. Please try logging in again.')
    return res.redirect('/')
  }

  redis
    .get(`AUTH_${hash}`)
    .then((token) => {
      if (token) {
        redis.del(`AUTH_${hash}`)
        io.to(`AUTH_${hash}`).emit('authenticate', token)
        // res.redirect('/auth/login?token=' + token)
        return res.redirect('/auth/verified')
      } else {
        req.flash('error', 'Invalid login link. Please try logging in again.')
        return res.redirect('/')
      }
    })
    .catch((err) => {
      req.flash('error', 'Error mapping token. Please try logging in again.')
      return res.redirect('/')
    })
})

const generateTokenHash = (token) => {
  return crypto.createHash('sha1').update(token).digest('hex').substring(0, HASH_LENGTH)
}

router.post('/login', stopLoggedInUsers, hcaptcha.validate, async (req, res) => {
  const email = req.body.email.toLowerCase()
  const validate = require('@libs/validateEmail')

  if (!validate(email)) {
    return req.flash('error', 'Invalid email format. Please check your input and try again!')
  }

  // valid email from this point on
  const user = await UserController.getOrCreateUserByEmail(email)

  if (user.state === 'invited') {
    await UserController.updateUser(user.user_id, { state: 'onboarding' })
  }

  // user with $email now exists, send magic link
  generateLoginJWT(user)
    .then((token) => {
      const hash = generateTokenHash(token)
      mailer.sendMagic(email, hash)
      redis.set(`AUTH_${hash}`, token, 'ex', TOKEN_EXPIRATION)
      res.redirect(`/auth/pending?email=${email}&hash=${hash}`)
    })
    .catch((error) => {
      req.flash('error', 'Error generating token: ' + error.message)
      res.redirect('/')
    })
})

router.get('/logout', (req, res) => {
  res.clearCookie('_jwt')
  req.session.destroy()

  res.redirect('/')
})

router.get('/pending', stopLoggedInUsers, (req, res) => {
  const email = req.query.email
  const hash = req.query.hash

  res.render('pages/auth/pending', {
    email,
    hash
  })
})

router.get('/verified', stopLoggedInUsers, (req, res) => {
  res.render('pages/auth/verified')
})

module.exports = router
