type Agent = any

export type CompletionProvider = {
  name: string
  handler: (data: any, agent: Agent) => Promise<any[]>
}

export type PluginSecret = {
  name: string
  key: string
  global?: boolean
  getUrl?: string
}

export type Command = {
  name: string
  description: string
  command: string
  icon: string
}

export type ExtendableAgent = Agent & {
  [key: string]: any
}

export type PluginClientCommandList = Record<string, Command>

export type PluginServerCommandList = Record<
  string,
  (data: any, agent: ExtendableAgent) => void
>

export type PluginIOType = {
  name: string
  inspectorControls?: any[]
  sockets?: any[]
  defaultResponseOutput?: string
  handler?: ({
    output,
    agent,
    event,
  }: {
    output: string
    agent: ExtendableAgent
    event: any
  }) => Promise<void>
}

type PluginConstuctor = {
  name: string
  secrets?: PluginSecret[]
  completionProviders?: CompletionProvider[]
  agentCommands?: PluginServerCommandList
}
export class Plugin {
  name: string
  secrets: PluginSecret[]
  completionProviders: CompletionProvider[]
  constructor({
    name,
    secrets = [],
    completionProviders = [],
  }: PluginConstuctor) {
    this.name = name
    this.secrets = secrets
    this.completionProviders = completionProviders
  }
}
