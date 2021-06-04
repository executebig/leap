/**
 * @author Mingjie Jiang
 * Main router for the application, handles all routing
 */
const config = require('@config')

const router = require('express').Router()
const passport = require('@libs/passport')
const authMiddlewares = require('@middlewares/auth.middlewares')
const reflash = require('@libs/reflash')

/** Set up additional context */
router.use((req, res, next) => {
  res.locals.flash = req.flash()
  res.locals.env = config.env

  next()
})

/** Directly rendered pages */
router.use('/', require('@routes/static.routes'))

// TODO: Error pages should go here.

/** Separate routers */
router.use('/auth', require('@routes/auth.routes'))

if (!config.env === 'production') {
  // do not enable debug routes during prod
  router.use('/debug', require('@routes/debug.routes'))
}

/** Force authentication for all routers below */
router.use(authMiddlewares.checkAuth)

router.use(
  '/dash',
  require('@middlewares/state.middlewares').routeState,
  require('@routes/dash.routes')
)
router.use('/account', require('@routes/account.routes'))
router.use('/admin', require('@routes/admin.routes'))
router.use('/modules', require('@routes/modules.routes'))

// Catch 404s
router.use((req, res, next) => {
  reflash(req, res)
  res.redirect('/404')
})

module.exports = router
