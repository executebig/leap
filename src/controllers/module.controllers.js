/**
    @author Brian Xiang
 */

const db = require('@db')

exports.getModuleById = async (module_id) => {
  const q = await db.query('SELECT * FROM modules WHERE module_id = $1', [module_id])

  return q?.rows[0]
}