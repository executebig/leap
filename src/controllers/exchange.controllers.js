/**
    @author Mingjie Jiang
 */

const db = require('@db')

exports.createReward = async (data) => {
  const { name, description, image, quantity, needs_shipping, enabled, price, delivery } = data

  const q = await db.query(
    `INSERT INTO rewards (name, description, image, quantity, needs_shipping, enabled, price, delivery)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `,
    [name, description, image, quantity, needs_shipping, enabled, price, delivery]
  )

  return q?.rows[0]
}

exports.updateReward = async (reward_id, data) => {
  const { name, description, image, quantity, needs_shipping, enabled, price, delivery } = data

  const q = await db.query(
    `UPDATE rewards SET name = $1, description = $2, image = $3, quantity = $4, needs_shipping = $5, enabled = $6, price = $7, delivery = $8
        WHERE reward_id = $9
        RETURNING reward_id
    `,
    [name, description, image, quantity, needs_shipping, enabled, price, delivery, reward_id]
  )

  return q?.rows[0]
}

// this assumes that the quantity check was performed ahead of this query
exports.sellOne = async (reward_id) => {
  const q = await db.query(`UPDATE rewards SET quantity = quantity - 1 WHERE reward_id = $1`, [
    reward_id
  ])
}

exports.listAll = async () => {
  const q = await db.query('SELECT * FROM rewards ORDER BY reward_id ASC')
  return q?.rows
}

exports.listAvailable = async (no_shipping) => {
  const q = await db.query(
    'SELECT * FROM rewards WHERE (needs_shipping = false OR NOT $1) AND enabled = true ORDER BY price ASC',
    [no_shipping]
  )
  return q?.rows
}

exports.getRewardById = async (reward_id) => {
  const q = await db.query('SELECT * FROM rewards WHERE reward_id = $1', [reward_id])
  return q?.rows[0]
}
