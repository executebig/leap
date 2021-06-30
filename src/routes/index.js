/**
 * @author Mingjie Jiang
 * Main router for the application, handles all routing
 */
const config = require('@config')

const router = require('express').Router()
const reflash = require('@libs/reflash')
const notFoundMiddleware = require('@middlewares/404.middlewares')
const ConfigController = require('@controllers/config.controllers')

/** Set up additional context */
router.use((req, res, next) => {
  res.locals.flash = req.flash()
  res.locals.env = config.env

  next()
})

/** Live in navbar */
router.use(async (req, res, next) => {
  const liveEvent = await ConfigController.get('stageEventName')
  res.locals.liveEvent = liveEvent === '' ? null : liveEvent

  next()
})

/** Directly rendered pages */
router.use('/', require('@routes/static.routes'))

/** Separate routers */
router.use('/auth', require('@routes/auth.routes'))

if (config.env !== 'production' && config.domain.includes('localhost')) {
  // do not enable debug routes during prod
  router.use('/debug', require('@routes/debug.routes'))
}

/** Protected routes */
router.use('/admin', require('@routes/admin.routes'))
router.use('/account', require('@routes/account.routes'))
router.use('/dash', require('@routes/dash.routes'))
router.use('/modules', require('@routes/modules.routes'))
router.use('/exchange', require('@routes/exchange.routes'))

/** Catch 404s */
router.use(notFoundMiddleware)

module.exports = router
