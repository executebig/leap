/**
    @author Brian Xiang
 */

const db = require('@db')

exports.getProjectById = async (project_id) => {
  const q = await db.query('SELECT *, (SELECT coalesce(sum(points), 0) FROM modules WHERE project_id = $1) AS pts_total FROM projects WHERE project_id = $1', [project_id])

  return q?.rows[0]
}

exports.getProjectsByIds = async (project_ids) => {
  let projects = []

  for (let id of project_ids) {
    projects.push(await this.getProjectById(id))
  }

  return projects
}

// Returns num amount of random project ids
// Query doesn't scale well w/ larger datasets, but should be fine for our purposes
exports.getRandomProjectIds = async (num, exclude) => {
  const q = await db.query('SELECT project_id FROM projects WHERE NOT project_id = ANY ($2) ORDER BY random() LIMIT $1', [num, exclude])

  return q?.rows.map(e => e.project_id)
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