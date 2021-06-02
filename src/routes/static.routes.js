/** 
    @author Mingjie Jiang 
    Static pages
*/

const config = require('@config')

const router = require('express').Router()
const authMiddlewares = require('@middlewares/auth.middlewares')

router.get('/', authMiddlewares.optionalAuth, (req, res) => {
  const atob = (a) => Buffer.from(a, 'base64').toString('binary')
  const referralData = req.query.referral

  res.render('pages/landing', {
    titleOverride: true,
    hCaptcha: config.hCaptcha,
    referral: referralData ? JSON.parse(atob(referralData)) : null
  })
})

router.get('/chill', authMiddlewares.checkAuth, (req, res) => {
  res.render('pages/chill')
})

module.exports = router
