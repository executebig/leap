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

// local imports
const config = require('@config')
const hbsHelpers = require('@libs/helpers')
const passport = require('@libs/passport')
const truncateString = require('@libs/truncateString')

// initialize server
const app = express()
const http = require('http').createServer(app)
const RedisSessionStore = connectRedis(session)

// configuration details
const minifierOpts = {
  removeComments: true,
  removeCommentsFromCDATA: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeAttributeQuotes: true,
  removeEmptyAttributes: true
}

const sessionConfig = {
  secret: config.session.secret,
  name: '_leapSession',
  store: new RedisSessionStore({
    client: require('@db/redis').client
  }),
  cookie: {
    secure: config.production
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

/** Logging Setup */
morgan.token('id', (req) => req.id.split('-')[0])
/** Express Server Setup */
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
    { immediate: true, skip: (req, res) => config.testing }
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
    { skip: (req, res) => config.testing }
  )
)
app.use(cookieParser())
app.use(session(sessionConfig))
app.use(flash())
app.set('views', path.join(__dirname, './views'))
app.engine('.hbs', exphbs(handlebarsConfig))
app.set('view engine', '.hbs')
app.use(sass(sassConfig))
app.use(express.urlencoded({ extended: false }))
app.use(passport.initialize())
app.use(passport.session())

/** Set up flash messages */
app.use((req, res, next) => {
  res.locals.error = req.flash('error')
  res.locals.success = req.flash('success')

  next()
})

/** Create basic routes */
app.use('/static', express.static(path.join(__dirname, './static')))
app.use(require('@routes'))

/** Instantiate server */
http.listen(config.port, () => {
  console.log(`Leap started on ${config.domain}\n`)
})

/** Exports the server for testing */
module.exports = app
