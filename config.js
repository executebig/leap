require('dotenv').config()

module.exports = {
  port: process.env.PORT || 3000,
  production: process.env.NODE_ENV === 'production',
  testing: process.env.NODE_ENV === 'testing',
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
  database: process.env.DATABASE_URL,
  redis: process.env.REDIS_URL,
  email: process.env.EMAIL_URL,
  flags: process.env.FLAGS ? process.env.FLAGS.split(',') : null
}
