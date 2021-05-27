/**
    @author Mingjie Jiang, Brian Xiang
    Controls all the modules routes
 */

const router = require('express').Router()

const ProjectController = require('@controllers/project.controllers')
const ModuleController = require('@controllers/module.controllers')

router.get('/', async (req, res) => {
  return res.render('pages/modules', {
    title: 'Modules',
    week: req.user.current_week,
    // TODO: Use user selected project id
    data: await ProjectController.getProjectAndModulesById(1)
  })
})

// TODO: Implement db queries for module & authorized access
router.get('/:id', async (req, res, next) => {
  const module = await ModuleController.getModule(req.params.id, 1)

  if (!module) return next()

  res.render('pages/module', {
    title: module.title,
    data: module
  })
})


module.exports = router
