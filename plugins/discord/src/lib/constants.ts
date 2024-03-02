import { PluginCredential } from 'packages/server/credentials/src'
import { createEventsEnum } from 'plugins/shared/src'
import { Events } from 'discord.js'
import { DiscordEvents, DiscordPluginState } from './types'

export const discordPluginName = 'discord' as const

export const discordPluginCredentials: PluginCredential[] = [
  {
    name: 'discord-token',
    serviceType: 'discord',
    credentialType: 'plugin',
    initials: 'DC',
    clientName: 'Discord Token',
    icon: 'https://discord.com/assets/f8389ca1a741a115313bede9ac02e2c0.svg',
    helpLink: 'https://discord.com/developers/applications',
    description: 'Used to connect to Discord',
    available: true,
    pluginName: discordPluginName,
  },
]

export const discordEventNames: DiscordEvents[] = [
  Events.MessageCreate,
  Events.MessageReactionAdd,
]

export const DISCORD_EVENTS = createEventsEnum(discordEventNames)

export const DISCORD_ACTIONS = createEventsEnum([
  'sendMessage',
  'sendImage',
  'sendAudio',
])

export const DISCORD_KEY = 'discordClient' as const

export const DISCORD_DEVELOPER_MODE = false

export const discordDefaultState: DiscordPluginState = {
  enabled: false,
  context: {
    id: '',
    username: '',
    displayName: '',
    avatar: '',
    banner: '',
  },
}
