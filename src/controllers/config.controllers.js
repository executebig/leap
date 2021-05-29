/**
    @author Brian Xiang
 */

const db = require('@db')

exports.get = async (key) => {
  const q = await db.query('SELECT value FROM config WHERE key = $1', [key])

  return q?.rows[0]?.value
}