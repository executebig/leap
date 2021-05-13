/** 
  @author Mingjie Jiang & Brian Xiang
  Setup server entry point and index
 */

/** Allows use of @ symbol for directory */
require('module-alias/register')

const path = require('path')

const config = require('@config')

// asynchronously register plugins and middlewares
async function build() {
  const fastify = require('fastify')({
    logger: process.env.NODE_ENV !== 'production'
  })

  const sassMiddleware = require('node-sass-middleware')
  const minifier = require('html-minifier')

  const minifierOpts = {
    removeComments: true,
    removeCommentsFromCDATA: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes: true,
    removeEmptyAttributes: true
  }

  // await fastify.register(require('fastify-helmet'))

  // support express middlewares
  await fastify.register(require('middie'))

  fastify.use(
    sassMiddleware({
      src: path.join(__dirname, './styles'),
      dest: path.join(__dirname, './static/styles'),
      outputStyle: 'compressed',
      debug: !config.production,
      prefix: '/styles/',
      includePaths: [
        path.join(__dirname, '../node_modules')
      ]
    })
  )

  // automatically setup all routes from ./routes
  await fastify.register(require('fastify-autoload'), {
    dir: path.join(__dirname, 'routes')
  })

  // setup handlebars rendering
  await fastify.register(require('point-of-view'), {
    engine: { handlebars: require('handlebars') },
    includeViewExtension: true,
    templates: path.join(__dirname, 'views/'),
    options: {
      partials: {
        layout: 'layouts/main.hbs',
        navbar: 'partials/navbar.hbs'
      },
      useHtmlMinifier: config.production ? minifier : null,
      htmlMinifierOptions: minifierOpts
    }
  })

  // plugin & middleware setup
  await fastify.register(require('fastify-static'), {
    root: path.join(__dirname, './static')
  })

  return fastify
}

// godspeed
build()
  .then((fastify) => {
    fastify.listen(config.port, '0.0.0.0')
  })
  .catch((err) => {
    console.error(err)
  })
