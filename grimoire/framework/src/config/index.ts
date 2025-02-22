import type { NitroConfig } from 'nitro/types'

type GrimoireConfig = {
  agent: {
    name: string
    id: string
    projectId: string
    enabled: boolean
    version: string
    description: string
    image: string
  }
  nitro: NitroConfig
}

export function defineGrimoireConfig(config: GrimoireConfig): GrimoireConfig {
  return config
}

export type { NitroConfig, GrimoireConfig }
