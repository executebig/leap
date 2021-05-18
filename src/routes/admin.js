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
    return res.redirect('/')
  }
  res.locals.admin_zone = true
  next()
})

router.get('/', (req, res) => {
  res.send({ admin: 'success' })
})

module.exports = router
