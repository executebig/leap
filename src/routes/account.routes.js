const router = require('express').Router()

router.get('/onboard', (req, res) => {
  res.render('pages/account/onboard', { title: 'Welcome' })
})

module.exports = router
