/** 
    @author Mingjie Jiang 
 */

const db = require('@db')

exports.getUserById = async (uuid) => {
    const q = await db.query('SELECT * FROM users WHERE user_id = $1', [uuid])

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
    const q = await db.query('INSERT INTO users (email, created_at) VALUES ($1, NOW()) RETURNING *', [email])

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