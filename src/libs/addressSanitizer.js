const states = require('us-state-codes')

module.exports = (input) => {
  const { s1, s2, city, state, zip } = input

  const addr = []
  addr.push(stripSpaceAndComma(s1))

  if (!(typeof s2 === 'undefined' || s2 === '')) {
    addr.push(stripSpaceAndComma(s2))
  }

  addr.push(stripSpaceAndComma(city))
  addr.push(sanitizeState(stripSpaceAndComma(state)))
  addr.push(stripSpaceAndComma(zip + ''))

  return addr.join(', ')
}

// strips all leading/trailing spaces and trailing commas
const stripSpaceAndComma = (str) => {
  return str.trim().replace(/(,$)/g, '')
}

const sanitizeState = (str) => {
  if (str.length === 2) {
    return states.sanitizeStateCode(str)
  } else {
    return states.getStateCodeByStateName(str)
  }
}
