/**
    @author Mingjie Jiang
    Static pages
*/

const config = require('@config')

const router = require('express').Router()

const authMiddlewares = require('@middlewares/auth.middlewares')
const ConfigController = require('@controllers/config.controllers')

router.get('/', authMiddlewares.optionalAuth, (req, res) => {
  const atob = (a) => Buffer.from(a, 'base64').toString('binary')
  const referralData = req.query.referral

  res.render('pages/landing', {
    titleOverride: true,
    hCaptcha: config.hCaptcha,
    referral: referralData ? JSON.parse(atob(referralData)) : null
  })
})

router.get('/login', authMiddlewares.optionalAuth, (req, res) => {
  res.render('pages/auth/login', {
    hCaptcha: config.hCaptcha
  })
})

router.get('/logout', (req, res) => {
  res.redirect('/auth/logout')
})

router.get('/chill', authMiddlewares.checkAuth, (req, res) => {
  res.render('pages/chill')
})

router.get('/stage', authMiddlewares.optionalAuth, async (req, res) => {
  const [liveUrl, eventName] = await Promise.all([
    ConfigController.get('stageUrl'),
    ConfigController.get('stageEventName')
  ])

  res.render('pages/stage', {
    liveUrl,
    eventName
  })
})

module.exports = router
