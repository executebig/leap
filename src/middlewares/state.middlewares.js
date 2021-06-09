const ProjectController = require('@controllers/project.controllers')
const UserController = require('@controllers/user.controllers')
const ConfigController = require('@controllers/config.controllers')

exports.stateMiddleware = async (req, res, next) => {
  if (!req.user) {
    req.flash('error', 'Please log in first!')
    res.redirect('/')
  } else if (req.user.state !== 'onboarding') {
    const week = parseInt(await ConfigController.get('week'), 10)

    // If user week is behind, (re)generate projects
    if (req.user.current_week < week) {
      const project_pool = await ProjectController.getRandomProjectIds(3, req.user.prev_projects)
      const newUser = await UserController.updateUser(req.user.user_id, {
        state: 'pending',
        current_week: week,
        current_project: -1,
        prev_projects: [...req.user.prev_projects, req.user.current_project],
        project_pool
      })

      req.login(newUser, (err) => {
        if (err) {
          req.flash('error', err.message)
        }

        res.locals.user = req.user
        next()
      })
    } else {
      next()
    }
  } else {
    next()
  }
}

exports.flagMiddleware = async (req, res, next) => {
  if (!req.user) {
    next()
  }

  const flagged = await UserController.checkUserFlag(req.user.user_id)

  // Refresh user session if flagged in redis
  if (flagged) {
    req.login(await UserController.getUserById(req.user.user_id), (err) => {
      if (err) {
        req.flash('error', err.message)
      }

      res.locals.user = req.user
      next()
    })
  } else {
    next()
  }
}
