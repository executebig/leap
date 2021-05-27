/**
 * @author Mingjie Jiang
 * Main router for the application, handles all routing
 */
const config = require('@config')

const router = require('express').Router()
const passport = require('@libs/passport')
const authMiddlewares = require('@middlewares/auth.middlewares')

/** Directly rendered pages */
router.get('/', authMiddlewares.optionalAuth, (req, res) => {
  res.render('pages/landing', { titleOverride: true })
})

// TODO: Error pages should go here.

/** Separate routers */
router.use('/auth', require('@routes/auth.routes'))

if (!config.production) {
  // do not enable debug routes during prod
  router.use('/debug', require('@routes/debug.routes'))
}

/** Force authentication for all routers below */
router.use(authMiddlewares.checkAuth)

router.get('/chill', (req, res) => {
  return res.render('pages/chill')
})

router.use(
  '/dash',
  require('@middlewares/state.middlewares').routeState,
  require('@routes/dash.routes')
)
router.use('/account', require('@routes/account.routes'))
router.use('/admin', require('@routes/admin.routes'))
router.use('/modules', require('@routes/modules.routes'))

module.exports = router
