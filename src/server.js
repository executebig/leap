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
const compression = require('compression')

// local imports
const config = require('@config')
const hbsHelpers = require('@libs/helpers')

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
  name: '_continuitySession',
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
  includePaths: [
    path.join(__dirname, '../node_modules'),
    path.join(__dirname, 'styles'),
    '.'
  ]
}

/** Logging Setup */
morgan.token('id', (req) => req.id.split('-')[0])
/** Express Server Setup */
app.use(compression())
app.set('trust proxy', 1)
app.use(reqId)
app.use(
  morgan(
    '[:method #:id] Started :method :url for :remote-addr',
    { immediate: true, skip: (req, res) => config.testing }
  )
)
app.use(
  morgan(
    '[:method #:id] Completed :status :res[content-length] in :response-time ms',
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

/** Set up flash messages */
app.use((req, res, next) => {
  res.locals.error = req.flash('error')
  res.locals.success = req.flash('success')

  next()
})

/** Create basic routes */
app.use(
  '/static',
  express.static(path.join(__dirname, './static'))
)
app.use(require('@routes/index'))

/** Instantiate server */
http.listen(config.port, () => {
  console.log(`Leap started on port ${config.baseUrl}\n`)
})

/** Exports the server for testing */
module.exports = app
