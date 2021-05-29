/**
    @author Mingjie Jiang, Brian Xiang
    Controls all the modules routes
 */

const router = require('express').Router()

const ProjectController = require('@controllers/project.controllers')
const ModuleController = require('@controllers/module.controllers')

router.use('/', (req, res, next) => {
  if (req.user.state === 'pending') {
    return res.redirect('/dash')
  } else if (req.user.state !== 'inprogress') {
    return res.redirect('/')
  }

  next()
})

router.get('/', async (req, res) => {
  return res.render('pages/modules', {
    title: 'Modules',
    week: req.user.current_week,
    data: await ProjectController.getProjectAndModulesById(req.user.current_project)
  })
})

router.get('/:id', async (req, res, next) => {
  const module = await ModuleController.getModule(req.params.id, req.user.current_project)

  if (!module) return next()

  res.render('pages/module', {
    title: module.title,
    data: module
  })
})


module.exports = router
