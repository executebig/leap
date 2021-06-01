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

    if (req.user) {
      return res.redirect('/dash')
    } else {
      return res.redirect('/')
    }
  } else {
    res.locals.layout = 'admin'
    next()
  }
})

router.get('/', (req, res) => {
  res.render('pages/admin/dashboard')
})

module.exports = router
