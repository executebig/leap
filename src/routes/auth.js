/** 
  Express syntax router that handles authentication through OpenID
*/

const config = require('@config')

const router = require('express').Router()
const { auth } = require('express-openid-connect')

const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: config.auth0.secret,
  baseURL: config.baseUrl,
  clientID: config.auth0.client,
  issuerBaseURL: config.auth0.domain,
  routes: {
    login: '/login',
    callback: '/gateway'
  }
}

/** attach /logout, /callback */
router.use(auth(authConfig))

router.get('/login', (req, res) => {
  return res.oidc.login({ connection: 'Discord', returnTo: '/auth/gateway' })
})

router.post('/gateway', async (req, res) => {
  
  // TODO: set up user in database

  res.redirect('/')
})

const authenticate = async (req, res, next) => {
  /* enforce custom login - optional */
  if (req.oidc.isAuthenticated()) {
    res.locals.user = req.oidc.user

    next()
  } else {
    return res.redirect('/login')
  }
}

module.exports = { router, authenticate }
