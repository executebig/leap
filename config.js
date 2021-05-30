require('dotenv').config()

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  domain: process.env.DOMAIN,
  session: {
    secret: process.env.SESSION_SECRET
  },
  cookie: {
    secret: process.env.COOKIE_SECRET
  },
  auth: {
    secret: process.env.AUTH_SECRET
  },
  hCaptcha: {
    siteKey: process.env.HCAPTCHA_SITEKEY,
    secret: process.env.HCAPTCHA_SECRET
  },
  database: process.env.DATABASE_URL,
  redis: process.env.REDIS_URL,
  email: {
    url: process.env.EMAIL_URL,
    from: process.env.EMAIL_FROM
  },
  flags: process.env.FLAGS ? process.env.FLAGS.split(',') : []
}
