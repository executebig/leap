/**
    @author Mingjie Jiang
 */

const db = require('@db')
const redis = require('@db/redis').client
const mailer = require('@libs/mailer')
const validateEmail = require('@libs/validateEmail')
const EOController = require('@controllers/eo.controllers')

const fields = [
  'user_id',
  'display_name',
  'first_name',
  'last_name',
  'email',
  'no_shipping',
  'state',
  'admin',
  'points',
  'current_week',
  'current_project',
  'project_pool',
  'prev_projects',
  'prev_modules',
  'badges'
].join(', ')

exports.getUserById = async (user_id) => {
  const q = await db.query(`SELECT ${fields} FROM users WHERE user_id = $1`, [user_id])
  console.log(q?.rows[0])

  if (q.rows.length > 0) {
    return q.rows[0]
  } else {
    return null
  }
}

exports.getUserByEmail = async (email) => {
  const q = await db.query(`SELECT ${fields} FROM users WHERE email = $1`, [email])

  if (q.rows.length > 0) {
    return q.rows[0]
  } else {
    return null
  }
}

/** creates the user with the email address, returns the UUID */
exports.createUserByEmail = async (email) => {
  const q = await db.query(
    `INSERT INTO users (email, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING ${fields}`,
    [email]
  )

  // Add user to EO contacts
  EOController.updateContact({ email, state: 'onboarding' }, true)

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
  query.push(`WHERE user_id = ${user_id} RETURNING ${fields}`)

  let vals = Object.keys(data).map((key) => {
    return data[key]
  })

  const newUser = (await db.query(query.join(' '), vals))?.rows[0]

  // Add user to EO contacts
  EOController.updateContact(newUser)

  return newUser
}

exports.inviteUser = async (email, referrer) => {
  // silently exit if email invalid
  if (!validateEmail(email) || email === referrer.email) {
    return
  }

  // check if the user already exists
  const userCheck = await db.query('SELECT state FROM users WHERE email = $1', [email])
  if (userCheck.rows.length > 0) {
    // user exists
    if (userCheck.rows[0].state === 'onboarding' || userCheck.rows[0].state === 'invited') {
      // send onboarding nudge
      await mailer.sendNudge(email, referrer)
    } else {
      // user already exists, silently exit
      return
    }
  } else {
    // new user, send invite, add EO contact, & create user
    await mailer.sendInvite(email, referrer)
    EOController.updateContact({ email, state: 'invited' }, true)
    await db.query(
      `INSERT INTO users (email, created_at, updated_at, referrer, state) VALUES ($1, NOW(), NOW(), $2, 'invited') RETURNING ${fields}`,
      [email, referrer.user_id]
    )
  }
}

// Flags user for session refresh
exports.flagUser = async (user_id) => {
  redis.set(`refresh:${user_id}`, 1)
}

exports.checkUserFlag = async (user_id) => {
  const key = `refresh:${user_id}`
  return !!(await redis.pipeline().get(key).del(key))
}
