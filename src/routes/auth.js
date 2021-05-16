/** 
  Express syntax router that handles authentication through OpenID
*/

const config = require('@config')
const db = require('@db')

const router = require('express').Router()
const { auth } = require('express-openid-connect')

const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: config.auth0.secret,
  baseURL: config.baseUrl,
  clientID: config.auth0.client,
  issuerBaseURL: config.auth0.domain
}

/** attach /logout, /callback */
router.use(auth(authConfig))

router.get('/callback', async (req, res) => {
  await db.query(
    'INSERT INTO users (user_id, email, avatar, last_synced) VALUES ($1, $2, $3, NOW()) \
                  ON CONFLICT (user_id) DO UPDATE \
                  SET email = EXCLUDED.email, avatar = EXCLUDED.avatar',
    [req.oidc.user.sub, req.oidc.user.email, req.oidc.user.picture]
  )

  return res.redirect('/')
})

/* pass all user context to rendering */
const passAuthContext = (req, res, next) => {
  // context is optional
  if (req.oidc.isAuthenticated()) {
    // pass context
    res.locals.user = req.oidc.user
  }

  next()
}

/* forces authentication  */
const forceAuth = (req, res, next) => {
  /* enforce custom login - optional */
  if (req.oidc.isAuthenticated()) {
    next()
  } else {
    return res.redirect('/login')
  }
}

module.exports = { router, passAuthContext, forceAuth }
