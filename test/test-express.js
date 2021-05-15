/**
    @author Mingjie Jiang
    Tests if Express works as expected, also a sample unit test
 */

const chai = require('chai')
const chaiHttp = require('chai-http')
const suppressLogs = require('mocha-suppress-logs')

const app = require('../src/server')

chai.should()
chai.use(chaiHttp)

process.env.NODE_ENV = 'testing'

describe('Express server functions', () => {
  suppressLogs()
  
  it('responds to ping', () => {
    return chai
      .request(app)
      .get('/debug/ping')
      .then((res) => {
        res.should.have.status(200)
        res.body.should.be.deep.equal({ ping: 'pong' })
      })
      .catch((err) => {
        throw err
      })
  })
})
