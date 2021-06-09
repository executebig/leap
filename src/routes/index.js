/**
 * @author Mingjie Jiang
 * Main router for the application, handles all routing
 */
const config = require('@config')

const router = require('express').Router()
const reflash = require('@libs/reflash')

/** Set up additional context */
router.use((req, res, next) => {
  res.locals.flash = req.flash()
  res.locals.env = config.env

  next()
})

/** Directly rendered pages */
router.use('/', require('@routes/static.routes'))

/** Separate routers */
router.use('/auth', require('@routes/auth.routes'))

if (config.env !== 'production') {
  // do not enable debug routes during prod
  router.use('/debug', require('@routes/debug.routes'))
}

/** Protected routes */
router.use(require('@routes/protected.routes'))

/** Catch 404s */
router.use((req, res) => {
  reflash(req, res)
  res.redirect('/404')
})

module.exports = router
