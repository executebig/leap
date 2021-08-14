const db = require('@db')
const UserController = require('@controllers/user.controllers')
const ProjectController = require('@controllers/project.controllers')
const SubmissionController = require('@controllers/submission.controllers')

module.exports = async () => {
  const users = (await db.query('SELECT * FROM users'))?.rows

  users.forEach(async user => {
    if (user.project_id_override === -1)
      return

    await UserController.updateUser(user.user_id, {
      prev_projects: user.prev_projects.filter(e => e !== 11)
    })

    const modulesRequired = await ProjectController.getRequiredModuleIdsByProjectId(11)
    const modulesSubmitted = (await SubmissionController.getLatestSubmissionsByUserId(user.user_id))
      .filter((e) => e.state === 'accepted' || e.state === 'pending')
      .map((e) => e.module_id)

    if (modulesRequired.every((module_id) => modulesSubmitted.includes(module_id))) {
      await UserController.updateUser(user.user_id, {
        state: 'completed'
      })
    }

    UserController.flagRefresh(user.id)
  })
}