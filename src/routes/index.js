/**
 * @author Mingjie Jiang
 * Main router for the application, handles all routing
 */
const router = require('express').Router()
const passport = require('@libs/passport')
const authMiddlewares = require('@middlewares/auth.middlewares')

/** Directly rendered pages */
router.get('/', authMiddlewares.optionalAuth, (req, res) => {
  // If not logged in, display landing page
  if (!req.user) {
    return res.render('pages/landing', {
      title: 'Home'
    })
  }

  // Simulates user state -- see User & Task Interaction Megathread for more details
  // inprogress | completed | idle
  // TODO: Pull state from JWT to avoid db query
  let state = 'idle'

  if (state === 'idle') {
    return res.redirect('/dash')
  } else if (state === 'inprogress') {
    return res.redirect('/modules')
  }
})

// TODO: Error pages should go here.

/** Separate routers */
router.use('/auth', require('@routes/auth.routes'))

/** Force authentication for all routers below */
router.use(authMiddlewares.checkAuth)

router.use('/dash', require('@middlewares/state.middlewares').routeState, require('@routes/dash.routes'))
router.use('/account', require('@routes/account.routes'))
router.use('/debug', require('@routes/debug.routes'))
router.use('/admin', require('@routes/admin.routes'))
router.use('/modules', require('@routes/modules.routes'))

module.exports = router
