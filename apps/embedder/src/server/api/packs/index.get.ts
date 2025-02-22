import { embedderDb, Pack } from '@magickml/embedder-db-pg'
import { eq, and } from 'drizzle-orm'
import { authParse } from '@magickml/embedder-schemas'

export default defineEventHandler(async event => {
  const { entity, owner } = authParse(event.context)

  const packs = embedderDb.query.Pack.findMany({
    with: { loaders: true },
    where: and(eq(Pack.entity, entity), eq(Pack.owner, owner)),
  })
  return packs
})
