import * as esbuild from 'esbuild'

// No bundle
await esbuild.build({
  entryPoints: [
    'src/index.ts',
    'src/components/index.ts',
    'src/lib/index.ts',
    'src/util/index.ts',
  ],
  bundle: false,
  outdir: 'dist',
  minify: true,
  target: "es2015",
})

// Bundle
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/index.min.js',
  minify: true,
  external: ['*.stories.ts', '*.stories.mdx'],
  target: "es2015",
})
