const config = require('@config')

const Redis = require('ioredis')
const client = new Redis(config.redis)

module.exports = { client }
