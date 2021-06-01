module.exports = (req, res) => {
  for (const key in res.locals.flash) {
    req.flash(key, res.locals.flash[key])
  }
}