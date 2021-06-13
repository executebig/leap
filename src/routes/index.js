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

if (config.env !== 'production' && config.domain.includes('localhost')) {
  // do not enable debug routes during prod
  router.use('/debug', require('@routes/debug.routes'))
}

/** Protected routes */
router.use('/admin', require('@routes/admin.routes'))
router.use('/account', require('@routes/account.routes'))
router.use('/dash', require('@routes/dash.routes'))
router.use('/modules', require('@routes/modules.routes'))

/** Catch 404s */
router.use((req, res) => {
  reflash(req, res)
  res.status(404)

  if (req.method === 'GET') {
    res.render('pages/status/404')
  } else {
    res.end('404 Not Found')
  }
})

module.exports = router
