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
    const rewards = await Promise.all((await ExchangeController.listAvailable(req.user.international, req.user.no_shipping))
      .map(async reward => {
        if (reward.raffle) {
          reward.entries = await ExchangeController.getEntries(reward.reward_id, req.user.user_id)
        }

        return reward
      }))

    res.render('pages/exchange/list', { rewards })
  } else {
    res.render('pages/exchange/disabled')
  }
})

router.post('/purchase', async (req, res) => {
  const reward_id = parseInt(req.body.reward_id)
  const orderQuantity = parseInt(req.body.reward_quantity)
  const exchangeStatus = await ConfigController.get('exchange')

  const [address, reward] = await Promise.all([
    UserController.getAddressById(req.user.user_id),
    ExchangeController.getRewardById(reward_id)
  ])

  const orderPrice = orderQuantity * reward.price

  if (exchangeStatus !== 'enabled') {
    req.flash('error', `The Roulette Exchange is currently offline. Please check back later!`)
    return res.redirect('/exchange')
  } else if (!reward.enabled || reward.quantity <= 0) {
    req.flash('error', `This reward is no longer available.`)
    return res.redirect('/exchange')
  } else if (orderQuantity > reward.quantity) {
    req.flash('error', `Your order quantity exceeds the amount of available stock for this product.`)
    return res.redirect('/exchange')
  } else if (orderQuantity < 1) {
    req.flash('error', `:(`)
    return res.redirect('/exchange')
  } else if (orderPrice > req.user.points) {
    req.flash(
      'error',
      `You do not have enough chips to purchase ${reward.name}! Need ${orderPrice - req.user.points} more chips.`
    )
    return res.redirect('/exchange')
  } else if (
    req.user.no_shipping &&
    reward.needs_shipping &&
    reward.international &&
    !req.user.international
  ) {
    req.flash(
      'error',
      `You are not eligible for this reward. Please check your eligibility status or try another reward.`
    )
    return res.redirect('/exchange')
  }

  const order = await OrderController.createOrder({
    reward_id, quantity: orderQuantity,
    user_id: req.user.user_id,
    reward_name: reward.name,
    email: req.user.email,
    address: address,
    status: reward.raffle
      ? 'Pending raffle'
      : reward.needs_shipping
      ? (req.user.international ? 'Awaiting international shipping' : 'Awaiting physical shipping')
      : 'Order placed'
  })

  await UserController.updateUser(req.user.user_id, { points: req.user.points - orderPrice })
  await ExchangeController.sell(reward_id, orderQuantity)

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
