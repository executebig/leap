'use strict'

const crypto = require('crypto')

exports.stringify = (obj) => {
  return JSON.stringify(obj)
}

exports.eq = (a, b, options) => {
  return a === b ? options.fn(this) : options.inverse(this)
}

exports.notEq = (a, b, options) => {
  return a === b ? options.inverse(this) : options.fn(this)
}

exports.capitalize = (a) => {
  return a
    .split(' ')
    .map((e) => e.charAt(0).toUpperCase() + e.substr(1))
    .join(' ')
}

exports.inc = (value, step) => {
  return parseInt(value, '10') + step
}

/** Blocks helper controllers */

let blocks = Object.create(null)

exports.extend = (name, context) => {
  let block = blocks[name]
  if (!block) {
    block = blocks[name] = []
  }

  block.push(context.fn(this))
}

exports.block = (name) => {
  let val = (blocks[name] || []).join('\n')

  // clear the block
  blocks[name] = []
  return val
}

exports.showBool = (bool) => {
  return bool
    ? '<span class="tag indicator is-success">✓</span>'
    : '<span class="tag indicator is-danger">✕</span>'
}

exports.showBoolWarn = (bool) => {
  return bool
    ? '<span class="tag indicator is-warning">#</span>'
    : '<span class="tag indicator">-</span>'
}

exports.truncateEmail = (str) => {
  return str.length > 12 ? str.substr(0, 8) + '...' + str.substr(str.length - 5) : str
}

exports.hashEmail = (email) => {
  return crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex')
}
