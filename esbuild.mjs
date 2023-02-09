import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outdir: 'dist',
  minify: true,
  external: ['*.stories.ts', '*.stories.mdx']
})
