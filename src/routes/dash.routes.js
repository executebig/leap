/**
    @author Mingjie Jiang, Brian Xiang
    Controls all the dashboard routes
 */

const router = require('express').Router()

const ProjectController = require('@controllers/project.controllers')
const UserController = require('@controllers/user.controllers')

router.get('/', async (req, res) => {
  const projects = await ProjectController.getProjectsByIds(req.user.project_pool)

  return res.render('pages/dash', {
    title: 'Dashboard',
    projects
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
