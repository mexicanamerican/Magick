import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  failOnWarn: false,
  declaration: true,

  entries: [
    { input: 'src/index.ts', outDir: 'dist' },

    { input: 'src/runtime/utils/index.ts', outDir: 'dist/runtime/utils' },
  ],

  externals: [
    'dot-prop',
    'globby',
    'ohash',
    'pathe',
    'rollup',
    'ufo',
    '#nitro-internal-virtual/error-handler',
    '#nitro-internal-virtual/plugins',
    '#nitro-internal-virtual/server-handlers',
    '#nitro-internal-virtual/storage',
    '#nitro-internal-virtual/tasks',
    '#nitro-internal-virtual/database',
    'nitro/kit',
    'nitro/runtime',
    'consola',
    'consola/utils',
    'klona',
    'destr',
    'h3',
    'hookable',
    'ofetch',
    'unenv/runtime/fetch/index',
    'unstorage',
    'defu',
    'radix3',
    'unctx',
    'croner',
    'std-env',
    'db0',
    'scule',
    'cookie-es',
    'uncrypto',
    'iron-webcrypto',
    'unenv',
    'nitro',
    '@magickml/behave-graph',
    'nitro/core',
  ],
})
