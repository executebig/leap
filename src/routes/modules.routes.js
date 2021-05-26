/**
    @author Mingjie Jiang, Brian Xiang
    Controls all the modules routes
 */

const router = require('express').Router()

const ProjectController = require('@controllers/project.controllers')

router.get('/', async (req, res) => {
  return res.render('pages/modules', {
    title: 'Modules',
    // TODO: Use user selected project id
    data: await ProjectController.getProjectAndModulesById(1)
  })
})

// TODO: Implement db queries for module & authorized access
router.get('/:uuid', (req, res, next) => {
  // Simulate db query for module based on id
  const module = debugModules.find((e) => e.id === req.params.uuid)

  // Simulate additional auth check (ensure user specifically has access to module)
  const authorized = true

  if (!module || !authorized) next()

  res.render('pages/module', {
    title: module.title,
    data: module
  })
})


module.exports = router
