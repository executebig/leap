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
  UserController.flagUser(req.user.user_id)
  res.end('flagged')
})

router.get('/ban', authMiddlewares.checkAuth, (req, res) => {
  UserController.banUser(req.user.user_id)
  UserController.flagUser(req.user.user_id)
  res.end('banned')
})

router.get('/unban', authMiddlewares.checkAuth, (req, res) => {
  UserController.unbanUser(req.user.user_id)
  UserController.flagUser(req.user.user_id)
  res.end('unbanned')
})

module.exports = router
