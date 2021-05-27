/**
    @author Mingjie Jiang
    @source https://dev.to/inhuofficial/comment/1b916
    @source https://gist.github.com/cjaoude/fd9910626629b53c4d25

    Tests if email validation works as intended
 */

const chai = require('chai')
const assert = chai.assert

const validate = require('../src/libs/validateEmail')

describe('Test email validation library', () => {
  describe('Test basic email cases RFC 5322', () => {
    it('passes regular emails', () => assert.isTrue(validate('lastname@example.com')))
    it('passes short emails', () => assert.isTrue(validate('me@example.com')))
    it('passes plus extension emails', () =>
      assert.isTrue(validate('firstname+lastname@example.com')))
    it('passes dotted emails', () => assert.isTrue(validate('a.nonymous@example.com')))
    it('passes subdomain emails', () => assert.isTrue(validate('email@subdomain.example.com')))
    it('passes regional subdomains', () => assert.isTrue(validate('email@example.co.jp')))
  })

  describe('Test rare email cases', () => {
    it('passes uncommon tlds', () => assert.isTrue(validate('email@example.name')))
    it('passes long tlds', () => assert.isTrue(validate('email@example.museum')))
    it('passes dashed emails', () => assert.isTrue(validate('firstname-lastname@example.com')))
    it('passes all number emails', () => assert.isTrue(validate('1234567890@example.com')))
  })

  describe('Test obvious invalid addresses', () => {
    it('fails plain address', () => assert.isFalse(validate('plainaddress')))
    it('fails invalid chars', () => assert.isFalse(validate('#@%^%#$@#$@#.com')))
    it('fails missing prefix', () => assert.isFalse(validate('@example.com')))
    it('fails invalid format', () => assert.isFalse(validate('Joe Smith <email@example.com>')))
    it('fails just a subdomain', () => assert.isFalse(validate('email.example.com')))
    it('fails multiple @ signs', () => assert.isFalse(validate('email@example@example.com')))
    it('fails invalid ip address', () => assert.isFalse(validate('email@111.222.333.44444')))
  })

  describe('Test edge failures and common typos', () => {
    it('fails extra dots (mid)', () => assert.isFalse(validate('Abc..123@example.com')))
    it('fails extra dots (tld)', () => assert.isFalse(validate('email@example..com')))
    it('fails extra dots (front)', () => assert.isFalse(validate('.email@example.com')))
    it('fails extra dots (end)', () => assert.isFalse(validate('email.@example.com')))
  })
})
