/**
 * @author Mingjie Jiang
 * Handles all admin interactions
 */

const router = require('express').Router()
const Bugsnag = require('@bugsnag/js')

const AdminController = require('@controllers/admin.controllers')
const UserController = require('@controllers/user.controllers')
const BadgeController = require('@controllers/badge.controllers')
const ConfigController = require('@controllers/config.controllers')
const ProjectController = require('@controllers/project.controllers')
const ModuleController = require('@controllers/module.controllers')
const SubmissionController = require('@controllers/submission.controllers')
const ExchangeController = require('@controllers/exchange.controllers')
const OrderController = require('@controllers/order.controllers')

const { flagMiddleware, banMiddleware } = require('@middlewares/state.middlewares')
const notFoundMiddleware = require('@middlewares/404.middlewares')

const mailer = require('@libs/mailer')
const db = require('@db')

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

  res.render('pages/admin/users/list', {
    orderBy,
    order,
    user_list: data.users,
    prevPage: data.prevPage,
    nextPage: data.nextPage
  })
})

router.post('/users/search', async (req, res) => {
  const scope = req.body.scope
  let query = req.body.query

  if (scope === 'user_id') {
    query = parseInt(query)

    if (isNaN(query)) {
      req.flash('error', 'Invalid query.')
      return res.redirect('/admin/users')
    }
  } else {
    query = query.toLowerCase()
  }

  let data

  if (scope === 'names') {
    data = await AdminController.searchUsersByName(query, req.params.page)
  } else {
    data = await AdminController.searchUsers(scope, query, req.params.page)
  }

  res.render('pages/admin/users/list', {
    query,
    scope,
    user_list: data.users,
    prevPage: data.prevPage,
    nextPage: data.nextPage
  })
})

router.get('/users/control/:id', async (req, res) => {
  const [target, all_badges] = await Promise.all([
    UserController.getUserById(req.params.id),
    BadgeController.listBadges(true)
  ])
  const badges = await BadgeController.getBadgesByIds(target.badges)

  if (!target) {
    notFoundMiddleware(req, res)
  } else {
    res.render('pages/admin/users/control', {
      target,
      badges,
      all_badges
    })
  }
})

router.post('/users/control/badge/:id', async (req, res) => {
  if (req.query.remove) {
    await UserController.removeBadge(req.params.id, req.body.badge)
  } else {
    await UserController.grantBadge(req.params.id, req.body.badge)
  }

  req.flash('success', `Badge ${req.query.remove ? 'removal' : 'grant'} completed!`)
  res.redirect('/admin/users')
})

router.get('/users/disqualify/:id', async (req, res) => {
  const target = await UserController.getUserById(req.params.id)

  res.render('pages/admin/users/dq', {
    target
  })
})

router.post('/users/disqualify/:id', async (req, res) => {
  const user = await UserController.getUserById(req.params.id)
  if (user.no_shipping) {
    // already not eligible
    req.flash('error', `User #${user.user_id} is already ineligible for shipping!`)
  } else {
    mailer.sendShippingDQ(user.email, user.display_name, req.body.reason)
    UserController.updateUser(req.params.id, { no_shipping: true })

    req.flash(
      'success',
      `Successfully disqualified ${user.user_id} for shipping & sent notification.`
    )
    res.redirect('/admin/users')
  }
})

router.get('/users/requalify/:id', async (req, res) => {
  const [target, original_address] = await Promise.all([
    UserController.getUserById(req.params.id),
    UserController.getAddressById(req.params.id)
  ])

  res.render('pages/admin/users/requalify', {
    target,
    original_address
  })
})

router.post('/users/requalify/:id', async (req, res) => {
  const user = await UserController.getUserById(req.params.id)

  if (!user.no_shipping) {
    // already not eligible
    req.flash('error', `User #${user.user_id} is already eligible for shipping!`)
  } else {
    UserController.updateUser(req.params.id, { no_shipping: false, address: req.body.address })

    req.flash('success', `Successfully requalified ${user.user_id} for shipping.`)
    res.redirect('/admin/users')
  }
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

router.post('/config', async (req, res, next) => {
  const badges = await BadgeController.listBadgeIds()

  if (req.body.weeklyBadges.trim() !== '') {
    const weeklyBadges = [...req.body.weeklyBadges.split(',').map((e) => parseInt(e.trim(), 10))]

    if (weeklyBadges.some((id) => isNaN(id) || !badges.includes(id))) {
      req.flash('error', 'Invalid weekly badges')
      res.redirect(req.originalUrl)
      return
    }

    req.body.weeklyBadges = String(weeklyBadges)
  } else {
    req.body.weeklyBadges = ''
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
  res.redirect(`/admin/badges`)
})

/** Projects */
router.get('/projects', async (req, res) => {
  res.render('pages/admin/projects/list', {
    projects: await ProjectController.listProjects()
  })
})

router.get('/projects/new', (req, res) => {
  res.render('pages/admin/projects/single')
})

router.post('/projects/new', async (req, res) => {
  let { title, description, type, thumbnail_url, enabled, hardware, completion_badges } = req.body
  enabled = !!enabled
  hardware = !!hardware

  if (completion_badges.trim() !== '') {
    // Badge sanity checks
    const badges = await BadgeController.listBadgeIds()

    completion_badges = [
      ...new Set(completion_badges.split(',').map((e) => parseInt(e.trim(), 10)))
    ]
    if (completion_badges.some((id) => isNaN(id) || !badges.includes(id))) {
      req.flash('error', 'Invalid completion badges')
      res.redirect(req.originalUrl)
      return
    }
  } else {
    completion_badges = []
  }

  const { project_id } = await ProjectController.createProject({
    title,
    description,
    type,
    thumbnail_url,
    enabled,
    hardware,
    completion_badges
  })

  req.flash('success', `Project #${project_id} created successfully!`)
  res.redirect(`/admin/projects/edit/${project_id}`)
})

router.get('/projects/edit/:id', async (req, res) => {
  const project = await ProjectController.getProjectById(req.params.id)
  const modules = await ModuleController.getModulesByProjectId(req.params.id)

  req.session.redirectTo = req.originalUrl

  res.render('pages/admin/projects/single', {
    edit: true,
    project,
    modules
  })
})

router.post('/projects/edit/:id', async (req, res) => {
  let { title, description, type, thumbnail_url, enabled, hardware, completion_badges } = req.body
  enabled = !!enabled
  hardware = !!hardware

  if (completion_badges.trim() !== '') {
    // Badge sanity checks
    const badges = await BadgeController.listBadgeIds()

    completion_badges = [
      ...new Set(completion_badges.split(',').map((e) => parseInt(e.trim(), 10)))
    ]
    if (completion_badges.some((id) => isNaN(id) || !badges.includes(id))) {
      req.flash('error', 'Invalid completion badges')
      res.redirect(req.originalUrl)
      return
    }
  } else {
    completion_badges = []
  }

  const { project_id } = await ProjectController.updateProject(req.params.id, {
    title,
    description,
    type,
    thumbnail_url,
    enabled,
    hardware,
    completion_badges
  })

  req.flash('success', `Project #${project_id} updated successfully!`)
  res.redirect(`/admin/projects`)
})

/** Modules */
router.get('/modules', async (req, res) => {
  delete req.session.redirectTo

  res.render('pages/admin/modules/list', {
    modules: await ModuleController.listModules()
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
    project,
    project_id
  })
})

router.post('/modules/new', async (req, res) => {
  let { title, description, content, points, required, enabled, project_id } = req.body

  if (!project_id) {
    req.flash('error', `Missing project_id`)
    res.redirect(req.originalUrl)
    return
  }

  required = !!required
  enabled = !!enabled

  const { module_id } = await ModuleController.createModule(project_id, {
    title,
    description,
    content,
    points,
    required,
    enabled
  })

  req.flash('success', `Module #${module_id} created successfully!`)
  res.redirect(req.session.redirectTo || '/admin/modules')
  delete req.session.redirectTo
})

router.get('/modules/edit/:id', async (req, res) => {
  const module = await ModuleController.getModuleById(req.params.id)
  const project = await ProjectController.getProjectById(module.project_id)

  res.render('pages/admin/modules/single', {
    edit: true,
    module,
    project
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
  res.redirect(req.session.redirectTo || '/admin/modules')
  delete req.session.redirectTo
})

/** Submissions */
router.get('/submissions', async (req, res) => {
  const projects = (
    await db.query(`
    SELECT projects.*, count(submissions) num_submissions FROM projects
    LEFT JOIN submissions ON
      projects.project_id = submissions.project_id AND
      submissions.state = 'pending'
    GROUP BY projects.project_id
    ORDER BY num_submissions DESC
  `)
  )?.rows

  res.render('pages/admin/submissions/projects', {
    projects
  })
})

router.get('/submissions/edit/:id', async (req, res) => {
  const submission = (
    await db.query(
      `
    SELECT
      submissions.*,
      m.title module_title,
      p.title project_title
      FROM submissions
    INNER JOIN modules m on m.module_id = submissions.module_id
    inner join projects p on p.project_id = m.project_id
    WHERE submission_id = $1
  `,
      [req.params.id]
    )
  )?.rows?.[0]

  res.render('pages/admin/submissions/single', { submission })
})

router.get('/submissions/:project_id', async (req, res) => {
  const { project_id } = req.params
  const modules = (
    await db.query(`
    SELECT modules.*, count(submissions) num_submissions FROM modules
    LEFT JOIN submissions ON
      modules.module_id = submissions.module_id AND
      submissions.state = 'pending'
    WHERE
      modules.project_id = $1
    GROUP BY modules.module_id, submissions.state
    ORDER BY num_submissions DESC
  `, [project_id])
  )?.rows

  res.render('pages/admin/submissions/modules', {
    modules,
    project_id
  })
})

router.get('/submissions/:project_id/:module_id/:page?', async (req, res) => {
  req.session.redirectTo = req.originalUrl

  let { project_id, module_id, page } = req.params

  const filter = req.query.filter || 'pending'
  const orderBy = req.query.by || 'created_at'
  const order = req.query.order || 'ASC'

  const { submissions, prevPage, nextPage } = await AdminController.listSubmissions(
    filter,
    orderBy,
    order,
    project_id,
    module_id,
    page
  )

  res.render('pages/admin/submissions/list', {
    filter,
    orderBy,
    order,
    submissions,
    prevPage,
    nextPage,
    project_id,
    module_id
  })
})

router.post('/submissions/edit/:id', async (req, res) => {
  let { state, comments } = req.body

  const submission = await SubmissionController.updateSubmission(req.params.id, { state, comments })

  if (state === 'rejected') {
    mailer.sendSubmissionRejection(submission, comments)
  } else if (state === 'accepted') {
    const module = await ModuleController.getModuleById(submission.module_id)

    // Grant module points
    await UserController.grantPoints(submission.user_id, module.points)

    if (module.required) {
      const modulesRequired = await ProjectController.getRequiredModuleIdsByProjectId(
        submission.project_id
      )
      const modulesAccepted = (
        await SubmissionController.getLatestSubmissionsByUserId(submission.user_id)
      )
        .filter((e) => e.state === 'accepted')
        .map((e) => e.module_id)

      // Grant additional points if every required module is completed
      if (modulesRequired.every((module_id) => modulesAccepted.includes(module_id))) {
        await UserController.grantPoints(
          submission.user_id,
          (await ConfigController.get('pointsPerProject')) || 0
        )
      }
    }
  }

  // TODO: Implement submission accepted notification

  req.flash('success', 'Submission graded!')
  res.redirect(req.session.redirectTo || '/admin/submissions')
  delete req.session.redirectTo
})

router.get('/submissions/update/:id', async (req, res) => {
  const submission = await SubmissionController.getSubmissionById(req.params.id)
  res.render('pages/admin/submissions/single', { submission, update: true })
})

router.post('/submissions/update/:id', async (req, res) => {
  let { state, comments } = req.body

  const old_submission = await SubmissionController.getSubmissionById(req.params.id)
  const submission = await SubmissionController.updateSubmission(req.params.id, { state, comments })

  const module = await ModuleController.getModuleById(submission.module_id)

  if (state === 'rejected') {
    mailer.sendSubmissionRejection(submission, comments)

    if (old_submission.state === 'accepted') {
      // used to be accepted, take points away
      await UserController.grantPoints(submission.user_id, 0 - module.points)

      if (module.required) {
        // if this is the only project that is now missing from the requirements,
        // take off the additional bonus points
        const modulesRequired = await ProjectController.getRequiredModuleIdsByProjectId(
          submission.project_id
        )
        const modulesAccepted = (
          await SubmissionController.getLatestSubmissionsByUserId(submission.user_id)
        )
          .filter((e) => e.state === 'accepted')
          .map((e) => e.module_id)

        // remove all the completed projects
        modulesRemaining = modulesRequired.filter((m) => modulesAccepted.indexOf(m) < 0)

        const pts = (await ConfigController.get('pointsPerProject')) || 0
        if (modulesRemaining.length === 1 && modulesRemaining[0] === submission.module_id) {
          // this is the only project left
          await UserController.grantPoints(submission.user_id, 0 - pts)
        }
      }
    }
  } else if (state === 'accepted') {
    // only grant points if used to be rejected
    if (old_submission.state === 'rejected') {
      // Grant module points
      await UserController.grantPoints(submission.user_id, module.points)
    }

    if (module.required) {
      const modulesRequired = await ProjectController.getRequiredModuleIdsByProjectId(
        submission.project_id
      )
      const modulesAccepted = (
        await SubmissionController.getLatestSubmissionsByUserId(submission.user_id)
      )
        .filter((e) => e.state === 'accepted')
        .map((e) => e.module_id)

      // Grant additional points if every required module is completed
      if (modulesRequired.every((module_id) => modulesAccepted.includes(module_id))) {
        await UserController.grantPoints(
          submission.user_id,
          (await ConfigController.get('pointsPerProject')) || 0
        )
      }
    }
  }

  req.flash('success', 'Submission graded!')
  res.redirect(req.session.redirectTo || '/admin/submissions')
  delete req.session.redirectTo
})

/** Submissions */
router.get('/submissions/:page?', async (req, res) => {
  req.session.prevUrl = req.originalUrl

  const filter = req.query.filter || 'pending'
  const orderBy = req.query.by || 'created_at'
  const order = req.query.order || 'DESC'

  const { submissions, prevPage, nextPage } = await AdminController.listSubmissions(
    filter,
    orderBy,
    order,
    req.params.project_id,
    req.params.page
  )

  res.render('pages/admin/submissions/list', {
    filter,
    orderBy,
    order,
    submissions,
    prevPage,
    nextPage
  })
})

/** Exchange Controls */
router.get('/rewards', async (req, res) => {
  delete req.session.redirectTo

  res.render('pages/admin/rewards/list', {
    rewards: await ExchangeController.listAll()
  })
})

router.get('/rewards/new', (req, res) => {
  res.render('pages/admin/rewards/single')
})

router.post('/rewards/new', async (req, res) => {
  let { name, description, image, quantity, needs_shipping, enabled, price, delivery } = req.body
  enabled = !!enabled
  needs_shipping = !!needs_shipping

  const { reward_id } = await ExchangeController.createReward({
    name,
    description,
    image,
    quantity,
    needs_shipping,
    enabled,
    price,
    delivery
  })

  req.flash('success', `Reward #${reward_id} created successfully!`)
  res.redirect(`/admin/rewards`)
})

router.get('/rewards/edit/:id', async (req, res) => {
  const reward = await ExchangeController.getRewardById(req.params.id)
  req.session.redirectTo = req.originalUrl

  res.render('pages/admin/rewards/single', {
    edit: true,
    reward
  })
})

router.post('/rewards/edit/:id', async (req, res) => {
  let { name, description, image, quantity, needs_shipping, enabled, price, delivery } = req.body
  enabled = !!enabled
  needs_shipping = !!needs_shipping

  const { reward_id } = await ExchangeController.updateReward(req.params.id, {
    name,
    description,
    image,
    quantity,
    needs_shipping,
    enabled,
    price,
    delivery
  })

  req.flash('success', `Reward #${reward_id} updated successfully!`)
  res.redirect(`/admin/rewards`)
})

router.get('/orders/edit/:id', async (req, res) => {
  const order = await OrderController.getOrderById(req.params.id)
  req.session.redirectTo = req.originalUrl

  res.render('pages/admin/rewards/update', {
    order
  })
})

router.post('/orders/edit/:id', async (req, res) => {
  await OrderController.updateStatus(req.params.id, req.body.status)

  req.flash('success', 'Order updated!')
  res.redirect(req.session.prevUrl || '/admin/submissions')
})

router.get('/orders/:type?', async (req, res) => {
  req.session.prevUrl = req.originalUrl

  if (req.params.type === 'fulfillment') {
    res.render('pages/admin/rewards/orders', {
      type: 'Orders Pending Fulfillment',
      orders: await AdminController.listOrders('fulfillment', req.params.page)
    })
  } else if (req.params.type === 'shipping') {
    res.render('pages/admin/rewards/orders', {
      type: 'Orders Pending Shipping',
      orders: await AdminController.listOrders('shipping', req.params.page)
    })
  } else {
    res.render('pages/admin/rewards/orders', {
      type: 'All Orders',
      orders: await AdminController.listOrders('all', req.params.page)
    })
  }
})

module.exports = router
