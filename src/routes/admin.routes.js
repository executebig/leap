/**
 * @author Mingjie Jiang
 * Handles all admin interactions
 */

const router = require('express').Router()

const { flagMiddleware, banMiddleware } = require('@middlewares/state.middlewares')

const db = require('@db')

/** allow admins only */
router.use((req, res, next) => {
  if (!req.user || !req.user.admin) {
    res.redirect('/404')
  } else {
    next()
  }
})

// Check for flag sessions + disallow if banned
router.use(flagMiddleware, banMiddleware)

router.get('/', (req, res) => {
  res.render('pages/admin/dashboard', { layout: 'admin' })
})

module.exports = router
