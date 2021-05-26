/**
    @author Mingjie Jiang, Brian Xiang
    Controls all the dashboard routes
 */

const router = require('express').Router()

const ProjectController = require('@controllers/project.controllers')

router.get('/', async (req, res) => {
  return res.render('pages/dash', {
    title: 'Dashboard',
    // TODO: Pulling random projects directly for testing
    // This should only happen every week
    projects: await ProjectController.getRandomProjects(3)
  })
})

module.exports = router
