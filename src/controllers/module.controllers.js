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

exports.getModules = async () => {
  const q = await db.query('SELECT * FROM modules')

  return q?.rows
}

exports.getModulesByProjectId = async (project_id) => {
  const q = await db.query('SELECT * FROM modules WHERE project_id = $1', [project_id])

  return q?.rows
}

exports.createModule = async (data, project_id) => {
  const { title, description, content, points, required, enabled } = data

  const q = await db.query(
    `
    INSERT INTO modules (title, description, content, points, required, enabled, project_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [title, description, content, points, required, enabled, project_id]
  )

  return q?.rows[0]
}

exports.updateModule = async (module_id, data) => {
  const { title, description, content, points, required, enabled } = data

  const q = await db.query(
    `
    UPDATE modules
    SET title = $1, description = $2, content = $3, points = $4, required = $5, enabled = $6
    WHERE module_id = $7
    RETURNING *`,
    [title, description, content, points, required, enabled, module_id]
  )

  return q?.rows[0]
}
