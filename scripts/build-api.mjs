import * as esbuild from 'esbuild';

// Bundle the API into a single file for Vercel
// Need to use CJS format with ESM-compatible wrapper for Node built-ins
await esbuild.build({
  entryPoints: ['src/api/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'api/index.js',
  format: 'esm',
  external: [
    // Don't bundle Node built-ins - let Vercel resolve them
    'path',
    'fs', 
    'http',
    'https',
    'url',
    'util',
    'stream',
    'crypto',
    'zlib',
    'buffer',
    'events',
    'querystring',
    'string_decoder',
    'net',
    'tls',
    'dns',
    'os',
    'child_process',
    'assert',
    'constants',
    'module',
    'node:*',
    '@vercel/node'
  ],
  sourcemap: true,
  banner: {
    js: `// Bundled API for Vercel
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
`
  }
});

console.log('API bundled successfully!');
