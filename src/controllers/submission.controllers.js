/**
    @author Brian Xiang
 */

const db = require('@db')

exports.getSubmissionById = async (submission_id) => {
  const q = await db.query('SELECT * FROM submissions WHERE submission_id = $1', [submission_id])

  return q?.rows[0]
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
