/**
 * @author Mingjie Jiang
 * Handles all admin interactions
 */

const router = require('express').Router()

const db = require('@db')

/** allow admins only */
router.use((req, res, next) => {
  if (!req.user || !res.locals.user.admin) {
    res.redirect('/404')
  } else {
    res.locals.layout = 'admin'
    next()
  }
})

router.get('/', (req, res) => {
  res.render('pages/admin/dashboard')
})

module.exports = router
