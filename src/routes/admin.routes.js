/**
 * @author Mingjie Jiang
 * Handles all admin interactions
 */

const router = require('express').Router()
const AdminController = require('@controllers/admin.controllers')
const UserController = require('@controllers/user.controllers')
const { flagMiddleware, banMiddleware } = require('@middlewares/state.middlewares')

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

router.get('/users/:page?', async (req, res) => {
  const orderBy = req.query.by || 'user_id'
  const order = req.query.order || 'ASC'

  const data = await AdminController.listUsers(orderBy, order, req.params.page)

  res.render('pages/admin/users', {
    orderBy,
    order,
    user_list: data.users,
    prevPage: data.prevPage,
    nextPage: data.nextPage,
  })
})

router.get('/refresh/:id', async (req, res) => {
  UserController.flagRefresh(req.params.id)
  req.flash('success', `Successfully flagged user ${req.params.id} for refresh.`)
  res.redirect('/admin/users')
})

module.exports = router
