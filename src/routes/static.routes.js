/** 
    @author Mingjie Jiang 
    Static pages
*/

const config = require('@config')

const router = require('express').Router()
const authMiddlewares = require('@middlewares/auth.middlewares')

router.get('/', authMiddlewares.optionalAuth, (req, res) => {
  res.render('pages/landing', { titleOverride: true, hCaptcha: config.hCaptcha })
})

module.exports = router
