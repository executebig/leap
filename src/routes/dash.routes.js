/**
    @author Mingjie Jiang, Brian Xiang
    Controls all the dashboard routes
 */

const router = require('express').Router()

const ProjectController = require('@controllers/project.controllers')
const UserController = require('@controllers/user.controllers')
const DiscordController = require('@controllers/discord.controllers')
const ConfigController = require('@controllers/config.controllers')

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
  const rerollCost = parseInt(await ConfigController.get('rerollCost'), 10) || 20

  return res.render('pages/dash', {
    projects: await ProjectController.getProjectsByIds(req.user.project_pool),
    rerollCost
  })
})

router.post('/reroll', async (req, res) => {
  const rerollCost = parseInt(await ConfigController.get('rerollCost'), 10) || 20

  if (req.user.points < rerollCost) {
    req.flash('error', 'Insufficient funds!')
    res.redirect('/dash')
    return
  }

  const randomProject = req.user.project_pool[Math.floor(Math.random() * req.user.project_pool.length)]
  await UserController.updateUser(req.user.user_id, {
    points: req.user.points - rerollCost,
    project_pool: await ProjectController.getRandomProjectIds(
      3,
      [...req.user.prev_projects, randomProject]
    )
  })

  await UserController.flagRefresh(req.user.user_id)

  req.flash('success', 'Successfully re-rolled project pool!')
  res.redirect('/dash')
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

  // grant Discord role
  if (req.user.discord_id) {
    const roleName = "W" + req.user.current_week + "P" + req.body?.project_id
    await DiscordController.grantRole(req.user.discord_id, roleName)
  }

  // Refresh req.user
  req.login(newUser, (err) => {
    if (err) {
      req.flash('error', err.message)
    }
  })

  res.redirect('/modules')
})

module.exports = router
