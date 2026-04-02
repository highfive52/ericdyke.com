import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const source = resolve('public', '.htaccess')
const target = resolve('dist', '.htaccess')

if (!existsSync(source)) {
  console.warn('[postbuild] public/.htaccess not found; skipping copy.')
  process.exit(0)
}

copyFileSync(source, target)
console.log('[postbuild] Copied public/.htaccess -> dist/.htaccess')
