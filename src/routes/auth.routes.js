/**
  Express syntax router that handles authentication through OpenID
*/

const config = require('@config')
const db = require('@db')

const router = require('express').Router()
const crypto = require('crypto')
const { customAlphabet } = require('nanoid')
const RateLimit = require('express-rate-limit')
const RedisStore = require('rate-limit-redis')

const UserController = require('@controllers/user.controllers')
const generateLoginJWT = require('@libs/jwt').generateLoginJWT
const mailer = require('@libs/mailer')
const passport = require('@libs/passport')
const hcaptcha = require('@libs/hCaptcha')
const reflash = require('@libs/reflash')
const redis = require('@db/redis').client

const TOKEN_EXPIRATION = 15 * 60 // 15 mins
const CODE_LENGTH = 7
const nanoid = customAlphabet('123456789ABCDEFGHIJKLMNPQRSTUVWXYZ', 3)

const stopLoggedInUsers = (req, res, next) => {
  if (req.user) {
    req.flash('error', 'You are already logged in!')
    res.redirect('/dash')
  } else {
    next()
  }
}

/** /login accepts the token only. code should be request to /magic */
router.get(
  '/login',
  stopLoggedInUsers,
  (req, res, next) => {
    const { incorrectToken, token } = req.query

    if (token) {
      res.cookie('_jwt', token, {
        httpOnly: true,
        secure: config.env === 'production',
        maxAge: 168 * 3600 * 1000 // a week
      })
      reflash(req, res)
      next()
    } else {
      req.flash('error', 'Invalid token. Please try logging in again.')
      res.redirect('/')
    }
  },

  passport.authenticate('jwt', {
    failureRedirect: '/',
    failureFlash: 'Invalid token. Please try logging in again.'
  }),

  async (req, res) => {
    // success! exchange session
    const old_session = await UserController.exchangeSession(req.user.user_id, req.session.id)
    if (old_session) {
      // destroy old session
      redis.del(`sess:${old_session}`)
    }

    res.redirect(req.session.redirectTo || '/dash')
    delete req.session.redirectTo
  }
)

// prevent bulk attacks on the /magic endpoint
const magicLimiter = RateLimit({
  store: new RedisStore({
    client: require('@db/redis').client
  }),
  windowMs: 60 * 10 * 1000, // 10 min
  max: 10,
  handler: (req, res) => {
    req.flash('error', 'Too many attempts. Please try again in 10 minutes!')
    res.redirect('/login')
  }
})

/** /magic accepts the magic code and translates it to the token if possible */
router.get('/magic', magicLimiter, stopLoggedInUsers, (req, res) => {
  const magic_code = req.query.code

  if (!magic_code || magic_code.length !== CODE_LENGTH) {
    req.flash('error', 'Invalid login link. Please try logging in again.')
    return res.redirect('/login')
  }

  redis
    .get(`magic:${magic_code}`)
    .then((token) => {
      if (token) {
        redis.del(`magic:${magic_code}`)
        req.flash('success', 'Welcome! You are now logged in.')
        return res.redirect('/auth/login?token=' + token)
      } else {
        req.flash('error', 'Invalid login link. Please try logging in again.')
        return res.redirect('/login')
      }
    })
    .catch((err) => {
      req.flash('error', 'Error mapping token. Please try logging in again.')
      return res.redirect('/login')
    })
})

const generateMagicCode = () => {
  return nanoid() + '-' + nanoid()
}

router.post('/login', stopLoggedInUsers, hcaptcha.validate, async (req, res) => {
  const email = req.body.email.toLowerCase()
  const validate = require('@libs/validateEmail')

  if (!validate(email)) {
    req.flash('error', 'Invalid email format. Please check your input and try again!')
    return res.redirect('/login')
  }

  // valid email from this point on
  const user = await UserController.getOrCreateUserByEmail(email)

  if (user.state === 'invited') {
    await UserController.updateUser(user.user_id, { state: 'onboarding' })
  }

  // user with $email now exists, send magic link
  generateLoginJWT(user)
    .then((token) => {
      const magic_code = generateMagicCode(token)
      mailer.sendMagic(email, magic_code)
      redis.set(`magic:${magic_code}`, token, 'ex', TOKEN_EXPIRATION)
      res.redirect(`/auth/code?email=${email}&sent=true`)
    })
    .catch((error) => {
      req.flash('error', 'Error generating token: ' + error.message)
      res.redirect('/login')
    })
})

router.get('/logout', (req, res) => {
  res.clearCookie('_jwt')
  req.session.destroy()

  res.redirect('/')
})

router.get('/code', stopLoggedInUsers, (req, res) => {
  res.render('pages/auth/code', {
    hide_auth: true,
    email: req.query.email,
    sent: req.query.sent ? true : false
  })
})

router.post('/code', stopLoggedInUsers, hcaptcha.validate, (req, res) => {
  const code = req.body.code.toUpperCase()
  res.redirect('/auth/magic/?code=' + code)
})

module.exports = router
