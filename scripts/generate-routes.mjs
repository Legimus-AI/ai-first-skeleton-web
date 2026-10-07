import { Generator, getConfig } from '@tanstack/router-generator'

const config = getConfig({
  routesDirectory: './src/routes',
  generatedRouteTree: './src/routeTree.gen.ts',
  routeFileIgnorePattern: '__tests__',
})
const generator = new Generator({ config })
await generator.run()
