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
    referral: referralData ? JSON.parse(atob(referralData)) : null,
    utm_source: req.query.utm_source
  })
})

router.get('/login', authMiddlewares.optionalAuth, (req, res) => {
  res.render('pages/login', {
    hCaptcha: config.hCaptcha
  })
})

router.get('/logout', (req, res) => {
  res.redirect('/auth/logout')
})

router.get('/chill', authMiddlewares.checkAuth, (req, res) => {
  res.render('pages/chill')
})

router.get('/404', authMiddlewares.optionalAuth, (req, res) => {
  res.status(404)
  res.render('pages/404')
})

module.exports = router
