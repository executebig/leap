/**
    @author Mingjie Jiang, Brian Xiang
    Controls all the modules routes
 */

const router = require('express').Router()

const ProjectController = require('@controllers/project.controllers')
const ModuleController = require('@controllers/module.controllers')
const SubmissionController = require('@controllers/submission.controllers')
const SlackController = require('@controllers/slack.controllers')
const UserController = require('@controllers/user.controllers')

const { flagMiddleware, stateMiddleware, banMiddleware } = require('@middlewares/state.middlewares')
const { checkAuth } = require('@middlewares/auth.middlewares')

const reflash = require('@libs/reflash')
const { getSubmissionState } = require('@libs/helpers')
const config = require('@config')

// Check for session flag, user banned, & state updates
router.use(checkAuth, flagMiddleware, banMiddleware, stateMiddleware)

router.use('/', (req, res, next) => {
  switch (req.user.state) {
    case 'inprogress':
    case 'completed':
      next()
      break
    default:
      reflash(req, res)
      return res.redirect('/dash')
  }
})

router.get('/', async (req, res) => {
  const { project, modules_required, modules_optional } =
    await ProjectController.getProjectAndModulesById(req.user.current_project)
  const submissions = await SubmissionController.getLatestSubmissionsByUserId(req.user.user_id)

  return res.render('pages/modules/list', {
    project,
    modules_required,
    modules_optional,
    submissions,
    confetti: !!req.query.confetti
  })
})

router.get('/:id', async (req, res, next) => {
  const module = await ModuleController.getModule(req.params.id, req.user.current_project)

  if (!module || !module.enabled) {
    return next()
  }

  const project = await ProjectController.getProjectById(module.project_id)
  const latestSubmission = await SubmissionController.getLatestSubmission(
    req.user.user_id,
    module.module_id
  )

  res.render('pages/modules/single', {
    module,
    project,
    submissions: latestSubmission ? [latestSubmission] : []
  })
})

router.post('/:id', async (req, res, next) => {
  const module = await ModuleController.getModule(req.params.id, req.user.current_project)

  // Verify that the user is allowed to submit
  if (!module || !module.enabled) {
    req.flash(
      'error',
      'Invalid submission — if this issue persists, please reach out to us at hi@techroulette.xyz.'
    )
    res.status(400)
    res.redirect(`/modules/${req.params.id}`)
    return
  } else {
    const latestSubmission = await SubmissionController.getLatestSubmission(
      req.user.user_id,
      req.params.id
    )

    if (
      latestSubmission?.state === 'pending' ||
      latestSubmission?.state === 'accepted'
    ) {
      req.flash(
        'error',
        'Invalid submission — if this issue persists, please reach out to us at hi@techroulette.xyz.'
      )
      res.status(400)
      res.redirect(`/modules/${req.params.id}`)
      return
    }
  }

  try {
    const submission = await SubmissionController.createSubmission(
      req.body.content,
      req.user.user_id,
      module.project_id,
      module.module_id
    )

    if (config.flags.includes('print_submission')) {
      console.log(`[Submission] New Submission:`)
      console.log(submission)
    } else {
      await SlackController.sendSubmission(submission)
    }

    if (req.user.state !== 'completed') {
      const modulesRequired = await ProjectController.getRequiredModuleIdsByProjectId(module.project_id)
      const modulesSubmitted = (await SubmissionController.getLatestSubmissionsByUserId(req.user.user_id))
        .filter(e => e.state === 'accepted' || e.state === 'pending')
        .map(e => e.module_id)

      if (modulesRequired.every(module_id => modulesSubmitted.includes(module_id))) {
        await UserController.updateUser(req.user.user_id, {
          state: 'completed'
        })

        req.flash('success', 'Submission successful!')
        res.redirect('/modules?confetti=true')
        return
      }
    }

    req.flash('success', 'Submission successful!')
  } catch (err) {
    console.error(err)
    req.flash(
      'error',
      'Oops! Something went wrong — if this issue persists, please reach out to us at hi@techroulette.xyz'
    )
  }

  res.redirect('/modules')
})

module.exports = router
