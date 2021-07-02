/**
    @author Mingjie Jiang
 */

const db = require('@db')

exports.createOrder = async (data) => {
  const { reward_id, user_id, reward_name, email, address, status } = data

  const q = await db.query(
    'INSERT INTO orders (ordered_at, reward_id, user_id, reward_name, email, address, status, updated_at) VALUES (NOW(), $1, $2, $3, $4, $5, $6, NOW())',
    [reward_id, user_id, reward_name, email, address, status]
  )

  return q.rows[0]
}

exports.listUserOrders = async (user_id) => {
    const q = await db.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY ordered_at ASC', [user_id])
    return q?.rows
}
