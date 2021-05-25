/** 
    Debugging & Testing Routes
*/

const router = require('express').Router()

router.get('/ping', (req, res) => {
  res.send({ ping: 'pong' })
})

router.get('/emails/magic', (req, res) => {
  res.render('emails/magic', { layout: false })
})

module.exports = router
