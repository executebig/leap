/**
    @author Brian Xiang
 */

const axios = require('axios')
const crypto = require('crypto')
const { RateLimiter } = require('limiter')

const config = require('@config')

const limiter = new RateLimiter({ tokensPerInterval: 4, interval: 'second' })

exports.updateContact = async (
  { email, first_name, last_name, display_name, user_id, state, age, address, no_shipping },
  newContact = false
) => {
  await limiter.removeTokens(1)

  // Consume token, but don't do anything if disable_eo flag is enabled
  if (config.flags.includes('disable_eo')) {
    return
  }

  const fields = {
    FirstName: first_name,
    LastName: last_name,
    DisplayName: display_name,
    UserID: user_id,
    State: state,
    Age: age,
    Address: address,
    NoShipping: !!no_shipping
  }

  return axios({
    method: newContact ? 'POST' : 'PUT',
    url: `https://emailoctopus.com/api/1.5/lists/${config.emailOctopus.listId}/contacts${
      newContact ? '' : '/' + crypto.createHash('md5').update(email).digest('hex')
    }`,
    data: {
      api_key: config.emailOctopus.key,
      email_address: email,
      status: 'SUBSCRIBED',
      fields
    }
  })
    .then(() => {
      console.log(`[EmailOctopus] ${newContact ? 'Created' : 'Updated'} contact for: ${email}`)
    })
    .catch(async (err) => {
      if (err?.response?.data?.error) {
        const { code, message } = err.response.data.error
        console.error(`[EmailOctopus] ${err.message}`)
        console.error(`[EmailOctopus] ${code}: ${message}`)

        if (code === 'MEMBER_NOT_FOUND') {
          await limiter.removeTokens(1)
          axios
            .post(`https://emailoctopus.com/api/1.5/lists/${config.emailOctopus.listId}/contacts`, {
              api_key: config.emailOctopus.key,
              email_address: email,
              status: 'SUBSCRIBED',
              fields
            })
            .then(() => {
              console.log(`[EmailOctopus] Creating contact for: ${email}`)
            })
            .catch((err) => {
              console.error(`[EmailOctopus] An error occurred while creating the contact: ${err}`)
              console.error(err)
              console.error(err?.response?.data?.error)
            })
        }
      } else {
        console.error(`[EmailOctopus] ${err}`)
        console.error(err)
      }
    })
}
