/**
    @author Brian Xiang
    Redis cached config values pulled from config table
 */

const db = require('@db')
const { client: redis } = require('@db/redis')

// Returns value associated w/ key
exports.get = async (key) => {
  let value = await redis.get(`config:${key}`)

  if (!value) {
    const q = await db.query('SELECT value FROM config WHERE key = $1', [key])
    value = q?.rows[0]?.value
    redis.set(`config:${key}`, value)
  }

  return value
}

exports.setMultiple = async (data) => {
  for (const key in data) {
    const value = data[key]

    await redis.set(`config:${key}`, value)
    await db.query(`
      INSERT INTO config (key, value)
      VALUES ($1, $2)
      ON CONFLICT (key) DO
      UPDATE SET value = $2
    `, [key, value])
  }
}

// Returns all keys & values as an object
exports.getKeysValues = async () => {
  const q = await db.query('SELECT * FROM config')

  let res = {}
  q?.rows.forEach(({ key, value }) => {
    res[key] = value
  })

  return res
}