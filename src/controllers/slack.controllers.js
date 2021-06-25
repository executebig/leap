const config = require('@config')
const { prettyTime } = require('@libs/helpers')

const { WebClient } = require('@slack/web-api')

const client = new WebClient(config.slack.botToken)

exports.sendSubmission = async ({
  submission_id,
  user_id,
  project_id,
  module_id,
  content,
  created_at
}) => {
  let url = `https://${config.domain}/admin/submissions/edit/${submission_id}`

  if (config.domain.includes('localhost')) {
    url = url.replace('https', 'http')
  }

  const msg = await client.chat.postMessage({
    channel: config.slack.submissionsChannel,
    text: ':poggies: New Submission!',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: ':poggies: New Submission!',
          emoji: true
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Submission ID* ${submission_id}`
          },
          {
            type: 'mrkdwn',
            text: `*User ID:* ${user_id}`
          },
          {
            type: 'mrkdwn',
            text: `*Project ID:* ${project_id}`
          },
          {
            type: 'mrkdwn',
            text: `*Module ID:* ${module_id}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: url
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `🕒 *Created At:* ${prettyTime(created_at)}`
          }
        ]
      }
    ]
  })

  await client.chat.postMessage({
    channel: config.slack.submissionsChannel,
    text: content,
    thread_ts: msg.ts
  })
}
