/**
    @author Brian Xiang
 */

const db = require('@db')

exports.getModule = async (module_id, project_id) => {
  const q = await db.query('SELECT * FROM modules WHERE module_id = $1 AND project_id = $2', [module_id, project_id])

  return q?.rows[0]
}