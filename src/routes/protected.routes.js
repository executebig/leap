/**
    Protected routes
*/

const router = require('express').Router()

const { optionalAuth }= require('@middlewares/auth.middlewares')
const { stateMiddleware } = require('@middlewares/state.middlewares')

/** Admin route handled separately (to hide from users) */
router.use('/admin', optionalAuth, require('@routes/admin.routes'))

router.use('/dash', stateMiddleware, require('@routes/dash.routes'))
router.use('/account', stateMiddleware, require('@routes/account.routes'))
router.use('/modules', stateMiddleware, require('@routes/modules.routes'))

module.exports = router
