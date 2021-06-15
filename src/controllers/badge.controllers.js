/** 
    @author Mingjie Jiang
    aggregated badge controllers
*/

const db = require('@db')

exports.createBadge = async (name, desc, icon, hidden, code) => {
  const badge = await db.query(
    'INSERT INTO badges (name, description, icon, hidden, code) VALUES ($1, $2, $3, $4, $5) RETURNING badge_id',
    [name, desc, icon, hidden, code]
  )
  return badge.rows[0]
}

exports.updateBadge = async (badge_id, name, desc, icon, hidden, code) => {
  const badge = await db.query(
    `UPDATE badges SET name = $1, description = $2, icon = $3, hidden = $4, code = $5 WHERE badge_id = $6 RETURNING badge_id`,
    [name, desc, icon, hidden, code, badge_id]
  )
  
  return badge.rows[0]
}

exports.listBadges = async (withHidden) => {
  if (withHidden) {
    const badges = await db.query('SELECT * FROM badges ORDER BY badge_id ASC')
    return badges.rows
  } else {
    const badges = await db.query('SELECT * FROM badges WHERE hidden <> true ORDER BY badge_id ASC')
    return badges.rows
  }
}

exports.getBadgeById = async (id) => {
  const q = await db.query('SELECT * FROM badges WHERE badge_id = $1', [id])
  if (q.rows.length > 0) {
    return q.rows[0]
  } else {
    return null
  }
}

exports.getBadgeIdByCode = async (code) => {
  code = code.toUpperCase()
  const data = await db.query('SELECT badge_id FROM badges WHERE code = $1', [code])

  if (data.rows.length === 0) {
    return -1
  } else {
    return data.rows[0].badge_id
  }
}
