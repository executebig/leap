/**
  @author Mingjie Jiang & Brian Xiang
  Setup server entry point and index
 */

/** Allows use of @ symbol for directory */
require('module-alias/register')

const path = require('path')
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
    secure: config.env === 'production'
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
Bugsnag.start({
  apiKey: config.bugsnag.apiKey,
  plugins: [BugsnagPluginExpress]
})

const bugsnagMiddleware = Bugsnag.getPlugin('express')
app.use(bugsnagMiddleware.requestHandler)

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

/** End Bugsnag integration */
app.use(bugsnagMiddleware.errorHandler)

/** Instantiate server */
http.listen(config.port, () => {
  console.log(
    `Leap started on ${config.env === 'production' ? 'https://' : 'http://'}${config.domain}\n`
  )
})

/** Exports the server for testing */
module.exports = app
