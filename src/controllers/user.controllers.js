/** 
    @author Mingjie Jiang 
 */

const db = require('@db')
const mailer = require('@libs/mailer')
const validateEmail = require('@libs/validateEmail')

exports.getUserById = async (user_id) => {
  const q = await db.query('SELECT * FROM users WHERE user_id = $1', [user_id])

  if (q.rows.length > 0) {
    return q.rows[0]
  } else {
    return null
  }
}

exports.getUserByEmail = async (email) => {
  const q = await db.query('SELECT * FROM users WHERE email = $1', [email])

  if (q.rows.length > 0) {
    return q.rows[0]
  } else {
    return null
  }
}

/** creates the user with the email address, returns the UUID */
exports.createUserByEmail = async (email) => {
  const q = await db.query(
    'INSERT INTO users (email, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *',
    [email]
  )

  return q.rows[0]
}

exports.getOrCreateUserByEmail = async (email) => {
  const user = await this.getUserByEmail(email)

  if (!user) {
    return await this.createUserByEmail(email)
  } else {
    return user
  }
}

exports.updateUser = async (user_id, data) => {
  let query = ['UPDATE users']
  query.push('SET')

  let set = []
  Object.keys(data).forEach((key, i) => {
    set.push(`${key} = ($${i + 1})`)
  })
  set.push('updated_at = NOW()')
  query.push(set.join(', '))
  query.push(`WHERE user_id = ${user_id} RETURNING *`)

  let vals = Object.keys(data).map((key) => {
    return data[key]
  })

  const q = await db.query(query.join(' '), vals)
  return q.rows[0]
}

exports.inviteUser = async (email, referrer) => {
  // silently exit if email invalid
  if (!validateEmail(email)) {
    return
  }

  // check if the user already exists
  const userCheck = await db.query('SELECT state FROM users WHERE email = $1', [email])
  if (userCheck.rows.length > 0) {
    // user exists
    if (userCheck.rows[0].state === 'onboarding') {
      // send onboarding nudge
      await mailer.sendNudge(email, referrer)
    } else {
      // user already exists, silently exit
      return
    }
  } else {
    // new user, send invite and create user
    await mailer.sendInvite(email, referrer)
    await db.query(
      `INSERT INTO users (email, created_at, updated_at, referrer, state) VALUES ($1, NOW(), NOW(), $2, 'invited') RETURNING *`,
      [email, referrer.user_id]
    )
  }
}
