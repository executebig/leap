/**
 * @author Mingjie Jiang
 * Handles all admin interactions
 */

const router = require('express').Router()
const AdminController = require('@controllers/admin.controllers')
const UserController = require('@controllers/user.controllers')
const BadgeController = require('@controllers/badge.controllers')
const ConfigController = require('@controllers/config.controllers')
const ProjectController = require('@controllers/project.controllers')
const ModuleController = require('@controllers/module.controllers')

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

/** Badges */

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

/** Projects */
router.get('/projects', async (req, res) => {
  res.render('pages/admin/projects/list', {
    projects: await ProjectController.getProjects()
  })
})

router.get('/projects/new', async (req, res) => {
  res.render('pages/admin/projects/single')
})

router.post('/projects/new', async (req, res) => {
  let { title, description, type, thumbnail_url, enabled } = req.body
  enabled = !!enabled

  const { project_id } = await ProjectController.createProject({
    title,
    description,
    type,
    thumbnail_url,
    enabled
  })

  req.flash('success', `Project #${project_id} created successfully!`)
  res.redirect(`/admin/projects/edit/${project_id}`)
})

router.get('/projects/edit/:id', async (req, res) => {
  const project = await ProjectController.getProjectById(req.params.id)
  const modules = await ModuleController.getModulesByProjectId(req.params.id)

  res.render('pages/admin/projects/single', {
    edit: true,
    project,
    modules
  })
})

router.post('/projects/edit/:id', async (req, res) => {
  let { title, description, type, thumbnail_url, enabled } = req.body
  enabled = !!enabled

  const { project_id } = await ProjectController.updateProject(req.params.id, {
    title,
    description,
    type,
    thumbnail_url,
    enabled
  })

  req.flash('success', `Project #${project_id} updated successfully!`)
  res.redirect(`/admin/projects/edit/${project_id}`)
})

/** Modules */
router.get('/modules', async (req, res) => {
  res.render('pages/admin/modules/list', {
    modules: await ModuleController.getModules()
  })
})

router.get('/modules/new', async (req, res) => {
  const project_id = req.query.project_id

  if (!project_id) {
    req.flash('error', `Missing project_id`)
    res.redirect(`/admin/modules/edit/${module_id}`)
    return
  }

  const project = await ProjectController.getProjectById(project_id)

  res.render('pages/admin/modules/single', {
    project
  })
})

router.post('/modules/new', async (req, res) => {
  let { title, description, content, points, required, enabled, project_id } = req.body

  if (!project_id) {
    req.flash('error', `Missing project_id`)
    res.redirect(`/admin/modules/edit/${module_id}`)
    return
  }

  required = !!required
  enabled = !!enabled

  const { module_id } = await ModuleController.createModule(
    {
      title,
      description,
      content,
      points,
      required,
      enabled
    },
    project_id
  )

  req.flash('success', `Module #${module_id} created successfully!`)
  res.redirect(`/admin/modules/edit/${module_id}`)
})

router.get('/modules/edit/:id', async (req, res) => {
  const module = await ModuleController.getModuleById(req.params.id)
  const project = await ProjectController.getProjectById(module.project_id)

  res.render('pages/admin/modules/single', {
    edit: true,
    module, project
  })
})

router.post('/modules/edit/:id', async (req, res) => {
  let { title, description, content, points, required, enabled } = req.body

  required = !!required
  enabled = !!enabled

  const { module_id } = await ModuleController.updateModule(req.params.id, {
    title,
    description,
    content,
    points,
    required,
    enabled
  })

  req.flash('success', `Module #${module_id} updated successfully!`)
  res.redirect(`/admin/modules/edit/${module_id}`)
})

module.exports = router
