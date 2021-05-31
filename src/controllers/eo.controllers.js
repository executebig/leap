/**
    @author Brian Xiang
 */

const axios = require('axios')
const crypto = require('crypto')
const { RateLimiter } = require('limiter')

const config = require('@config')

const limiter = new RateLimiter({ tokensPerInterval: 5, interval: 'second' })

exports.updateContact = async (
  { email, first_name, last_name, display_name, user_id, state, no_shipping },
  newContact = false
) => {
  await limiter.removeTokens(1)
  return axios({
    method: newContact ? 'POST' : 'PUT',
    url: `https://emailoctopus.com/api/1.5/lists/${config.emailOctopus.listId}/contacts${
      newContact ? '' : '/' + crypto.createHash('md5').update(email).digest('hex')
    }`,
    data: {
      api_key: config.emailOctopus.key,
      email_address: email,
      fields: {
        FirstName: first_name,
        LastName: last_name,
        DisplayName: display_name,
        UserID: user_id,
        State: state,
        NoShipping: !!no_shipping
      },
      status: 'SUBSCRIBED'
    }
  })
    .then(() => console.log(`[EmailOctopus] Updated contact for ${email}`))
    .catch((err) => {
      console.log(err)
      if (err?.response?.data) {
        const { code, message } = err.response.data.error
        console.error(`[EmailOctopus] ${err.message}`)
        console.error(`[EmailOctopus] ${code}: ${message}`)
      } else {
        console.error(`[EmailOctopus] ${err}`)
      }
    })
}
