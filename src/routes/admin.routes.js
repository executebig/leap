/**
 * @author Mingjie Jiang
 * Handles all admin interactions
 */

const router = require('express').Router()
const AdminController = require('@controllers/admin.controllers')
const UserController = require('@controllers/user.controllers')
const BadgeController = require('@controllers/badge.controllers')
const ConfigController = require('@controllers/config.controllers')

const { flagMiddleware, banMiddleware } = require('@middlewares/state.middlewares')
const notFoundMiddleware = require('@middlewares/404.middlewares')

// Deny unauthorized users
router.use((req, res, next) => {
  if (!req.user) {
    notFoundMiddleware(req, res)
    return
  } else {
    res.locals.user = req.user
    next()
  }
})

// Check for session refresh flag
router.use(flagMiddleware)

// Allow admins only
router.use((req, res, next) => {
  if (!req.user.admin) {
    notFoundMiddleware(req, res)
    return
  } else {
    next()
  }
})

// set admin layout
router.use((req, res, next) => {
  res.locals.layout = 'admin'
  next()
})

router.get('/', (req, res) => {
  res.render('pages/admin/dashboard')
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
    nextPage: data.nextPage
  })
})

router.get('/ban/:id', (req, res) => {
  UserController.banUser(req.params.id)
  UserController.flagRefresh(req.params.id)
  req.flash('success', `Successfully banned user ${req.params.id}.`)
  res.redirect('/admin/users')
})

router.get('/unban/:id', (req, res) => {
  UserController.unbanUser(req.params.id)
  UserController.flagRefresh(req.params.id)
  req.flash('success', `Successfully unbanned user ${req.params.id}.`)
  res.redirect('/admin/users')
})

router.get('/refresh/:id', async (req, res) => {
  UserController.flagRefresh(req.params.id)
  req.flash('success', `Successfully flagged user ${req.params.id} for refresh.`)
  res.redirect('/admin/users')
})

router.get('/config', async (req, res) => {
  res.render('pages/admin/config', { config: await ConfigController.getKeysValues() })
})

router.post('/config', async (req, res) => {
  const curWeek = ConfigController.get('week')

  console.log(curWeek, req.body.week)
  if (!req.body.week || Math.abs(curWeek - req.body.week) > 1) {
    req.flash('error', `Week should increment / decrement by 1`)
    res.redirect('/admin/config')
    return
  }

  await ConfigController.setMultiple(req.body)
  await UserController.flagRefreshAll()

  req.flash('success', `Successfully updated config`)
  res.redirect('/admin/config')
})

router.get('/badges', async (req, res) => {
  const data = await BadgeController.listBadges(true)

  res.render('pages/admin/badges/list', {
    badge_list: data
  })
})

router.get('/badges/new', (req, res) => {
  res.render('pages/admin/badges/single')
})

router.post('/badges/new', async (req, res) => {
  const { name, code, description, icon } = req.body
  const hidden = req.body.hidden === 'true'

  const badge = await BadgeController.createBadge(name, description, icon, hidden, code)
  console.log(badge)

  req.flash('success', `Badge #${badge.badge_id} created successfully!`)
  res.redirect(`/admin/badges/edit/${badge.badge_id}`)
})

router.get('/badges/edit/:id', async (req, res) => {
  const badge = await BadgeController.getBadgeById(req.params.id)

  res.render('pages/admin/badges/single', {
    edit: true,
    badge
  })
})

router.post('/badges/edit/:id', async (req, res) => {
  const id = req.params.id
  const { name, code, description, icon } = req.body
  const hidden = req.body.hidden === 'true'

  const badge = await BadgeController.updateBadge(id, name, description, icon, hidden, code)

  req.flash('success', `Badge #${id} updated successfully!`)
  res.redirect(`/admin/badges/edit/${badge.badge_id}`)
})

module.exports = router
