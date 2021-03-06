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
  postmark: {
    apiKey: process.env.POSTMARK_API,
    from: process.env.POSTMARK_FROM
  },
  emailOctopus: {
    key: process.env.EO_API_KEY,
    listId: process.env.EO_LIST_ID
  },
  bugsnag: {
    apiKey: process.env.BUGSNAG_API
  },
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN,
    submissionsChannel: process.env.SLACK_SUBMISSIONS_CHANNEL
  },
  discord: {
    client: process.env.DISCORD_CLIENT,
    secret: process.env.DISCORD_SECRET,
    bot_token: process.env.DISCORD_BOT_TOKEN,
    guild: process.env.DISCORD_GUILD
  },
  flags: process.env.FLAGS ? process.env.FLAGS.split(',') : []
}
