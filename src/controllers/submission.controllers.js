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

exports.createSubmission = async (data) => {
  const { title, description, content, points, required, enabled } = data
  const renderedContent = markdown(content)

  const q = await db.query(
    `
    INSERT INTO submissions (title, description, content, rendered_content, points, required, enabled, project_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [title, description, content, renderedContent, points, required, enabled]
  )

  return q?.rows[0]
}
