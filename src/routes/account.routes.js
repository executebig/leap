const router = require('express').Router()

const UserController = require('@controllers/user.controllers')
const EOController = require('@controllers/eo.controllers')
const addrSanitizer = require('@libs/addressSanitizer')

const { flagMiddleware, stateMiddleware, banMiddleware } = require('@middlewares/state.middlewares')

// Check for session flag, user banned, & state updates
router.use(flagMiddleware, banMiddleware, stateMiddleware)

router.get('/onboard', (req, res) => {
  // verify user tag correct
  if (req.user.state !== 'onboarding') {
    req.flash('error', 'You have already completed onboarding!')
    return res.redirect('/dash')
  }

  res.render('pages/account/onboard', { hide_auth: true })
})

router.post('/onboard', async (req, res) => {
  let data = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    display_name: req.body.display_name,
    age: parseInt(req.body.age),
    parent_email: req.body.parent_email.toLowerCase(),
    no_shipping: req.body.no_shipping === 'true',
    address:
      req.body.no_shipping === 'on'
        ? null
        : addrSanitizer({
            s1: req.body.addr_street_1,
            s2: req.body.addr_street_2,
            city: req.body.addr_city,
            state: req.body.addr_state,
            zip: req.body.addr_zip
          }),
    phone: req.body.phone,
    state: 'ready'
  }

  const user = await UserController.updateUser(req.user.user_id, data)

  // Update contact data on EO
  await EOController.updateContact(user)

  refreshUser(req, res, user, '/account/invite')
})

router.get('/invite', (req, res) => {
  res.render('pages/account/invite')
})

router.post('/invite', async (req, res) => {
  UserController.inviteUser(req.body.email_1.toLowerCase(), req.user)

  if (req.body.email_2) {
    UserController.inviteUser(req.body.email_2.toLowerCase(), req.user)
  }

  if (req.body.email_3) {
    UserController.inviteUser(req.body.email_3.toLowerCase(), req.user)
  }

  req.flash('success', 'Invites sent! Welcome to Tech Roulette <3')
  res.redirect('/dash')
})

/* updates the req.user object */
router.get('/refresh', async (req, res) => {
  const user = await UserController.getUserById(req.user.user_id)
  refreshUser(req, res, user, '/dash')
})

const refreshUser = (req, res, user, redirect) => {
  req.login(user, (err) => {
    if (err) {
      req.flash('error', err.message)
      res.redirect(redirect)
    } else {
      res.redirect(redirect)
    }
  })
}

module.exports = router
