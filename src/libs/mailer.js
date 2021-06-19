const config = require('@config')

const postmark = require('postmark')
const client = new postmark.ServerClient(config.postmark.apiKey)

exports.sendMagic = async (email, hash) => {
  let magicLink = `https://${config.domain}/auth/magic?hash=${hash}`

  if (config.flags.includes('print_email')) {
    // dev flag to print the token instead of sending
    console.log('Magic link: ' + magicLink.replace('https://', 'http://'))
    return
  }

  client.sendEmailWithTemplate({
    From: config.postmark.from,
    To: email,
    TemplateAlias: 'magic-link',
    TemplateModel: {
      magic: magicLink
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
    console.log(
      `DQ email sent to ${email} with display name @${display_name} for "${reason}".`
    )
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
