/** 
    @author Mingjie Jiang
    aggregated badge controllers
*/

const db = require('@db')

exports.getBadgeByCode = async (code) => {
  code = code.toUpperCase()

  const data = await db.query('SELECT badge_id FROM badges WHERE code = $1', [code])

  if (data.rows.length === 0) {
    return -1
  } else {
    return data.rows[0].badge_id
  }
}
