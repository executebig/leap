/**
    @author Brian Xiang
    Controls /submissions
 */

const router = require('express').Router()

const ProjectController = require('@controllers/project.controllers')
const SubmissionController = require('@controllers/submission.controllers')

const { flagMiddleware, stateMiddleware, banMiddleware } = require('@middlewares/state.middlewares')
const { checkAuth } = require('@middlewares/auth.middlewares')
const notFoundMiddleware = require('@middlewares/404.middlewares')

const reflash = require('@libs/reflash')

// Check for session flag, user banned, & state updates
router.use(checkAuth, flagMiddleware, banMiddleware, stateMiddleware)

router.use('/:projectId', async (req, res, next) => {
  if (isNaN(req.params.projectId)) {
    notFoundMiddleware(req, res)
    return
  }

  const projectId = parseInt(req.params.projectId, 10)

  // Ensure user has permission to view project
  if (!req.user.prev_projects.includes(projectId) && req.user.current_project !== projectId) {
    notFoundMiddleware(req, res)
    return
  }

  next()
})

router.get('/:projectId', async (req, res) => {
  const projectId = parseInt(req.params.projectId, 10)

  const project = await ProjectController.getProjectById(projectId)
  const submissions = await SubmissionController.getSubmissionsByUserAndProjectId(
    req.user.user_id,
    projectId
  )

  return res.render('pages/submissions', {
    project,
    submissions
  })
})

router.get('/:projectId/:submissionId', async (req, res) => {
  if (isNaN(req.params.submissionId)) {
    notFoundMiddleware(req, res)
    return
  }

  const submission = await SubmissionController.getSubmission(
    req.user.user_id,
    req.params.projectId,
    req.params.submissionId
  )

  if (!submission) {
    res.status(404)
    res.json({ error: 'Not Found' })
    return
  }

  res.json({ submission })
})

module.exports = router
