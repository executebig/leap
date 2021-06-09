/**
    Protected routes
*/

const router = require('express').Router()

const { optionalAuth } = require('@middlewares/auth.middlewares')
const { flagMiddleware, stateMiddleware } = require('@middlewares/state.middlewares')

/** Admin route handled separately (to hide from users) */
router.use('/admin', optionalAuth, flagMiddleware, require('@routes/admin.routes'))

router.use('/dash', flagMiddleware, stateMiddleware, require('@routes/dash.routes'))
router.use('/account', flagMiddleware, stateMiddleware, require('@routes/account.routes'))
router.use('/modules', flagMiddleware, stateMiddleware, require('@routes/modules.routes'))

module.exports = router
