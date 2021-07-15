/**
    Shop-specific routes
*/

const router = require('express').Router()

const { flagMiddleware, stateMiddleware, banMiddleware } = require('@middlewares/state.middlewares')
const { checkAuth } = require('@middlewares/auth.middlewares')

const ConfigController = require('@controllers/config.controllers')
const UserController = require('@controllers/user.controllers')
const ExchangeController = require('@controllers/exchange.controllers')
const OrderController = require('@controllers/order.controllers')

// Check for session flag, user banned, & state updates
router.use(checkAuth, flagMiddleware, banMiddleware, stateMiddleware)

router.get('/', async (req, res) => {
  const exchangeStatus = await ConfigController.get('exchange')

  if (exchangeStatus === 'enabled') {
    res.render('pages/exchange/list', {
      rewards: await ExchangeController.listAvailable(req.user.no_shipping)
    })
  } else {
    res.render('pages/exchange/disabled')
  }
})

router.post('/purchase', async (req, res) => {
  const reward_id = parseInt(req.body.reward_id)
  const exchangeStatus = await ConfigController.get('exchange')

  const [address, reward] = await Promise.all([
    UserController.getAddressById(req.user.user_id),
    ExchangeController.getRewardById(reward_id)
  ])

  if (exchangeStatus !== 'enabled') {
    req.flash('error', `The Roulette Exchange is currently offline. Please check back later!`)
    return res.redirect('/exchange')
  } else if (!reward.enabled || reward.quantity <= 0) {
    req.flash('error', `This reward is no longer available.`)
    return res.redirect('/exchange')
  } else if (req.user.no_shipping && reward.needs_shipping) {
    req.flash(
      'error',
      `You are not eligible for this reward. Please check your eligibility status or try another reward.`
    )
    return res.redirect('/exchange')
  } else if (reward.price > req.user.points) {
    const diff = reward.price - req.user.points
    req.flash(
      'error',
      `You do not have enough chips to purchase ${reward.name}! Need ${diff} more chips.`
    )
    return res.redirect('/exchange')
  }

  const order = await OrderController.createOrder({
    reward_id,
    user_id: req.user.user_id,
    reward_name: reward.name,
    email: req.user.email,
    address: address,
    status: reward.raffle ? 'Pending raffle' : (reward.needs_shipping ? 'Awaiting physical shipping' : 'Order placed')
  })

  await UserController.updateUser(req.user.user_id, { points: req.user.points - reward.price })
  await ExchangeController.sellOne(reward_id)

  req.flash('success', 'Thank you for your purchase!')
  return res.redirect('/exchange/orders')
})

router.get('/orders', async (req, res) => {
  const orders = await OrderController.listUserOrders(req.user.user_id)

  res.render('pages/exchange/orders', {
    orders
  })
})

module.exports = router
