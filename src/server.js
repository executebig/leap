/**
  @author Mingjie Jiang & Brian Xiang
  Setup server entry point and index
 */

/** Allows use of @ symbol for directory */
require('module-alias/register')

const path = require('path')
const crypto = require('crypto')
const express = require('express')
const sass = require('node-sass-middleware')
const minifier = require('html-minifier')
const session = require('express-session')
const connectRedis = require('connect-redis')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')
const exphbs = require('express-handlebars')
const reqId = require('express-request-id')()
const morgan = require('morgan')
const chalk = require('chalk')
const helmet = require('helmet')
const compression = require('compression')
const minifyHTML = require('express-minify-html-2')
const Bugsnag = require('@bugsnag/js')
const BugsnagPluginExpress = require('@bugsnag/plugin-express')

// local imports
const config = require('@config')
const hbsHelpers = require('@libs/helpers')
const passport = require('@libs/passport')
const truncateString = require('@libs/truncateString')

// initialize server
const app = express()
const http = require('http').createServer(app)
const RedisSessionStore = connectRedis(session)

// setup socket.io
const io = require('@socket').init(http)

// configuration details
const minifierOpts = {
  override: true,
  exception_url: false,
  htmlMinifier: {
    removeComments: true,
    removeCommentsFromCDATA: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes: true,
    removeEmptyAttributes: true,
    minifyJS: true,
    minifyCSS: true
  }
}

const sessionConfig = {
  secret: config.session.secret,
  name: '_leapSession',
  store: new RedisSessionStore({
    client: require('@db/redis').client
  }),
  cookie: {
    secure: config.env === 'production',
    maxAge: 7 * 24 * 3600 * 1000 // a week
  },
  resave: false,
  saveUninitialized: true
}

const handlebarsConfig = {
  defaultLayout: 'main',
  helpers: hbsHelpers,
  extname: '.hbs',
  layoutsDir: 'src/views/layouts',
  partialsDir: 'src/views/partials'
}

const sassConfig = {
  src: path.join(__dirname, './styles'),
  dest: path.join(__dirname, './static/styles'),
  outputStyle: 'compressed',
  prefix: '/static/styles',
  includePaths: [path.join(__dirname, '../node_modules'), path.join(__dirname, 'styles'), '.']
}

/** Begin Bugsnag integration */
let bugsnagMiddleware = null

if (config.env === 'production') {
  Bugsnag.start({
    apiKey: config.bugsnag.apiKey,
    plugins: [BugsnagPluginExpress]
  })

  bugsnagMiddleware = Bugsnag.getPlugin('express')

  app.use(bugsnagMiddleware.requestHandler)
}

/** Generate nonce */
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('hex')
  next()
})

/** Helmet Setup */
app.use(helmet())
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        'blob:',
        'https://unpkg.com',
        'https://cdn.heapanalytics.com',
        'https://heapanalytics.com',
        'https://plausible.io',
        'https://ajax.cloudflare.com',
        'https://static.cloudflareinsights.com',
        'https://hcaptcha.com',
        'https://*.hcaptcha.com',
        (req, res) => `'nonce-${res.locals.nonce}'`
      ],
      'connect-src': [
        "'self'",
        'https://unpkg.com',
        'https://plausible.io',
        'https://hcaptcha.com',
        'https://*.hcaptcha.com',
        'https://cdn.jsdelivr.net',
        'https://*.mingjie.repl.co',
        'wss://*.mingjie.repl.co'
      ],
      'img-src': ["'self'", 'data:', 'heapanalytics.com', 'gravatar.com', 'cdn.techroulette.xyz'],
      'frame-src': [
        'https://open.spotify.com',
        'https://www.youtube.com',
        'https://hcaptcha.com',
        'https://*.hcaptcha.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://hcaptcha.com',
        'https://*.hcaptcha.com',
        'https://fonts.googleapis.com',
        'https://unpkg.com',
        'https://maxcdn.bootstrapcdn.com/'
      ]
    },
    // reportOnly: true
  })
)

/** Logging Setup */
morgan.token('id', (req) => req.id.split('-')[0])
/** Express Server Setup */
if (config.env === 'production') {
  app.use(minifyHTML(minifierOpts))
}
app.use(compression())
app.use(express.json())
app.set('trust proxy', 1)
app.use(reqId)
app.use(
  morgan(
    (tokens, req, res) => {
      return `${chalk.green(`+ #${tokens.id(req, res)}`)} [${chalk.yellow(
        tokens.method(req, res)
      )}] Started ${chalk.blue(truncateString(tokens.url(req, res), 36))} for ${chalk.blue(
        tokens['remote-addr'](req, res)
      )}`
    },
    { immediate: true, skip: (req, res) => config.env === 'testing' }
  )
)
app.use(
  morgan(
    (tokens, req, res) => {
      return `${chalk.red(`- #${tokens.id(req, res)}`)} [${chalk.yellow(
        tokens.method(req, res)
      )}] Completed ${chalk.yellow(tokens.status(req, res))} ${tokens.res(
        req,
        res,
        'content-length'
      )} in ${chalk.green(tokens['response-time'](req, res))}ms`
    },
    { skip: (req, res) => config.env === 'testing' }
  )
)
app.use(cookieParser(config.cookie.secret))
app.use(session(sessionConfig))
app.use(flash())
app.set('views', path.join(__dirname, './views'))
app.engine('.hbs', exphbs(handlebarsConfig))
app.set('view engine', '.hbs')
app.use(sass(sassConfig))
app.use(express.urlencoded({ extended: false }))
app.use(passport.initialize())
app.use(passport.session())

/** Create basic routes */
app.use('/static', express.static(path.join(__dirname, './static')))
app.use(require('@routes'))

/** End Bugsnag integration (includes 500 rendering) */
if (config.env === 'production') {
  app.use((err, req, res, next) => {
    if (req.user) {
      req.bugsnag.addMetadata('user', req.user)
    }

    req.bugsnag.addMetadata('context', { req_id: req.id.split('-')[0] })
    next(err)
  })

  app.use(bugsnagMiddleware.errorHandler)

  app.use((err, req, res, next) => {
    res.status(500)
    res.render('pages/status/500', { req_id: req.id.split('-')[0], hide_auth: true })
  })
}

/** Instantiate server */
http.listen(config.port, async () => {
  console.log(
    `Leap started on ${config.env === 'production' ? 'https://' : 'http://'}${config.domain}\n`
  )

  require('./onetime/fixHardwareWeek')()
})

/** Exports the server for testing */
module.exports = app
