/**
    @author Brian Xiang
    Tests if user functionality works as expected
 */

const chai = require('chai')
const chaiHttp = require('chai-http')
const suppressLogs = require('mocha-suppress-logs')

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
    it(`302 on ${path}`, () => {
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
})
