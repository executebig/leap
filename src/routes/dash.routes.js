/**
    @author Mingjie Jiang, Brian Xiang
    Controls all the dashboard routes
 */

const router = require('express').Router()

const ProjectController = require('@controllers/project.controllers')
const UserController = require('@controllers/user.controllers')

const { flagMiddleware, stateMiddleware, banMiddleware } = require('@middlewares/state.middlewares')
const { checkAuth } = require('@middlewares/auth.middlewares')

const reflash = require('@libs/reflash')

// Check for session flag, user banned, & state updates
router.use(checkAuth, flagMiddleware, banMiddleware, stateMiddleware)

router.use('/', (req, res, next) => {
  switch (req.user.state) {
    case 'onboarding':
      reflash(req, res)
      return res.redirect('/account/onboard')
    case 'ready':
      reflash(req, res)
      return res.redirect('/chill')
    case 'inprogress':
    case 'completed':
      reflash(req, res)
      return res.redirect('/modules')
    default:
      next()
  }
})

router.get('/', async (req, res) => {
  return res.render('pages/dash', {
    projects: await ProjectController.getProjectsByIds(req.user.project_pool)
  })
})

router.post('/', async (req, res) => {
  // Check if project exists & user is allowed to pick
  if (!req.user.project_pool.includes(parseInt(req.body?.project_id, 10))) {
    req.flash('error', 'Invalid project ID')
    return res.redirect(req.originalUrl)
  }

  // Update current_project
  const newUser = await UserController.updateUser(req.user.user_id, {
    state: 'inprogress',
    current_project: req.body.project_id
  })

  // Refresh req.user
  req.login(newUser, (err) => {
    if (err) {
      req.flash('error', err.message)
    }
  })

  res.redirect('/modules')
})

module.exports = router
