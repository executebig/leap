/**
    @author Brian Xiang
 */

const db = require('@db')

exports.getModule = async (module_id, project_id) => {
  const q = await db.query('SELECT * FROM modules WHERE module_id = $1 AND project_id = $2', [
    module_id,
    project_id
  ])

  return q?.rows[0]
}

exports.getModuleById = async (module_id) => {
  const q = await db.query('SELECT * FROM modules WHERE module_id = $1', [module_id])

  return q?.rows[0]
}

exports.listModules = async () => {
  const q = await db.query('SELECT * FROM modules ORDER BY module_id ASC')

  return q?.rows
}

exports.getModulesByProjectId = async (project_id) => {
  const q = await db.query('SELECT * FROM modules WHERE project_id = $1 ORDER BY title ASC', [project_id])

  return q?.rows
}

exports.createModule = async (project_id, data) => {
  const { title, description, notion_link, points, required, enabled } = data

  const q = await db.query(
    `
    INSERT INTO modules (title, description, notion_link, points, required, enabled, project_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [title, description, notion_link, points, required, enabled, project_id]
  )

  return q?.rows[0]
}

exports.updateModule = async (module_id, data) => {
  const { title, description, notion_link, points, required, enabled } = data

  const q = await db.query(
    `
    UPDATE modules
    SET title = $1, description = $2, notion_link = $3, points = $4, required = $5, enabled = $6
    WHERE module_id = $7
    RETURNING *`,
    [title, description, notion_link, points, required, enabled, module_id]
  )

  return q?.rows[0]
}
