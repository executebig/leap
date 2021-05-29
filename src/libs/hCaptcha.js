const config = require('@config')

const hcaptcha = require('hcaptcha')

const validate = (req, res, next) => {
  const token = req.body && req.body['h-captcha-response']

  if (!token) {
    req.flash(
      'error',
      'Captcha verification failed (Code 1). If this issue persists, please contact staff at hi@techroulette.xyz.'
    )
    return res.redirect('/')
  }

  return hcaptcha.verify(config.hCaptcha.secret, token).then((data) => {
    if (data.success) {
      return next()
    } else {
      req.flash(
        'error',
        'Captcha verification failed (Code 2). If this issue persists, please contact staff at hi@techroulette.xyz.'
      )
      return res.redirect('/')
    }
  })
}

module.exports = { validate }
