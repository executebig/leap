/** 
 * @author Mingjie Jiang
 * Main router for the application, handles all routing
*/
const router = require('express').Router()
const auth = require('@routes/auth')

/** Initialize auth system */
router.use(auth.router)
router.use(auth.passAuthContext)

/** Directly rendered pages */
router.get('/', (req, res) => {
    res.render('pages/app', {
        title: "Home"
    })
})
router.use('/debug', require('@routes/debug'))

// TODO: Error pages should go here.

/** Everything below this line will be protected behind auth */

router.use(auth.forceAuth)

module.exports = router