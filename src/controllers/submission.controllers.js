/**
    @author Brian Xiang
 */

const db = require('@db')

exports.getSubmissionById = async (submission_id) => {
  const q = await db.query('SELECT * FROM submissions WHERE submission_id = $1', [submission_id])

  return q?.rows[0]
}

exports.getLatestSubmission = async (user_id, module_id) => {
  const q = await db.query(`
    SELECT * FROM submissions
    WHERE
      user_id = $1 AND
      module_id = $2
    ORDER BY created_at DESC
    LIMIT 1
  `, [user_id, module_id])

  return q?.rows?.[0]
}

exports.getLatestSubmissionsByUserId = async (user_id) => {
  const q = await db.query(`
    SELECT DISTINCT ON (module_id) *
    FROM submissions
    WHERE user_id = $1
    ORDER BY module_id, created_at DESC
  `, [user_id])

  return q?.rows
}

exports.getSubmissionsByUserAndProjectId = async (user_id, project_id) => {
  const q = await db.query(`
    SELECT * FROM submissions
    WHERE
      user_id = $1 AND
      project_id = $2
    ORDER BY created_at DESC
  `, [user_id, project_id])

  return q?.rows
}

exports.listSubmissions = async () => {
  const q = await db.query('SELECT * FROM submissions ORDER BY submission_id ASC')

  return q?.rows
}

exports.createSubmission = async (content, user_id, project_id, module_id) => {
  const q = await db.query(
    `
    INSERT INTO submissions (created_at, user_id, project_id, module_id, content)
    VALUES (NOW(), $1, $2, $3, $4)
    RETURNING *`,
    [user_id, project_id, module_id, content]
  )

  return q?.rows[0]
}

exports.updateSubmission = async (submission_id, data) => {
  const { state, comments } = data

  const q = await db.query(
    `
    UPDATE submissions
    SET state = $1, comments = $2
    WHERE submission_id = $3
    RETURNING *`,
    [state, comments, submission_id]
  )

  return q?.rows[0]
}
