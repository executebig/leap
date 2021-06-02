/**
    @author Mingjie Jiang
    Middlewares that interacts with the "state" property of the JWT token
 */

const ConfigController = require('@controllers/config.controllers')
const UserController = require('@controllers/user.controllers')
const ProjectController = require('@controllers/project.controllers')

const reflash = require('@libs/reflash')

// this middleware must execute after authentication
exports.routeState = async (req, res, next) => {
  if (!req.user) {
    throw new Error(`Fatal: Please do not use "routeState" without authenticating the user.`)
    System.exit(-1)
  }

  let userObj = req.user

  if (req.user.state !== 'onboarding') {
    const week = parseInt(await ConfigController.get('week'), 10)

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
        } else {
          userObj = newUser
        }
      })
    }
  }

  switch (userObj.state) {
    case 'onboarding':
      reflash(req, res)
      return res.redirect('/account/onboard')
      break
    case 'ready':
      reflash(req, res)
      return res.redirect('/chill')
      break
    default:
      next()
  }
}
