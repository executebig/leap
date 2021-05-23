const router = require('express').Router()

const UserController = require('@controllers/user.controllers')

router.get('/', (req, res) => {
    
})

router.get('/onboard', (req, res) => {
  // verify user tag correct
  if (req.user.state !== 'onboarding') {
    req.flash('error', 'You have already completed onboarding!')
    return res.redirect('/dash')
  }

  res.render('pages/account/onboard', { title: 'Welcome' })
})

/* updates the req.user object */
router.get('/refresh', async (req, res) => {
  const user = await UserController.getUserById(req.user.user_id)

  req.login(user, (err) => {
    if (err) {
      res.status(500).send({
        success: false,
        error: err,
        user
      })
    } else {
      res.send({
        success: true,
        user
      })
    }
  })
})

module.exports = router
