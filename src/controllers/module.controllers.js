/**
    @author Brian Xiang
 */

const db = require('@db')
const markdown = require('@libs/markdown')

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
  const { title, description, content, notion_link, points, required, enabled } = data
  const renderedContent = markdown(content)

  const q = await db.query(
    `
    INSERT INTO modules (title, description, content, notion_link, rendered_content, points, required, enabled, project_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [title, description, content, notion_link, renderedContent, points, required, enabled, project_id]
  )

  return q?.rows[0]
}

exports.updateModule = async (module_id, data) => {
  const { title, description, content, notion_link, points, required, enabled } = data
  const renderedContent = markdown(content)

  const q = await db.query(
    `
    UPDATE modules
    SET title = $1, description = $2, content = $3, notion_link = $4, rendered_content = $5, points = $6, required = $7, enabled = $8
    WHERE module_id = $9
    RETURNING *`,
    [title, description, content, notion_link, renderedContent, points, required, enabled, module_id]
  )

  return q?.rows[0]
}
