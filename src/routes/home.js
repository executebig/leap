const router = require('express').Router()
const fs = require('fs')
const path = require('path')
const keywords = fs.readFileSync(path.join(__dirname, '../data/landing-keywords.txt'), "utf-8")

router.get('/', (req, res) => {
  if (req.oidc.isAuthenticated()) {

    return res.render('pages/dash', {
      title: 'Dashboard'
    })
  } else {
    return res.render('pages/landing', {
      title: 'Home',
      keywords: keywords.split('\n').slice(0, -1)
    })
  }
})

module.exports = router
