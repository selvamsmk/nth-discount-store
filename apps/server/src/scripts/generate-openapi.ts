import fs from 'fs'
import { generateOpenApiDocument } from 'trpc-to-openapi'
import { appRouter } from '@nth-discount-store/api/routers/index'

async function main(): Promise<void> {
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  // appRouter's TRPC meta types may not include OpenApiMeta; cast to any for generation time.
  const doc = generateOpenApiDocument(appRouter, {
      title: 'nth-discount-store API',
      version: '1.0.0',
      baseUrl,
      defs: {} // add named Zod defs here if you want to reuse schema components
    })

    const outPath = new URL('../../../../openapi.json', import.meta.url).pathname
    fs.writeFileSync(outPath, JSON.stringify(doc, null, 2))
    console.log('OpenAPI document written to', outPath)
  } catch (err) {
    console.error('Failed to generate OpenAPI document:', err)
    process.exit(1)
  }
}

main()
