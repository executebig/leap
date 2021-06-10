/**
    Protected routes
*/

const router = require('express').Router()

const { flagMiddleware, stateMiddleware, banMiddleware } = require('@middlewares/state.middlewares')

/** Admin route handled separately (to hide from users) */
router.use('/admin', flagMiddleware, banMiddleware, require('@routes/admin.routes'))

router.use('/dash', flagMiddleware, banMiddleware, stateMiddleware, require('@routes/dash.routes'))
router.use('/account', flagMiddleware, banMiddleware, stateMiddleware, require('@routes/account.routes'))
router.use('/modules', flagMiddleware, banMiddleware, stateMiddleware, require('@routes/modules.routes'))

module.exports = router
