/** 
    Debugging & Testing Routes
*/

const router = require('express').Router()

router.get('/ping', (req, res) => {
  res.send({ ping: 'pong' })
})

module.exports = router
