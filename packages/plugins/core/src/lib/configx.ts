import { z } from 'zod'
import {
  type ExtractPluginCredentialNames,
  type PluginStateType,
} from '@magickml/agent-plugin'
import { EventPayload } from '@magickml/shared-services'
import { PluginCredential } from '@magickml/credentials'
import { createEventsEnum } from '@magickml/shared-plugins'
import { EventTypes } from '@magickml/agent-communication'

// BASE
export const corePluginName = 'core' as const

// STATE
export type CoreAgentContext = {
  id: string | undefined
  name: string | undefined
  description: string | undefined
}

export interface CorePluginState extends PluginStateType {
  enabled: boolean
  context: CoreAgentContext
}

export const coreDefaultState: CorePluginState = {
  enabled: true,
  context: {
    id: '',
    name: '',
    description: '',
  },
}

export const corePluginStateSchema = z.object({
  enabled: z.boolean(),
  context: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
  }),
})

// parse but don't validate

export const parseCorePluginState = (state: unknown) => {
  return corePluginStateSchema.safeParse(state)
}

// validate and parse

export const validateCorePluginState = (state: unknown) => {
  return corePluginStateSchema.parse(state)
}

// CREDENTIALS

export const corePluginCredentials = [
  {
    name: 'OPENAI_API_KEY',
    serviceType: 'openai',
    credentialType: 'plugin',
    clientName: 'OpenAI',
    initials: 'OA',
    description: 'OpenAI API Key',
    icon: 'https://openai.com/favicon.ico',
    helpLink: 'https://platform.openai.com/api-keys',
    available: true,
    pluginName: corePluginName,
  },
  {
    name: 'ANYSCALE_API_KEY',
    serviceType: 'anyscale',
    credentialType: 'plugin',
    clientName: 'Anyscale',
    initials: 'AS',
    description: 'Anyscale API Key',
    icon: 'URL_to_Anyscale_Icon',
    helpLink: 'Anyscale_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'DEEPINFRA_API_KEY',
    serviceType: 'deepinfra',
    credentialType: 'plugin',
    clientName: 'DeepInfra',
    initials: 'DI',
    description: 'DeepInfra API Key',
    icon: 'URL_to_DeepInfra_Icon',
    helpLink: 'DeepInfra_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'SAGEMAKER_API_KEY',
    serviceType: 'sagemaker',
    credentialType: 'plugin',
    clientName: 'Sagemaker',
    initials: 'SM',
    description: 'Sagemaker API Key',
    icon: 'URL_to_Sagemaker_Icon',
    helpLink: 'Sagemaker_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'PERPLEXITY_API_KEY',
    serviceType: 'perplexity',
    credentialType: 'plugin',
    clientName: 'Perplexity',
    initials: 'PP',
    description: 'Perplexity API Key',
    icon: 'URL_to_Perplexity_Icon',
    helpLink: 'Perplexity_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'VLLM_API_KEY',
    serviceType: 'vllm',
    credentialType: 'plugin',
    clientName: 'VLLM',
    initials: 'VL',
    description: 'VLLM API Key',
    icon: 'URL_to_VLLM_Icon',
    helpLink: 'VLLM_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'COHERE_API_KEY',
    serviceType: 'cohere',
    credentialType: 'plugin',
    clientName: 'Cohere',
    initials: 'CH',
    description: 'Cohere API Key',
    icon: 'URL_to_Cohere_Icon',
    helpLink: 'Cohere_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'TOGETHERAI_API_KEY',
    serviceType: 'togetherai',
    credentialType: 'plugin',
    clientName: 'TogetherAI',
    initials: 'TA',
    description: 'TogetherAI API Key',
    icon: 'https://assets-global.website-files.com/64f6f2c0e3f4c5a91c1e823a/654693d569494912cfc0c0d4_favicon.svg',
    helpLink: 'https://docs.together.ai/reference/authentication-1',
    available: true,
    pluginName: corePluginName,
  },
  {
    name: 'ALEPHALPHA_API_KEY',
    serviceType: 'alephalpha',
    credentialType: 'plugin',
    clientName: 'AlephAlpha',
    initials: 'AA',
    description: 'AlephAlpha API Key',
    icon: 'URL_to_AlephAlpha_Icon',
    helpLink: 'AlephAlpha_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'BASETEN_API_KEY',
    serviceType: 'baseten',
    credentialType: 'plugin',
    clientName: 'BaseTen',
    initials: 'BT',
    description: 'BaseTen API Key',
    icon: 'URL_to_BaseTen_Icon',
    helpLink: 'BaseTen_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'OPENROUTER_API_KEY',
    serviceType: 'openrouter',
    credentialType: 'plugin',
    clientName: 'OpenRouter',
    initials: 'OR',
    description: 'OpenRouter API Key',
    icon: 'URL_to_OpenRouter_Icon',
    helpLink: 'OpenRouter_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'PETALS_API_KEY',
    serviceType: 'petals',
    credentialType: 'plugin',
    clientName: 'Petals',
    initials: 'PT',
    description: 'Petals API Key',
    icon: 'URL_to_Petals_Icon',
    helpLink: 'Petals_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'OLLAMA_API_KEY',
    serviceType: 'ollama',
    credentialType: 'plugin',
    clientName: 'Ollama',
    initials: 'OL',
    description: 'Ollama API Key',
    icon: 'URL_to_Ollama_Icon',
    helpLink: 'Ollama_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'GOOGLEAI_API_KEY',
    serviceType: 'googleai',
    credentialType: 'plugin',
    clientName: 'GoogleAI',
    initials: 'GA',
    description: 'GoogleAI API Key',
    icon: 'https://lh3.googleusercontent.com/RIR1USuPhQgIwCbC6X09bUiRZKCfu5EkZymDuG0mVQpCM42j0y4tvjSFmtZmezPgcfaCxbGSIkCjNlzXSo_p8KVoDqZvS5nEPKoqog',
    helpLink: 'https://ai.google.dev/tutorials/setup',
    available: true,
    pluginName: corePluginName,
  },
  {
    name: 'PALM_API_KEY',
    serviceType: 'palm',
    credentialType: 'plugin',
    clientName: 'Palm',
    initials: 'PM',
    description: 'Palm API Key',
    icon: 'https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA',
    helpLink: 'https://ai.google.dev/tutorials/setup',
    available: true,
    pluginName: corePluginName,
  },
  {
    name: 'HUGGINGFACE_API_KEY',
    serviceType: 'huggingface',
    credentialType: 'plugin',
    clientName: 'HuggingFace',
    initials: 'HF',
    description: 'HuggingFace API Key',
    icon: 'URL_to_HuggingFace_Icon',
    helpLink: 'HuggingFace_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'XINFERENCE_API_KEY',
    serviceType: 'xinference',
    credentialType: 'plugin',
    clientName: 'XInference',
    initials: 'XI',
    description: 'XInference API Key',
    icon: 'URL_to_XInference_Icon',
    helpLink: 'XInference_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'CLOUDFLAREWORKERS_API_KEY',
    serviceType: 'cloudflareworkers',
    credentialType: 'plugin',
    clientName: 'CloudflareWorkers',
    initials: 'CF',
    description: 'CloudflareWorkers API Key',
    icon: 'URL_to_CloudflareWorkers_Icon',
    helpLink: 'CloudflareWorkers_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'AI21_API_KEY',
    serviceType: 'ai21',
    credentialType: 'plugin',
    clientName: 'AI21',
    initials: 'AI',
    description: 'AI21 API Key',
    icon: 'URL_to_AI21_Icon',
    helpLink: 'AI21_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'NLPCLOUD_API_KEY',
    serviceType: 'nlpcloud',
    credentialType: 'plugin',
    clientName: 'NLP Cloud',
    initials: 'NC',
    description: 'NLP Cloud API Key',
    icon: 'URL_to_NLP_Cloud_Icon',
    helpLink: 'NLP_Cloud_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'VOYAGEAI_API_KEY',
    serviceType: 'voyageai',
    credentialType: 'plugin',
    clientName: 'VoyageAI',
    initials: 'VA',
    description: 'VoyageAI API Key',
    icon: 'URL_to_VoyageAI_Icon',
    helpLink: 'VoyageAI_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'REPLICATE_API_KEY',
    serviceType: 'replicate',
    credentialType: 'plugin',
    clientName: 'Replicate',
    initials: 'RP',
    description: 'Replicate API Key',
    icon: 'URL_to_Replicate_Icon',
    helpLink: 'Replicate_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'META_API_KEY',
    serviceType: 'meta',
    credentialType: 'plugin',
    clientName: 'Meta',
    initials: 'MT',
    description: 'Meta API Key',
    icon: 'URL_to_Meta_Icon',
    helpLink: 'Meta_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'MISTRAL_API_KEY',
    serviceType: 'mistral',
    credentialType: 'plugin',
    clientName: 'Mistral',
    initials: 'MI',
    description: 'Mistral API Key',
    icon: 'URL_to_Mistral_Icon',
    helpLink: 'Mistral_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
  {
    name: 'VERTEXAI_API_KEY',
    serviceType: 'vertexai',
    credentialType: 'plugin',
    clientName: 'VertexAI',
    initials: 'VA',
    description: 'VertexAI API Key',
    icon: 'URL_to_VertexAI_Icon',
    helpLink: 'VertexAI_Help_Link',
    available: false,
    pluginName: corePluginName,
  },
] as const satisfies ReadonlyArray<PluginCredential>

export type CorePluginCredentialNames = ExtractPluginCredentialNames<
  typeof corePluginCredentials
>

export type CorePluginCredentialsKeys = {
  [K in CorePluginCredentialNames]: string | undefined
}

export type CorePluginCredentials = Record<
  CorePluginCredentialNames,
  string | undefined
>

// EVENTS
export type CoreEvents = 'webhookReceived'

export const coreEventNames: CoreEvents[] = ['webhookReceived']

export const CORE_EVENTS = createEventsEnum(coreEventNames)

type ValidPayload = {
  content: string

  callback?: string
}

// export type CoreWebhookPayload = EventPayload<ValidPayload>['payload']

export const validateCoreWebhookPayload = (
  payload: unknown
): payload is ValidPayload => {
  return true
}

export type CoreWebhookEventPayload = EventPayload<
  ValidPayload,
  Record<string, unknown>
>

export const formatCoreWebhookPayload = (
  payload: ValidPayload,

  agentId: string
) => {
  const formatted: CoreWebhookEventPayload = {
    connector: corePluginName,
    eventName: 'webhookReceived',
    status: 'success',
    content: payload.content,
    sender: 'assistant', // TODO
    observer: 'assistant',
    client: 'cloud.magickml.com',
    channel: payload.callback || 'none',
    plugin: corePluginName,
    agentId,
    channelType: payload.callback ? 'callback' : 'none',
    rawData: JSON.stringify(payload),
    timestamp: new Date().toISOString(),
    data: payload,
    metadata: {},
  }

  return formatted
}

// ACTIONS

export const CORE_ACTIONS = createEventsEnum([
  EventTypes.SEND_MESSAGE,
  EventTypes.STREAM_MESSAGE,
  'error',
])

// DEPENDENCIES

export const CORE_DEPENDENCIES = {
  ACTION_SERVICE: 'coreActionService',
  STATE_SERVICE: 'IStateService',
  EVENT_STORE: 'IEventStore',
  I_VARIABLE_SERVICE: 'IVariableService',
  LLM_SERVICE: 'coreLLMService',
  // BUDGET_MANAGER_SERVICE: 'coreBudgetManagerService',
  MEMORY_SERVICE: 'coreMemoryService',
  IMAGE_SERVICE: 'coreImageService',
  LOGGER: 'ILogger',
  GET_SECRET: 'getSecret',
  // GET_STATE: 'getState',
  UPLOAD_FILE: 'uploadFile',
  DOWNLOAD_FILE: 'downloadFile',
  EMBEDDER_CLIENT: 'embedderClient',
}

// COMMANDS
export enum CORE_COMMANDS {}

export const coreRemovedNodes = [
  'variable/get',
  'variable/set',
  'time/delay',
  'lifecycle/onTick',
]

// METHODS
