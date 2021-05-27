/**
    @author Mingjie Jiang, Brian Xiang
    Controls all the dashboard routes
 */

const router = require('express').Router()

const ProjectController = require('@controllers/project.controllers')

router.get('/', async (req, res) => {
  const projects = await ProjectController.getProjectsByIds(req.user.project_pool)

  return res.render('pages/dash', {
    title: 'Dashboard',
    projects
  })
})

module.exports = router
