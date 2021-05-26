/**
    @author Mingjie Jiang
    Middlewares that interacts with the "state" property of the JWT token
 */

// this middleware must execute after authentication
exports.routeState = (req, res, next) => {
  if (!req.user) {
    throw new Error(`Fatal: Please do not use "routeState" without authenticating the user.`)
    System.exit(-1)
  }

  switch (req.user.state) {
    case 'onboarding':
      return res.redirect('/account/onboard')
      break
    case 'completed':
      return res.redirect('/chill')
      break
    default:
      next()
  }
}
