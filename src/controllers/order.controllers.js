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

exports.getOrderById = async (order_id) => {
  const q = await db.query('SELECT * FROM orders WHERE order_id = $1', [order_id])
  return q?.rows[0]
}

exports.listUserOrders = async (user_id) => {
  const q = await db.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY ordered_at ASC', [
    user_id
  ])
  return q?.rows
}

exports.getOrdersByReward = async (reward_id) => {
  const q = await db.query('SELECT * FROM orders WHERE reward_id = $1', [reward_id])
  return q?.rows
}

exports.setRaffleWinner = async (reward_id, winner_id) => {
  await db.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE reward_id = $2 AND order_id = $3', ["Order placed", reward_id, winner_id])
  await db.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE reward_id = $2 AND status = $3 AND order_id <> $4', [`Raffle lost - Winning entry #${winner_id}`, reward_id, "Pending raffle", winner_id])
}

exports.updateStatus = async(order_id, status) => {
   const q = await db.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2', [status, order_id])
}

exports.hasUserOrdered = async (user_id, reward_id) => {
  const q = await db.query('SELECT * FROM orders WHERE user_id = $1 AND reward_id = $2 LIMIT 1', [user_id, reward_id])

  console.log(q.rows)

  return q.rows.length > 0
}
