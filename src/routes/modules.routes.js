/**
    @author Mingjie Jiang, Brian Xiang
    Controls all the modules routes
 */

const router = require('express').Router()

const ProjectController = require('@controllers/project.controllers')
const ModuleController = require('@controllers/module.controllers')
const SubmissionController = require('@controllers/submission.controllers')

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

  if (!module || !module.enabled) {
    return next()
  }

  res.render('pages/module', {
    title: module.title,
    data: module
  })
})

router.post('/:id', async (req, res, next) => {
  const module = await ModuleController.getModule(req.params.id, req.user.current_project)

  // Verify that the user is allowed to submit
  if (!module || !module.enabled) {
    res.status(400)
    res.end('Bad Request')
    return
  }

  await SubmissionController.createSubmission(
    req.body.content,
    req.user.user_id,
    module.project_id,
    module.module_id
  )

  req.flash('success', 'Submission successful!')
  res.redirect('/modules')
})

module.exports = router
