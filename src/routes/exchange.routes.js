/**
    Shop-specific routes
*/

const router = require('express').Router()

const { flagMiddleware, stateMiddleware, banMiddleware } = require('@middlewares/state.middlewares')
const { checkAuth } = require('@middlewares/auth.middlewares')

const ExchangeController = require('@controllers/exchange.controllers')

// Check for session flag, user banned, & state updates
router.use(checkAuth, flagMiddleware, banMiddleware, stateMiddleware)

router.get('/', async (req, res) => {
  res.render('pages/exchange/list', {
    rewards: await ExchangeController.listAvailable(req.user.no_shipping)
  })
})

module.exports = router
