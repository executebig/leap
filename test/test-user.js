/**
    @author Brian Xiang
    Tests if user functionality works as expected
 */

const chai = require('chai')
const chaiHttp = require('chai-http')
const suppressLogs = require('mocha-suppress-logs')
const crypto = require('crypto')

const app = require('../src/server')

chai.should()
chai.use(chaiHttp)

describe('Test unauthorized user functions', () => {
  suppressLogs()

  it(`200 on / (landing)`, () => {
    return chai
      .request(app)
      .get('/')
      .then((res) => {
        res.should.have.status(200)
        res.text.should.include('Explore your future in a bold world')
      })
      .catch((err) => {
        throw err
      })
  })

  it(`200 on /chill`, () => {
    return chai
      .request(app)
      .get('/chill')
      .then((res) => {
        res.should.have.status(200)
      })
      .catch((err) => {
        throw err
      })
  })

  let paths = ['/dash', '/modules', '/account']
  paths.forEach((path) => {
    it(`302 on ${path} -> /`, () => {
      return chai
        .request(app)
        .get(path)
        .redirects(0)
        .then((res) => {
          res.should.have.status(302)
          res.should.redirectTo('/')
        })
        .catch((err) => {
          throw err
        })
    })
  })

  it(`404 on /admin`, () => {
    return chai
      .request(app)
      .get('/admin')
      .then((res) => {
        res.should.have.status(404)
      })
      .catch((err) => {
        throw err
      })
  })

  it(`404 on random page`, () => {
    return chai
      .request(app)
      .get(`/${crypto.randomBytes(16).toString('hex')}`)
      .then((res) => {
        res.should.have.status(404)
      })
      .catch((err) => {
        throw err
      })
  })
})

let cookies

describe('Test onboarding user functions', () => {
  suppressLogs()

  it(`Login via /debug/chai/login`, () => {
    return chai
      .request(app)
      .get('/debug/chai/login')
      .then((res) => {
        res.should.have.status(200)
        res.text.should.equal('success')

        cookies = res.headers['set-cookie'].pop().split(';')[0]
      })
      .catch((err) => {
        throw err
      })
  })

  it(`302 on /dash -> /account/onboard`, () => {
    return chai
      .request(app)
      .get('/dash')
      .set('Cookie', cookies)
      .redirects(0)
      .then((res) => {
        res.should.have.status(302)
        res.should.redirectTo('/account/onboard')
      })
      .catch((err) => {
        throw err
      })
  })

  it(`302 on /modules -> /dash`, () => {
    return chai
      .request(app)
      .get('/modules')
      .set('Cookie', cookies)
      .redirects(0)
      .then((res) => {
        res.should.have.status(302)
        res.should.redirectTo('/dash')
      })
      .catch((err) => {
        throw err
      })
  })

  it(`404 on /admin`, () => {
    return chai
      .request(app)
      .get('/admin')
      .set('Cookie', cookies)
      .then((res) => {
        res.should.have.status(404)
      })
      .catch((err) => {
        throw err
      })
  })
})

describe('Test pending user functions', () => {
  suppressLogs()

  it(`301 POST /account/onboard -> /account/invite`, () => {
    return chai
      .request(app)
      .post('/account/onboard')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send('first_name=a&last_name=a&display_name=42&age=42&parent_email=&no_shipping=true&addr_street_1=&addr_street_2=&addr_city=&addr_state=&addr_zip=&phone=1231231234')
      .set('Cookie', cookies)
      .redirects(0)
      .then((res) => {
        res.should.have.status(302)
        res.should.redirectTo('/account/invite')
      })
      .catch((err) => {
        throw err
      })
  })

  it(`200 on /dash`, () => {
    return chai
      .request(app)
      .get('/dash')
      .set('Cookie', cookies)
      .then((res) => {
        res.should.have.status(200)
      })
      .catch((err) => {
        throw err
      })
  })

  it(`302 on /modules -> /dash`, () => {
    return chai
      .request(app)
      .get('/modules')
      .set('Cookie', cookies)
      .redirects(0)
      .then((res) => {
        res.should.have.status(302)
        res.should.redirectTo('/dash')
      })
      .catch((err) => {
        throw err
      })
  })

  it(`302 on /modules/0 -> /dash`, () => {
    return chai
      .request(app)
      .get(`/modules/0`)
      .set('Cookie', cookies)
      .redirects(0)
      .then((res) => {
        res.should.have.status(302)
        res.should.redirectTo('/dash')
      })
      .catch((err) => {
        throw err
      })
  })

  it(`302 on /modules/:random_id -> /dash`, () => {
    return chai
      .request(app)
      .get(`/modules/${Math.floor(Math.random() * 500) + 1000}`)
      .set('Cookie', cookies)
      .redirects(0)
      .then((res) => {
        res.should.have.status(302)
        res.should.redirectTo('/dash')
      })
      .catch((err) => {
        throw err
      })
  })

  it(`404 on /admin`, () => {
    return chai
      .request(app)
      .get('/admin')
      .set('Cookie', cookies)
      .then((res) => {
        res.should.have.status(404)
      })
      .catch((err) => {
        throw err
      })
  })
})

// TODO: inprogress user tests
