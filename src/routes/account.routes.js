const router = require('express').Router()

const UserController = require('@controllers/user.controllers')

router.get('/', (req, res) => {})

router.get('/onboard', (req, res) => {
  // verify user tag correct
  if (req.user.state !== 'onboarding') {
    req.flash('error', 'You have already completed onboarding!')
    return res.redirect('/dash')
  }

  res.render('pages/account/onboard')
})

router.post('/onboard', async (req, res) => {
  let data = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    display_name: req.body.display_name,
    age: parseInt(req.body.age),
    parent_email: req.body.parent_email,
    no_shipping: req.body.no_shipping === 'on',
    address:
      req.body.no_shipping === 'on'
        ? null
        : `${req.body.addr_street_1}, ${req.body.addr_street_2}, ${req.body.addr_city}, ${req.body.addr_state}`,
    phone: req.body.phone,
    state: 'completed'
  }

  const user = await UserController.updateUser(req.user.user_id, data)
  refreshUser(req, res, user)
})

/* updates the req.user object */
router.get('/refresh', async (req, res) => {
  const user = await UserController.getUserById(req.user.user_id)
  refreshUser(req, res, user)
})

const refreshUser = (req, res, user) => {
  req.login(user, (err) => {
    if (err) {
      req.flash('error', err.message)
      res.redirect('/dash')
    } else {
      res.redirect('/dash')
    }
  })
}

module.exports = router
