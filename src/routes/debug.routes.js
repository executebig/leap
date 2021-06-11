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

router.get('/chai/login', async (req, res) => {
  const newUser = await UserController.createUserByEmail('chai@express.test')
  req.login(newUser, (err) => {
    if (err) {
      throw new Error(err)
    } else {
      res.end('success')
    }
  })
})

module.exports = router
