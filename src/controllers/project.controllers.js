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

// Returns modules associated w/ project, filtered by required flag
exports.getModulesById = async (project_id, required) => {
  const q = await db.query('SELECT * FROM modules WHERE project_id = $1 AND required = $2', [project_id, required])

  return q?.rows
}

exports.getProjectAndModulesById = async (project_id) => {
  return {
    project: await exports.getProjectById(project_id),
    modules_required: await exports.getModulesById(project_id, true),
    modules_optional: await exports.getModulesById(project_id, false)
  }
}