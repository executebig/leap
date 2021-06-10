/**
    @author Mingjie Jiang, Brian Xiang
    Controls all the modules routes
 */

const router = require('express').Router()

const ProjectController = require('@controllers/project.controllers')
const ModuleController = require('@controllers/module.controllers')

const { flagMiddleware, stateMiddleware, banMiddleware } = require('@middlewares/state.middlewares')
const { checkAuth } = require('@middlewares/auth.middlewares')

const reflash = require('@libs/reflash')

// Check for session flag, user banned, & state updates
router.use(checkAuth, flagMiddleware, banMiddleware, stateMiddleware)

router.use('/', (req, res, next) => {
  if (req.user.state !== 'inprogress') {
    reflash(req, res)
    return res.redirect('/dash')
  }

  next()
})

router.get('/', async (req, res) => {
  return res.render('pages/modules', {
    title: 'Modules',
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
