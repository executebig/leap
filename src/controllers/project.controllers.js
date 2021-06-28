/**
    @author Brian Xiang
 */

const db = require('@db')

exports.getProjectById = async (project_id) => {
  const q = await db.query(
    'SELECT *, (SELECT coalesce(sum(points), 0) FROM modules WHERE project_id = $1) AS pts_total FROM projects WHERE project_id = $1',
    [project_id]
  )

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
// Excludes hardware projects if no_shipping is true
// Query doesn't scale well w/ larger datasets, but should be fine for our purposes
exports.getRandomProjectIds = async (num, exclude, no_shipping) => {
  const q = await db.query(
    `SELECT project_id FROM projects
    WHERE
      NOT project_id = ANY ($2) AND
      enabled = true AND
      hardware = false OR NOT $3
    ORDER BY random()
    LIMIT $1`,
    [num, exclude, no_shipping]
  )

  return q?.rows.map((e) => e.project_id)
}

// Returns modules associated w/ project, filtered by required flag
exports.getModulesById = async (project_id, required) => {
  const q = await db.query(
    `SELECT * FROM modules
    WHERE
      project_id = $1 AND
      required = $2 AND
      enabled = true`,
    [project_id, required]
  )

  return q?.rows
}

exports.getProjectAndModulesById = async (project_id) => {
  return {
    project: await exports.getProjectById(project_id),
    modules_required: await exports.getModulesById(project_id, true),
    modules_optional: await exports.getModulesById(project_id, false)
  }
}

exports.listProjects = async () => {
  const q = await db.query('SELECT * FROM projects ORDER BY project_id ASC')
  return q?.rows
}

exports.createProject = async (data) => {
  const { title, description, type, thumbnail_url, enabled, hardware } = data

  const q = await db.query(
    'INSERT INTO projects (title, description, type, thumbnail_url, enabled, hardware) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [title, description, type, thumbnail_url, enabled, hardware]
  )

  return q?.rows[0]
}

exports.updateProject = async (project_id, data) => {
  const { title, description, type, thumbnail_url, enabled, hardware } = data

  const q = await db.query(
    `
    UPDATE projects
    SET title = $1, description = $2, type = $3, thumbnail_url = $4, enabled = $5, hardware = $6
    WHERE project_id = $7
    RETURNING *`,
    [title, description, type, thumbnail_url, enabled, hardware, project_id]
  )

  return q?.rows[0]
}

exports.getRequiredModuleIdsByProjectId = async (project_id) => {
  const q = await db.query(`
    SELECT module_id FROM modules
    WHERE
      project_id = $1 AND
      required = true
  `, [project_id])

  return q?.rows?.map(row => row.module_id)
}