'use strict'

const crypto = require('crypto')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const { Slugger } = require('marked')
const xss = require('xss')

dayjs.extend(utc)
dayjs.extend(timezone)

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

exports.prettyTime = (time) => {
  return dayjs(time).utc('z').local().tz("America/New_York").format('MM/DD, h:mm A') + " EDT"
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

exports.notContains = (array, item, options) => {
  return !array.includes(item) ? options.fn(this) : options.inverse(this)
}

exports.contains = (array, item, options) => {
  return array.includes(item) ? options.fn(this) : options.inverse(this)
}

exports.trimAddress = (addr) => {
  if (!addr) return ''
  return addr.split(',').slice(1)
}

exports.getSubmissionState = (submissions, module_id) => {
  const submission = submissions.find((e) => e.module_id === module_id)
  return submission?.state || ''
}

exports.select = (value, options) => {
  return options.fn(this).replace(new RegExp(' value="' + value + '"'), '$& selected="selected"')
}

exports.sanitize = (value, options) => {
  return xss(value)
}

exports.getUrl = (value, options) => {
  const url = xss(value.match(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/g))

  if (url) {
    return `<a href="${url}" target="_blank">${url}</a>`
  }

  return '...'
}

// Switch / case / default statement
exports.switch = (value, options) => {
  this.switch_value = value
  return options.fn(this)
}

exports.case = (value, options) => {
  if (value == this.switch_value) {
    return options.fn(this)
  }
}

// Markdown helpers
exports.MdToTableOfContents = (value, options) => {
  let res = `
    <div class="column is-3-desktop">
      <aside class="menu py-0 pl-0">
        <p class="menu-label">
          TABLE OF CONTENTS
        </p>

        <ul class="menu-list">
  `
  let prevIndent = 0

  const slugger = new Slugger()

  const codeBlockStripper = /(```.+?```)/gms
  value = value.replace(codeBlockStripper, '')

  const lines = value
    .split(/\r?\n/)
    .filter((e) => e.startsWith('#'))

  if (!lines.length) {
    return ''
  }

  lines.forEach(line => {
    const numIndent = line.split('#').length - 2

    if (prevIndent > numIndent) {
      res += `</ul></li>`
    } else if (numIndent > prevIndent) {
      res += `<li><ul>`
    }

    const title = line.split(/#+/)[1].trim()
    const slug = slugger.slug(title)

    res += `<a href="#${slug}">${title}</a>\n`

    prevIndent = numIndent
  })

  return res + `
        </ul>
      </aside>
    </div>
  `
}

// Color weighting helpers
exports.numSubmissionsAsColorWeight = (value, max, options) => {
  if (value >= parseInt(max, 10))
    return 'is-danger'
  else if (value > 0)
    return 'is-warning'
  else
    return 'is-primary'
}

exports.leq = (a, b, options) => {
  return a <= b ? options.fn(this) : options.inverse(this)
}
