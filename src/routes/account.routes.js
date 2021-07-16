const Bugsnag = require('@bugsnag/js')

const config = require('@config')
const router = require('express').Router()

const UserController = require('@controllers/user.controllers')
const EOController = require('@controllers/eo.controllers')
const BadgeController = require('@controllers/badge.controllers')
const DiscordController = require('@controllers/discord.controllers')
const ProjectController = require('@controllers/project.controllers')
const addrSanitizer = require('@libs/addressSanitizer')

const { flagMiddleware, stateMiddleware, banMiddleware } = require('@middlewares/state.middlewares')
const { checkAuth } = require('@middlewares/auth.middlewares')
const notFoundMiddleware = require('@middlewares/404.middlewares')

// Check for session flag, user banned, & state updates
router.use(checkAuth, flagMiddleware, banMiddleware, stateMiddleware)

router.get('/', async (req, res) => {
  const badges = await BadgeController.getBadgesByIds(req.user.badges)
  const prevProjects = await ProjectController.getProjectsByIds(req.user.prev_projects)

  res.render('pages/account/view', { badges, prevProjects })
})

router.use('/edit/:id?', async (req, res, next) => {
  const id = req.params.id || req.user.user_id

  // if non-admin trying to access other users
  if (!req.user.admin && req.user.user_id !== parseInt(id, 10)) {
    notFoundMiddleware(req, res)
  } else {
    const user = await UserController.getUserById(id)

    if (!user) {
      notFoundMiddleware(req, res)
    } else {
      res.locals.edit_user = user
      res.locals.admin_controls = req.user.admin

      next()
    }
  }
})

router.get('/edit/:id?', async (req, res) => {
  const address = await UserController.getAddressById(req.user.user_id)

  res.render('pages/account/edit', { address })
})

router.post('/edit/:id?', async (req, res) => {
  req.params.id = req.params.id ? parseInt(req.params.id, 10) : req.user.user_id

  const data = Object.fromEntries(
    ['first_name', 'last_name', 'display_name'].map((key) => [key, req.body[key]])
  )

  await UserController.updateUser(req.params.id, data)
  await UserController.flagRefresh(req.params.id)

  req.flash('success', 'Successfully updated account.')
  if (req.user.user_id === req.params.id) {
    res.redirect(`/account`)
  } else {
    res.redirect(`/account/edit/${req.params.id}`)
  }
})

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
      req.body.no_shipping === 'true'
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

  refreshUser(req, res, user, '/account/invite?onboard=1')
})

router.get('/invite', (req, res) => {
  res.render('pages/account/invite', {
    isOnboard: req.query.onboard
  })
})

router.get('/redeem', (req, res) => {
  res.render('pages/account/redeem')
})

router.post('/redeem', async (req, res) => {
  const code = req.body.code
  const badge_id = await BadgeController.getBadgeIdByCode(code)

  console.log('badge id: ' + badge_id)

  if (badge_id === -1) {
    req.flash('error', 'Invalid secret code!')
    res.redirect('/account/redeem')
  } else if (req.user.badges?.includes(badge_id)) {
    req.flash('error', 'You already have this badge!')
    res.redirect('/account')
  } else {
    const user = await UserController.grantBadge(req.user.user_id, badge_id)
    req.flash('success', 'New badge received!')
    refreshUser(req, res, user, '/account')
  }
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

router.get('/discord', (req, res) => {
  res.render('pages/account/discord')
})

/* Redirect to Discord OAuth */
router.get('/discord/connect', (req, res) => {
  if (req.user.discord_id) {
    req.flash('error', 'You have already linked your Discord account!')
    return res.redirect('/account/discord')
  }

  const redirect =
    (config.env === 'development' ? 'http://' : 'https://') +
    config.domain +
    '/account/discord/callback'
  res.redirect(
    `https://discord.com/api/oauth2/authorize?client_id=${config.discord.client}&redirect_uri=${redirect}&response_type=code&scope=identify%20guilds.join`
  )
})

router.get('/discord/callback', async (req, res) => {
  if (!req.query.code) {
    req.flash('error', 'No authorization code provided.')
    return res.redirect('/account/discord')
  }

  const token = await DiscordController.getTokenFromCode(req.query.code).catch((error) => {
    req.flash('error', 'Invalid authorization code. Please try again.')
    return res.redirect('/account/discord')
  })

  if (!token) {
    req.flash('error', 'Token grant failed. Please try again.')
    return res.redirect('/account/discord')
  }

  try {
    const discord_user = await DiscordController.getUserFromToken(token)
    await Promise.all([
      DiscordController.joinUserToGuild(token, discord_user),
      UserController.updateUser(req.user.user_id, { discord_id: discord_user.id })
    ])

    // grant player role
    await DiscordController.grantRole(discord_user.id, 'Player')
    return res.redirect(`https://discord.com/channels/${config.discord.guild}/`)
  } catch (err) {
    Bugsnag.notify(err)
    req.flash('error', 'Account linking failed. Please try again.')
    return res.redirect('/account/discord')
  }
})

router.get('/intl-shipping', (req, res) => {
  if (!req.user.no_shipping) {
    return res.redirect('/account')
  }

  res.render('pages/account/international')
})

// allow opt-in to international shipping
router.post('/intl-shipping', async (req, res) => {
  if (!req.user.no_shipping) {
    return res.redirect('/account')
  } else if (req.user.points < 10) {
    req.flash('error', 'You need to pay 10 Chips to enable international shipping.')
    return res.redirect('/account')
  }

  let addr = req.body.address
  if (req.body.native) {
    addr += "\n" + req.body.native
  } 

  const user = await UserController.updateUser(req.user.user_id, {
    address: addr,
    international: true,
    points: req.user.points - 10
  })

  req.flash('success', 'Success! You are now eligible for international shipping.')
  refreshUser(req, res, user, '/exchange')
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
