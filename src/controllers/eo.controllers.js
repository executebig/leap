/**
    @author Brian Xiang
 */

const axios = require('axios')

const config = require('@config')

exports.updateUser = async ({ email, first_name, last_name }) => {
  axios.post(`https://emailoctopus.com/api/1.5/lists/${config.emailOctopus.listId}/contacts`, {
    "api_key": config.emailOctopus.key,
    "email_address": email,
    "fields": {
        "FirstName": first_name,
        "LastName": last_name
    },
    "status": "SUBSCRIBED"
  })
    .then(console.log)
    .catch(console.error)
}
