import { Generator, getConfig } from '@tanstack/router-generator'

const config = getConfig({
  routesDirectory: './src/routes',
  generatedRouteTree: './src/routeTree.gen.ts',
})
const generator = new Generator({ config })
await generator.run()
