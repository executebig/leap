/**
    @author Mingjie Jiang
    aggregated admin action controllers
*/

const db = require('@db')

const PAGE_SIZE = 20
const FALLBACK = {
  users: [],
  nextPage: -1,
  prevPage: -1
}

const generateSearchResult = (users, page) => {
  if (users.rows.length > 0) {
    const total_pages = users.rows[0].total_users / PAGE_SIZE
    return {
      users: users.rows,
      nextPage: page < total_pages ? page + 1 : -1,
      prevPage: page > 1 ? page - 1 : -1
    }
  } else {
    return FALLBACK
  }
}

/** returns a list of all users in the current page
    paginaged by PAGE_SIZE */
exports.listUsers = async (orderBy, order, page = 1) => {
  const allowedOrderingFields = ['user_id', 'email', 'display_name', 'created_at']
  const allowedOrders = ['ASC', 'DESC']
  page = parseInt(page)

  if (!allowedOrderingFields.includes(orderBy)) {
    return FALLBACK
  } else if (!allowedOrders.includes(order)) {
    return FALLBACK
  }

  const users = await db.query(
    `SELECT *, count(*) OVER() AS total_users FROM users ORDER BY ${orderBy} ${order} OFFSET $1 LIMIT $2`,
    [(page - 1) * PAGE_SIZE, PAGE_SIZE]
  )

  return generateSearchResult(users, page)
}

exports.searchUsers = async (scope, query, page = 1) => {
  const allowedScopes = ['user_id', 'email', 'names', 'address']

  if (!allowedScopes.includes(scope)) {
    return FALLBACK
  }

  const operator = scope === 'user_id' ? '=' : 'ILIKE'

  const users = await db.query(
    `SELECT * FROM users WHERE ${scope} ${operator} $1 OFFSET $2 LIMIT $3`,
    [scope === 'user_id' ? query : `%${query}%`, (page - 1) * PAGE_SIZE, PAGE_SIZE]
  )

  return generateSearchResult(users, page)
}

/** search users by all names: first, last, & display */
exports.searchUsersByName = async (query, page = 1) => {
  const users = await db.query(
    `SELECT * FROM users WHERE LOWER(first_name) || ' ' || LOWER(last_name) || ' ' || LOWER(display_name) ILIKE $1 OFFSET $2 LIMIT $3`,
    [`%${query}%`, (page - 1) * PAGE_SIZE, PAGE_SIZE]
  )

  return generateSearchResult(users, page)
}

exports.listSubmissions = async (filter, orderBy, order, page = 1) => {
  const allowedFilters = ['pending', 'accepted', 'rejected']
  const allowedOrderingFields = ['created_at']
  const allowedOrders = ['ASC', 'DESC']
  page = parseInt(page)

  const fallback = {
    submissions: [],
    nextPage: -1,
    prevPage: -1
  }

  if (!allowedFilters.includes(filter) || !allowedOrderingFields.includes(orderBy) || !allowedOrders.includes(order)) {
    return fallback
  }

  const submissions = await db.query(
    `SELECT *, count(*) OVER() AS total_submissions FROM submissions WHERE state = $3 ORDER BY ${orderBy} ${order} OFFSET $1 LIMIT $2`,
    [(page - 1) * PAGE_SIZE, PAGE_SIZE, filter]
  )
  if (submissions.rows.length > 0) {
    const total_pages = submissions.rows[0].total_submissions / PAGE_SIZE

    return {
      submissions: submissions.rows,
      nextPage: page < total_pages ? page + 1 : -1,
      prevPage: page > 1 ? page - 1 : -1
    }
  } else {
    return fallback
  }
}
