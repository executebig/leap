/**
    Debugging & Testing Routes
*/

const router = require('express').Router()

const authMiddlewares = require('@middlewares/auth.middlewares')
const UserController = require('@controllers/user.controllers')

router.get('/ping', (req, res) => {
  res.send({ ping: 'pong' })
})

router.get('/emails/magic', (req, res) => {
  res.render('emails/magic', { layout: false })
})

router.get('/flag', authMiddlewares.checkAuth, (req, res) => {
  UserController.flagRefresh(req.user.user_id)
  res.end('flagged')
})

module.exports = router
