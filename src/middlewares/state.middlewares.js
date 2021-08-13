const ProjectController = require('@controllers/project.controllers')
const UserController = require('@controllers/user.controllers')
const ConfigController = require('@controllers/config.controllers')

exports.stateMiddleware = async (req, res, next) => {
  if (req.user.state !== 'onboarding') {
    const week = parseInt(await ConfigController.get('week'), 10)
    const hardwareWeek = (await ConfigController.get('hardwareWeek')) === 'true'

    const prevProjects = [...req.user.prev_projects, req.user.current_project]

    if (req.user.current_week < week) {
      let newUser

      if (hardwareWeek && req.user.project_id_override !== -1) {
        // If hardware week enabled and user has a project override
        newUser = await UserController.updateUser(req.user.user_id, {
          state: 'inprogress',
          current_week: week,
          current_project: req.user.project_id_override,
          prev_projects: prevProjects,
          project_pool: []
        })
      } else {
        // If user week is behind, (re)generate projects
        newUser = await UserController.updateUser(req.user.user_id, {
          state: 'pending',
          current_week: week,
          current_project: -1,
          prev_projects: prevProjects,
          project_pool: await ProjectController.getRandomProjectIds(
            3,
            prevProjects
          )
        })
      }

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
  const flagged = await UserController.checkRefreshFlag(req.user.user_id)

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

exports.banMiddleware = async (req, res, next) => {
  if (req.user.banned) {
    res.render('pages/banned')
  } else {
    next()
  }
}
