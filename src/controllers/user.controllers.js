/**
    @author Mingjie Jiang
 */

const db = require('@db')
const redis = require('@db/redis').client
const mailer = require('@libs/mailer')
const validateEmail = require('@libs/validateEmail')

const EOController = require('@controllers/eo.controllers')
const ProjectController = require('@controllers/project.controllers')
const SubmissionController = require('@controllers/submission.controllers')

const fields = [
  'user_id',

  'display_name',
  'first_name',
  'last_name',
  // - age, address, phone
  'email',
  // - parent_email
  'no_shipping',
  // - referrer

  // - created_at, updated_at
  'state',
  'admin',
  'banned',

  'points',
  'current_week',
  'current_project',
  'project_pool',
  'prev_projects',
  'prev_modules',
  'badges',
  'discord_id',

  'current_session'
].join(', ')

exports.getUserById = async (user_id) => {
  const q = await db.query(`SELECT ${fields} FROM users WHERE user_id = $1`, [user_id])

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

exports.getAddressById = async (user_id) => {
  const q = await db.query(`SELECT address FROM users WHERE user_id = $1`, [user_id])

  if (q.rows.length > 0) {
    return q.rows[0].address
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
  this.flagRefresh(user_id)

  // Add user to EO contacts
  EOController.updateContact(newUser)
  return newUser
}

exports.grantPoints = async (user_id, points) => {
  const q = await db.query('UPDATE users SET points = points + $2 WHERE user_id = $1 RETURNING *', [
    user_id,
    points
  ])

  this.flagRefresh(user_id)

  return q?.rows?.[0]
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
exports.flagRefresh = (user_id) => {
  redis.set(`refresh:${user_id}`, 1)
}

exports.flagRefreshAll = async () => {
  const q = await db.query(`SELECT user_id FROM users`)
  const ids = q?.rows.map((e) => [`refresh:${e.user_id}`, 1])
  await redis.mset(...ids)
}

exports.checkRefreshFlag = async (user_id) => {
  const key = `refresh:${user_id}`
  return !!(await redis.getdel(key))
}

exports.banUser = async (user_id) => {
  this.updateUser(user_id, {
    banned: true
  })
}

exports.unbanUser = async (user_id) => {
  this.updateUser(user_id, {
    banned: false
  })
}

exports.grantBadge = async (user_id, badge_id) => {
  const user = await db.query(
    `UPDATE users SET badges = array (SELECT distinct e FROM unnest(array_append(badges, $1)) AS e ORDER BY e) WHERE user_id = $2 RETURNING *`,
    [badge_id, user_id]
  )

  return user.rows[0]
}

// this should be used by admins only
exports.removeBadge = async (user_id, badge_id) => {
  const user = await db.query(
    `UPDATE users SET badges = array (SELECT distinct e FROM unnest(array_remove(badges, $1)) AS e ORDER BY e) WHERE user_id = $2 RETURNING *`,
    [badge_id, user_id]
  )

  return user.rows[0]
}

exports.getSubmissions = async (user_id) => {
  const q = await db.query('SELECT * FROM submissions WHERE user_id = $1', [user_id])

  return q.rows
}

exports.userHasCompletedProject = async (user_id, project_id) => {
  const modulesRequired = await ProjectController.getRequiredModuleIdsByProjectId(project_id)
  const modulesSubmitted = (await SubmissionController.getLatestSubmissionsByUserId(user_id))
    .filter((e) => e.state === 'accepted' || e.state === 'pending')
    .map((e) => e.module_id)

  return modulesRequired.every((module_id) => modulesSubmitted.includes(module_id))
}

exports.exchangeSession = async (user_id, new_session) => {
  const q = await db.query(
    'UPDATE users SET current_session = $1 WHERE user_id = $2 RETURNING (SELECT current_session FROM users WHERE user_id = $2) AS old_session',
    [new_session, user_id]
  )

  console.log(q)
  return q?.rows[0].old_session
}
