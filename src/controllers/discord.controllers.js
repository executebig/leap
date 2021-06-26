const config = require('@config')

const axios = require('axios')
const Discord = require('discord.js')
const client = new Discord.Client()

client.on('ready', () => {
  console.log('[Discord] Discord bot ready!')
})

exports.getTokenFromCode = async (code) => {
  const url = `https://discordapp.com/api/oauth2/token`
  const redirect =
    (config.env === 'development' ? 'http://' : 'https://') +
    config.domain +
    '/account/discord/callback'

  const data = `client_id=${config.discord.client}&client_secret=${config.discord.secret}&grant_type=authorization_code&code=${code}&redirect_uri=${redirect}&scope=identify%20guilds.join`
  const tokenGrant = await axios.post(url, data).catch((err) => console.log(err))

  return tokenGrant.data ? tokenGrant.data.access_token : null
}

exports.getUserFromToken = async (token) => {
  const request = await axios.get(`https://discordapp.com/api/users/@me`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  return request.data
}

exports.joinUserToGuild = async (token, user) => {
  const url = `https://discordapp.com/api/guilds/${config.discord.guild}/members/${user.id}`
  const data = {
    access_token: token
  }

  const request = await axios
    .put(url, data, {
      headers: {
        Authorization: `Bot ${config.discord.bot_token}`,
        'Content-Type': 'application/json'
      }
    })
    .catch((err) => {
      console.log(err)
    })
}

exports.grantRole = async (discord_id, role_name) => {
  const guild = client.guilds.cache.get(config.discord.guild)
  const role = guild.roles.cache.find((role) => role.name == role_name)
  const member = guild.members.cache.get(discord_id)

  member.roles.add(role)
}

client.login(config.discord.bot_token)
