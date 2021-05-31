const config = require('@config')

const path = require('path')
const nodemailer = require('nodemailer')
const nodemailerHbs = require('nodemailer-express-handlebars')
const expHbs = require('express-handlebars')

const transporter = nodemailer.createTransport(config.email)
transporter.use(
  'compile',
  nodemailerHbs({
    viewEngine: expHbs.create({
      extname: '.hbs',
      defaultLayout: 'main'
    }),
    viewPath: path.join(__dirname, '../views/emails'),
    extName: '.hbs'
  })
)

exports.sendMagic = async (email, token) => {
  let magicLink = `https://${config.domain}/auth/login?token=${token}`

  if (config.flags.includes('print_email')) {
    // dev flag to print the token instead of sending
    console.log('Magic link: ' + magicLink.replace('https://', 'http://'))
    return
  }

  await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: 'Your Tech Roulette log in link',
    template: 'magic',
    context: {
      magic: magicLink,
      layout: false
    }
  })
}

const btoa = b => Buffer.from(b).toString('base64')

exports.sendInvite = async (email, referrer) => {
  const data = {
    email,
    referrer: {
      first_name: referrer.first_name,
      last_name: referrer.last_name,
      display_name: referrer.display_name
    }
  }
  const encodedData = btoa(JSON.stringify(data))
  const entryUrl = `https://${config.domain}/?referral=${encodedData}`

  await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: `Join ${referrer.first_name} at Tech Roulette!`,
    template: 'invite',
    context: {
      referrer,
      entryUrl,
      layout: false
    }
  })
}

exports.sendNudge = async (email, referrer) => {
  const data = {
    email,
    referrer: {
      first_name: referrer.first_name,
      last_name: referrer.last_name,
      display_name: referrer.display_name
    }
  }
  const encodedData = btoa(JSON.stringify(data))
  const entryUrl = `https://${config.domain}/?referral=${encodedData}`

  await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: `${referrer.first_name} is reminding you to complete your Tech Roulette profile!`,
    template: 'nudge',
    context: {
      referrer,
      entryUrl,
      layout: false
    }
  })
}
