const postmark = require('postmark')
const marked = require('marked')

const config = require('@config')

const UserController = require('@controllers/user.controllers')
const ProjectController = require('@controllers/project.controllers')
const ModuleController = require('@controllers/module.controllers')

const client = new postmark.ServerClient(config.postmark.apiKey)

exports.sendMagic = async (email, magic_code) => {
  let magic_link = `https://${config.domain}/auth/magic?code=${magic_code}`

  if (config.flags.includes('print_email')) {
    // dev flag to print the token instead of sending
    console.log('Magic Link: ' + magic_link.replace('https://', 'http://'))
    console.log('Magic Code: ' + magic_code)
    return
  }

  client.sendEmailWithTemplate({
    From: config.postmark.from,
    To: email,
    TemplateAlias: 'magic-link-with-code',
    TemplateModel: {
      magic_link,
      magic_code
    }
  })
}

const btoa = (b) => Buffer.from(b).toString('base64')

exports.sendInvite = async (email, referrer) => {
  const data = {
    email,
    referrer: {
      first_name: referrer.first_name,
      last_name: referrer.last_name,
      display_name: referrer.display_name
    }
  }
  const encodedData = btoa(JSON.stringify(data))
  const entryUrl = `https://${config.domain}/?referral=${encodedData}`

  if (config.flags.includes('print_email')) {
    console.log(
      `Referrer invite (${referrer.display_name} -> ${email}): ${entryUrl.replace(
        'https://',
        'http://'
      )}`
    )
    return
  }

  client.sendEmailWithTemplate({
    From: config.postmark.from,
    To: email,
    TemplateAlias: 'invite-user',
    TemplateModel: {
      referrer,
      entryUrl
    }
  })
}

exports.sendNudge = async (email, referrer) => {
  const data = {
    email,
    referrer: {
      first_name: referrer.first_name,
      last_name: referrer.last_name,
      display_name: referrer.display_name
    }
  }
  const encodedData = btoa(JSON.stringify(data))
  const entryUrl = `https://${config.domain}/?referral=${encodedData}`

  if (config.flags.includes('print_email')) {
    console.log(
      `Referrer nudge (${referrer.display_name} -> ${email}): ${entryUrl.replace(
        'https://',
        'http://'
      )}`
    )
    return
  }

  client.sendEmailWithTemplate({
    From: config.postmark.from,
    To: email,
    TemplateAlias: 'nudge-user',
    TemplateModel: {
      referrer,
      entryUrl
    }
  })
}

exports.sendShippingDQ = async (email, display_name, reason) => {
  if (config.flags.includes('print_email')) {
    console.log(`DQ email sent to ${email} with display name @${display_name} for "${reason}".`)
    return
  }

  client.sendEmailWithTemplate({
    From: config.postmark.from,
    To: email,
    TemplateAlias: 'shipping-dq',
    TemplateModel: {
      display_name,
      reason
    }
  })
}

exports.sendSubmissionRejection = async (submission, comments) => {
  const user = await UserController.getUserById(submission.user_id)
  const project = await ProjectController.getProjectById(submission.project_id)
  const module = await ModuleController.getModuleById(submission.module_id)

  comments = marked(comments)

  if (config.flags.includes('print_email')) {
    console.log(`[Submission Rejection] from ${user.display_name} for ${project.title} - ${module.title}`)
    console.log(`[Submission Rejection] comments: ${comments}`)
    return
  }

  client.sendEmailWithTemplate({
    From: config.postmark.from,
    To: user.email,
    TemplateAlias: 'submission-rejection',
    TemplateModel: {
      display_name: user.display_name,
      project_title: project.title,
      module_title: module.title,
      comments
    }
  })
}
