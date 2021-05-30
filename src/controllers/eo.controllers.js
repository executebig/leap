/**
    @author Brian Xiang
 */

const axios = require('axios')
const crypto = require('crypto')

const config = require('@config')

const errorHandler = (err) => {
  if (err.response) {
    const { code, message } = err.response.data.error
    console.error(`[EmailOctopus] ${err.message}`)
    console.error(`[EmailOctopus] ${code}: ${message}`)
  } else {
    console.error(`[EmailOctopus] ${err}`)
  }
}

exports.addContact = async (email) => {
  return axios
    .post(`https://emailoctopus.com/api/1.5/lists/${config.emailOctopus.listId}/contacts`, {
      api_key: config.emailOctopus.key,
      email_address: email,
      status: 'UNSUBSCRIBED'
    })
    .then(() => console.log(`[EmailOctopus] Created contact for ${email}`))
    .catch(errorHandler)
}

exports.updateContact = async ({
  email,
  first_name,
  last_name,
  display_name,
  age,
  user_id,
  state,
  no_shipping,
  address
}) => {
  const emailMd5 = crypto.createHash('md5').update(email).digest('hex')

  return axios
    .put(
      `https://emailoctopus.com/api/1.5/lists/${config.emailOctopus.listId}/contacts/${emailMd5}`,
      {
        api_key: config.emailOctopus.key,
        email_address: email,
        fields: {
          FirstName: first_name,
          LastName: last_name,
          DisplayName: display_name,
          Age: age,
          UserID: user_id,
          State: state,
          NoShipping: !!no_shipping,
          Address: address
        },
        status: 'SUBSCRIBED'
      }
    )
    .then(() => console.log(`[EmailOctopus] Updated contact for ${email}`))
    .catch(errorHandler)
}
