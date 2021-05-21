/**
 * @author Mingjie Jiang
 * Main router for the application, handles all routing
 */
const router = require('express').Router()
const passport = require('@libs/passport')
const authMiddlewares = require('@middlewares/auth.middlewares')

/** pass user context to each page load */
router.use((req, res, next) => {
  res.locals.user = req.user
  next()
})

/** Directly rendered pages */
router.get('/', authMiddlewares.optionalAuth, (req, res) => {
  return res.render('pages/landing', {
    title: 'Home'
  })
})

// TODO: Error pages should go here.

/** Separate routers */
router.use('/auth', require('@routes/auth'))

/** Force authentication for all routers below */
router.use(authMiddlewares.checkAuth)

router.use('/dash', require('@routes/dash'))
router.use('/debug', require('@routes/debug'))
router.use('/admin', require('@routes/admin'))

module.exports = router
