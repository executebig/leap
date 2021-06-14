const reflash = require('@libs/reflash')

module.exports = (req, res) => {
  reflash(req, res)
  res.status(404)

  if (req.method === 'GET') {
    res.render('pages/status/404', { hide_auth: true })
  } else {
    res.end('404 Not Found')
  }
}
