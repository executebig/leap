/**
    @author Mingjie Jiang
    aggregated admin action controllers
*/

const db = require('@db')

const PAGE_SIZE = 20

/** returns a list of all users in the current page
    paginaged by PAGE_SIZE */
exports.listUsers = async (orderBy, order, page = 1) => {
  const allowedOrderingFields = ['user_id', 'email', 'display_name', 'created_at']
  const allowedOrders = ['ASC', 'DESC']
  page = parseInt(page)

  const fallback = {
    users: [],
    nextPage: -1,
    prevPage: -1
  }

  if (!allowedOrderingFields.includes(orderBy)) {
    return fallback
  } else if (!allowedOrders.includes(order)) {
    return fallback
  }

  const users = await db.query(
    `SELECT *, count(*) OVER() AS total_users FROM users ORDER BY ${orderBy} ${order} OFFSET $1 LIMIT $2`,
    [(page - 1) * PAGE_SIZE, PAGE_SIZE]
  )
  if (users.rows.length > 0) {
    const total_pages = users.rows[0].total_users / PAGE_SIZE
    return {
      users: users.rows,
      nextPage: page < total_pages ? page + 1 : -1,
      prevPage: page > 1 ? page - 1 : -1
    }
  } else {
    return fallback
  }
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

exports.searchUsers = async (field, query, page) => {}
