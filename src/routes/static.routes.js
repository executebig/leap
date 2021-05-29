/** 
    @author Mingjie Jiang 
    Static pages
*/

const router = require('express').Router()
const authMiddlewares = require('@middlewares/auth.middlewares')

router.get('/', authMiddlewares.optionalAuth, (req, res) => {
  res.render('pages/landing', { titleOverride: true })
})

module.exports = router
