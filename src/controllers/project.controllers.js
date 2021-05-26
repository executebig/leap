/**
    @author Brian Xiang
 */

const db = require('@db')

exports.getProjectById = async (project_id) => {
  const q = await db.query('SELECT * FROM projects WHERE project_id = $1', [project_id])

  return q?.rows[0]
}

// Returns num amount of random projects
// Query doesn't scale well w/ larger datasets, but should be fine for our purposes
exports.getRandomProjects = async (num) => {
  const q = await db.query('SELECT * FROM projects ORDER BY random() LIMIT $1', [num])

  return q?.rows
}
