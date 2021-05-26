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
