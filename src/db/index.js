const config = require('@config')

const { Pool } = require('pg')
const pool = new Pool({
  connectionString: config.database,
  ssl: false,
  connectionTimeoutMillis: 5000
})

module.exports = {
  async query(text, params) {
    const start = Date.now()
    const res = await pool
      .query(text, params)
      .catch((err) => console.error('Error executing query ' + text, err.stack))
    const duration = Date.now() - start
    console.log('[postgres] executed query', {
      text,
      duration,
      rows: res.rowCount
    })

    return res
  },

  async getClient() {
    const client = await pool.connect()
    console.log('[postgres] A new client has been checked out!')

    const query = client.query
    const release = client.release

    // set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
      console.error(
        '[postgres] A client has been checked out for more than 5 seconds!'
      )
      console.error(
        `[postgres] The last executed query on this client was: ${client.lastQuery}`
      )
    }, 5000)

    // monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args
      return query.apply(client, args)
    }

    client.release = () => {
      // clear our timeout
      clearTimeout(timeout)
      // set the methods back to their old un-monkey-patched version
      client.query = query
      client.release = release

      console.log('[postgres] A client has been released.')
      return release.apply(client)
    }

    return client
  }
}

