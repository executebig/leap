/**
 * @author Mingjie Jiang
 * Handles all admin interactions
 */

const router = require('express').Router()

const db = require('@db')

/** allow admins only */
router.use((req, res, next) => {
  if (!res.locals.user.admin) {
    req.flash('error', 'You do not have permission to access this page.')
    res.redirect('/')
  }

  res.locals.layout = 'admin'
  next()
})

router.get('/', (req, res) => {
  res.render('pages/admin/dashboard')
})

module.exports = router
