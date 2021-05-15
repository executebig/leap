/** 
 * @author Mingjie Jiang
 * Main router for the application, handles all routing
*/
const router = require('express').Router()
const auth = require('@routes/auth')

/** Initialize auth system */
router.use(auth.router)

/** Directly rendered pages */
router.get('/', (req, res) => {
    res.render('pages/app', {
        title: "Home"
    })
})
router.use('/debug', require('@routes/debug'))

router.use(auth.authenticate)

module.exports = router