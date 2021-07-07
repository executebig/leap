const config = require('@config')

const axios = require('axios')
const Discord = require('discord.js')
const client = new Discord.Client()

const UserController = require('@controllers/user.controllers')
const ModuleController = require('@controllers/module.controllers')
const ProjectController = require('@controllers/project.controllers')
const BadgeController = require('@controllers/badge.controllers')

client.on('ready', () => {
  console.log('[Discord] Discord bot ready!')

  client.user.setPresence({
    activity: {
      type: 'PLAYING',
      name: 'Tech Roulette'
    },
    status: 'online'
  })
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

client.on('message', async (message) => {
  if (message.author.bot) return

  if (
    message.mentions.users.keyArray().length > 0 &&
    message.mentions.users.first().id === client.user.id
  ) {
    const args = message.content.split(' ').slice(1)
    const isStaff = message.member.roles.cache.find((r) => r.name === 'Staff')

    if (args.length === 0) {
      return message.reply('Sup, no directive found.')
    }

    const adminOnlyCommands = ['user', 'm', 'p', 'grant', 'ungrant', 'refresh']
    if (adminOnlyCommands.includes(args[0]) && !isStaff) {
      return message.reply('You do not have permission for this command.')
    }

    const cmdArgs = args.slice(1)

    switch (args[0]) {
      case 'user':
        return await getUserByDiscord(message, cmdArgs)
        break
      case 'uid':
        return await getUserById(message, cmdArgs)
        break
      case 'm':
        return await getModuleById(message, cmdArgs)
        break
      case 'p':
        return await getProjectById(message, cmdArgs)
        break
      case 'grant':
        return await grantBadge(message, cmdArgs)
        break
      case 'ungrant':
        return await ungrantBadge(message, cmdArgs)
        break
      case 'refresh':
        return await refreshUser(message, cmdArgs)
        break
      default:
        return message.reply('Not a valid directive.')
    }
  }
})

const getUserByDiscord = async (message, args) => {
  const user = await getUserFromMention(args[0])

  if (!user) {
    return message.channel.send('Invalid user.')
  }

  const embed = generateUserEmbed(user)
  message.channel.send(embed)
}

const getUserById = async (message, args) => {
  const user = await UserController.getUserById(parseInt(args[0]))

  if (!user) {
    return message.channel.send('Invalid user.')
  }

  const embed = generateUserEmbed(user)
  message.channel.send(embed)
}

const getModuleById = async (message, args) => {
  const module_id = parseInt(args[0])
  const module = await ModuleController.getModuleById(module_id)

  if (!module) {
    return message.channel.send('Invalid module.')
  }

  const embed = generateModuleEmbed(module)
  message.channel.send(embed)
}

const getProjectById = async (message, args) => {
  const project_id = parseInt(args[0])
  const project = await ProjectController.getProjectById(project_id)

  if (!project) {
    return message.channel.send('Invalid project.')
  }

  const embed = generateProjectEmbed(project)
  message.channel.send(embed)
}

const grantBadge = async (message, args) => {
  const [user, badge] = await Promise.all([
    getUserFromMention(args[0]),
    BadgeController.getBadgeById(parseInt(args[1]))
  ])

  if (!user) {
    return message.channel.send('Invalid user.')
  } else if (!badge) {
    return message.channel.send('Invalid badge.')
  }

  await UserController.grantBadge(user.user_id, badge.badge_id)
  UserController.flagRefresh(user.user_id)

  const embed = new Discord.MessageEmbed()
    .setColor('#2ECC71')
    .setTitle(`✅ Badge "${badge.hidden ? '?????' : badge.name}" granted to @${user.display_name}`)
    .setDescription(
      badge.hidden ? "This is a hidden badge. I have no idea how it's earned." : badge.description
    )
    .setTimestamp()

  message.channel.send(embed)
}

const ungrantBadge = async (message, args) => {
  const [user, badge] = await Promise.all([
    getUserFromMention(args[0]),
    BadgeController.getBadgeById(parseInt(args[1]))
  ])

  if (!user) {
    return message.channel.send('Invalid user.')
  } else if (!badge) {
    return message.channel.send('Invalid badge.')
  }

  await UserController.removeBadge(user.user_id, badge.badge_id)
  UserController.flagRefresh(user.user_id)

  const embed = new Discord.MessageEmbed()
    .setColor('#2ECC71')
    .setTitle(
      `🤏 Badge "${badge.hidden ? '?????' : badge.name}" removed from @${user.display_name}`
    )
    .setTimestamp()

  message.channel.send(embed)
}

const getUserFromMention = async (mention) => {
  const matches = mention.match(/^<@!?(\d+)>$/)
  if (!matches) return null
  const id = matches[1]
  const target = client.users.cache.get(id)

  return await UserController.getUserByDiscord(target.id)
}

const refreshUser = async (message, args) => {
  const user = await getUserFromMention(args[0])

  if (!user) {
    return message.channel.send('Invalid user.')
  }

  UserController.flagRefresh(user.user_id)

  const embed = new Discord.MessageEmbed()
    .setColor('#2ECC71')
    .setTitle(`✅ Refreshed user @${user.display_name}`)
    .setTimestamp()

  message.channel.send(embed)
}

const generateUserEmbed = (user) => {
  const emailhash = require('crypto')
    .createHash('md5')
    .update(user.email.trim().toLowerCase())
    .digest('hex')

  return new Discord.MessageEmbed()
    .setColor('#3d6aff')
    .setTitle(`User @${user.display_name} [#${user.user_id}]`)
    .setThumbnail(`https://gravatar.com/avatar/${emailhash}?d=retro&s=128`)
    .addFields(
      {
        name: 'Current Project',
        value: `W${user.current_week}P${user.current_project}`,
        inline: true
      },
      { name: 'Chip Balance', value: `$${user.points}`, inline: true }
    )
    .setTimestamp()
}

const generateModuleEmbed = (module) => {
  return new Discord.MessageEmbed()
    .setColor('#3d6aff')
    .setTitle(`P${module.project_id}M${module.module_id}: ${module.title}`)
    .setDescription(module.description)
    .addFields(
      { name: 'Value', value: `$${module.points}` },
      {
        name: 'Required',
        value: `${module.Required ? '✅' : '❌'}`,
        inline: true
      },
      {
        name: 'Enabled',
        value: `${module.enabled ? '✅' : '❌'}`,
        inline: true
      }
    )
    .setTimestamp()
}

const generateProjectEmbed = (project) => {
  return new Discord.MessageEmbed()
    .setColor('#3d6aff')
    .setTitle(`P${project.project_id}: ${project.title}`)
    .setDescription(project.description)
    .setThumbnail(project.thumbnail_url)
    .addFields(
      { name: 'Total Value', value: `$${project.pts_total}` },
      { name: 'Type', value: project.type, inline: true },
      {
        name: 'Hardware',
        value: `${project.hardware ? '✅' : '❌'}`,
        inline: true
      },
      {
        name: 'Enabled',
        value: `${project.enabled ? '✅' : '❌'}`,
        inline: true
      }
    )
    .setTimestamp()
}

// client.login(config.discord.bot_token)
