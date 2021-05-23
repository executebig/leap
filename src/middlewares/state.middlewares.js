/** 
    @author Mingjie Jiang
    Middlewares that interacts with the "state" property of the JWT token
 */

// this middleware must execute after authentication
exports.routeState = (req, res, next) => {
    if (!req.user) {
        req.flash('error', 'Please log in first!')
        res.redirect('/')
    }

    switch (req.user.state) {
        case 'onboarding':
            return res.redirect('/account/onboard')
            break;
        default:
            next();
    }
}
