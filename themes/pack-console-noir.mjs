#!/usr/bin/env node
/**
 * Packs the self-contained Console Noir frontend theme into themes/console-noir-theme.zip.
 * Usage: node themes/pack-console-noir.mjs
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')
const THEME_SRC_DIR = path.join(REPO_ROOT, 'web/src/themes/console-noir')
const OUTPUT_ZIP = path.join(__dirname, 'console-noir-theme.zip')

const MANIFEST = {
  id: 'console-noir',
  name: 'Console Noir',
  version: '1.0.0',
  description:
    'Usage-focused retro-technical frontend theme for New API homepage (no backend changes). Hides top-left brand version, preserves the unified gateway slogan and extensible workflow, and adds a multi-client quickstart console inspired by spiderai.fun.',
  scope: 'frontend-only',
  backendChanges: false,
  targetThemeDir: 'web/src/themes/console-noir',
  hookFiles: [
    'web/src/styles/index.css',
    'web/src/components/layout/components/public-layout.tsx',
    'web/src/components/layout/components/public-header.tsx',
    'web/src/components/layout/components/app-header.tsx',
    'web/src/components/layout/components/system-brand.tsx',
    'web/src/features/home/index.tsx',
  ],
}

const README_MD = `# Console Noir — New API Frontend Theme Pack

Frontend-only homepage theme for **New API** (zero backend changes).

## Highlights

- **No version next to top-left logo**: hides the version badge in the public header, app header, and sidebar brand area.
- **Usage-focused homepage**:
  - Preserves the core slogan: \`统一 API 网关，服务于海量 AI 模型\` (\`Unified API Gateway for Vast Range of AI Models\`).
  - Interactive 5-channel client quickstart monitor (\`Claude Code\`, \`Codex CLI\`, \`Gemini CLI\`, \`Cherry Studio\`, \`SDK / curl\`) with live Gateway Base URL injection and one-click copy.
  - Preserves the 3-step **Workflow** section in an easy-to-edit file: \`web/src/themes/console-noir/data/workflow-steps.ts\`.
  - Dual Dark/Light theme tokens + optional subtle CRT scanline toggle in the bottom status bar.
- **Upgrade-friendly**: all theme code is isolated in \`web/src/themes/console-noir/\`, with minimal marker-delimited hooks in 6 frontend files.

## Apply to a New Version of New API

\`\`\`bash
unzip console-noir-theme.zip -d /tmp/console-noir-theme
node /tmp/console-noir-theme/apply.mjs /path/to/new-api
cd /path/to/new-api/web && bun run build
\`\`\`

## Customize the Workflow Later

Edit \`web/src/themes/console-noir/data/workflow-steps.ts\` to update step titles, descriptions, or links, then rebuild the frontend.

## Uninstall / Restore Default Theme

\`\`\`bash
node /tmp/console-noir-theme/uninstall.mjs /path/to/new-api
\`\`\`
`

const APPLY_SCRIPT = `#!/usr/bin/env node
/**
 * Idempotent installer for Console Noir frontend theme.
 * Usage: node apply.mjs [path-to-new-api-repo]
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const targetRoot = path.resolve(process.argv[2] || process.cwd())
const webRoot = path.join(targetRoot, 'web')
const MARKER_START = '/* theme:console-noir:start */'
const MARKER_END = '/* theme:console-noir:end */'

async function exists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true })
  const entries = await fs.readdir(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

async function patchFile(relPath, transform) {
  const fullPath = path.join(targetRoot, relPath)
  if (!(await exists(fullPath))) {
    console.warn(\`[warn] Missing file: \${relPath}\`)
    return
  }
  const original = await fs.readFile(fullPath, 'utf8')
  const updated = transform(original)
  if (updated === null) {
    console.warn(\`[warn] Anchor not found in \${relPath}; please verify manually.\`)
    return
  }
  if (updated !== original) {
    await fs.writeFile(fullPath, updated, 'utf8')
    console.log(\`[patched] \${relPath}\`)
  } else {
    console.log(\`[ok] \${relPath} (already applied)\`)
  }
}

async function mergeLocales() {
  const themeLocalesPath = path.join(
    __dirname,
    'files/web/src/themes/console-noir/locales.json'
  )
  const themeLocales = JSON.parse(await fs.readFile(themeLocalesPath, 'utf8'))
  const localesDir = path.join(webRoot, 'src/i18n/locales')

  for (const [locale, entries] of Object.entries(themeLocales)) {
    const localePath = path.join(localesDir, \`\${locale}.json\`)
    if (!(await exists(localePath))) continue
    const json = JSON.parse(await fs.readFile(localePath, 'utf8'))
    let changed = 0
    for (const [key, val] of Object.entries(entries)) {
      if (json.translation[key] !== val) {
        json.translation[key] = val
        changed++
      }
    }
    if (changed > 0) {
      json.translation = Object.fromEntries(
        Object.entries(json.translation).sort(([a], [b]) => a.localeCompare(b))
      )
      await fs.writeFile(localePath, JSON.stringify(json, null, 2) + '\\n', 'utf8')
      console.log(\`[i18n] \${locale}.json (+\${changed} keys)\`)
    }
  }
}

async function main() {
  if (!(await exists(path.join(webRoot, 'src')))) {
    throw new Error(\`Could not find web/src under \${targetRoot}\`)
  }

  // 1. Copy isolated theme module
  const themeSrc = path.join(__dirname, 'files/web/src/themes/console-noir')
  const themeDest = path.join(webRoot, 'src/themes/console-noir')
  await copyDir(themeSrc, themeDest)
  console.log('[copied] web/src/themes/console-noir')

  // 2. Patch styles/index.css
  await patchFile('web/src/styles/index.css', (src) => {
    if (src.includes("../themes/console-noir/styles.css")) return src
    const anchor = "@import './theme-presets.css';"
    if (!src.includes(anchor)) return null
    return src.replace(
      anchor,
      \`\${anchor}\\n\${MARKER_START}\\n@import '../themes/console-noir/styles.css';\\n\${MARKER_END}\`
    )
  })

  // 3. Patch public-layout.tsx (optional className prop)
  await patchFile('web/src/components/layout/components/public-layout.tsx', (src) => {
    if (src.includes('props.className')) return src
    let out = src
    if (!out.includes("from '@/lib/utils'")) {
      out = out.replace(
        "import type { TopNavLink } from '../types'",
        "import { cn } from '@/lib/utils'\\n\\nimport type { TopNavLink } from '../types'"
      )
    }
    out = out.replace(
      '  siteName?: string\\n}',
      '  siteName?: string\\n  className?: string\\n}'
    )
    const divAnchor =
      "<div className='bg-background text-foreground relative min-h-svh overflow-x-clip'>"
    if (!out.includes(divAnchor)) return null
    out = out.replace(
      divAnchor,
      "<div\\n      className={cn(\\n        'bg-background text-foreground relative min-h-svh overflow-x-clip',\\n        props.className\\n      )}\\n    >"
    )
    return out
  })

  // 4. Patch public-header.tsx (hide top-left version badge)
  await patchFile('web/src/components/layout/components/public-header.tsx', (src) => {
    if (src.includes('CONSOLE_NOIR_THEME.hideBrandVersion')) return src
    let out = src
    const importAnchor = "import { useAuthStore } from '@/stores/auth-store'"
    if (!out.includes(importAnchor)) return null
    out = out.replace(
      importAnchor,
      \`\${importAnchor}\\n\${MARKER_START}\\nimport { CONSOLE_NOIR_THEME } from '@/themes/console-noir/config'\\n\${MARKER_END}\`
    )
    out = out.replace(
      '  showNotifications?: boolean\\n  className?: string',
      '  showNotifications?: boolean\\n  showVersion?: boolean\\n  className?: string'
    )
    out = out.replace(
      '    showNotifications = true,\\n  } = props',
      '    showNotifications = true,\\n    showVersion = !CONSOLE_NOIR_THEME.hideBrandVersion,\\n  } = props'
    )
    const versionAnchor = "<SystemUpdateAction presentation='version' />"
    if (!out.includes(versionAnchor)) return null
    out = out.replace(
      versionAnchor,
      "{showVersion && <SystemUpdateAction presentation='version' />}"
    )
    return out
  })

  // 5. Patch app-header.tsx (hide top-left version badge in console)
  await patchFile('web/src/components/layout/components/app-header.tsx', (src) => {
    if (src.includes('CONSOLE_NOIR_THEME.hideBrandVersion')) return src
    let out = src
    const importAnchor = "import { useTopNavLinks } from '@/hooks/use-top-nav-links'"
    if (!out.includes(importAnchor)) return null
    out = out.replace(
      importAnchor,
      \`\${importAnchor}\\n\${MARKER_START}\\nimport { CONSOLE_NOIR_THEME } from '@/themes/console-noir/config'\\n\${MARKER_END}\`
    )
    const versionAnchor = "<SystemUpdateAction presentation='version' />"
    if (!out.includes(versionAnchor)) return null
    out = out.replace(
      versionAnchor,
      "{!CONSOLE_NOIR_THEME.hideBrandVersion && (\\n          <SystemUpdateAction presentation='version' />\\n        )}"
    )
    return out
  })

  // 6. Patch system-brand.tsx (hide sidebar brand version text)
  await patchFile('web/src/components/layout/components/system-brand.tsx', (src) => {
    if (src.includes('CONSOLE_NOIR_THEME.hideBrandVersion')) return src
    let out = src
    const importAnchor = "import { cn } from '@/lib/utils'"
    if (!out.includes(importAnchor)) return null
    out = out.replace(
      importAnchor,
      \`\${importAnchor}\\n\${MARKER_START}\\nimport { CONSOLE_NOIR_THEME } from '@/themes/console-noir/config'\\n\${MARKER_END}\`
    )
    const versionAnchor = "<span className='truncate text-xs'>{version}</span>"
    if (!out.includes(versionAnchor)) return null
    out = out.replace(
      versionAnchor,
      "{!CONSOLE_NOIR_THEME.hideBrandVersion && (\\n              <span className='truncate text-xs'>{version}</span>\\n            )}"
    )
    return out
  })

  // 7. Patch features/home/index.tsx
  await patchFile('web/src/features/home/index.tsx', (src) => {
    if (src.includes('ConsoleNoirHome')) return src
    let out = src
    const importAnchor = "import { useAuthStore } from '@/stores/auth-store'"
    if (!out.includes(importAnchor)) return null
    out = out.replace(
      importAnchor,
      \`\${importAnchor}\\n\${MARKER_START}\\nimport { CONSOLE_NOIR_THEME, ConsoleNoirHome } from '@/themes/console-noir'\\n\${MARKER_END}\`
    )
    const renderAnchor = '  return (\\n    <PublicLayout showMainContainer={false}>\\n      <Hero'
    if (!out.includes(renderAnchor)) return null
    out = out.replace(
      renderAnchor,
      \`  \${MARKER_START}\\n  if (CONSOLE_NOIR_THEME.enabled) {\\n    return <ConsoleNoirHome isAuthenticated={isAuthenticated} />\\n  }\\n  \${MARKER_END}\\n\\n\${renderAnchor}\`
    )
    return out
  })

  // 8. Merge i18n keys
  await mergeLocales()

  console.log('\\nConsole Noir theme applied successfully. Next step:')
  console.log(\`  cd \${webRoot} && bun run build\`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
`

const UNINSTALL_SCRIPT = `#!/usr/bin/env node
/**
 * Removes Console Noir frontend theme hooks and files cleanly.
 * Usage: node uninstall.mjs [path-to-new-api-repo]
 */
import fs from 'node:fs/promises'
import path from 'node:path'

const targetRoot = path.resolve(process.argv[2] || process.cwd())
const webRoot = path.join(targetRoot, 'web')
const MARKED_BLOCK_RE =
  /[ \\t]*\\/\\* theme:console-noir:start \\*\\/[\\s\\S]*?\\/\\* theme:console-noir:end \\*\\/\\n?/g

async function exists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function cleanFile(relPath, extraTransform) {
  const fullPath = path.join(targetRoot, relPath)
  if (!(await exists(fullPath))) return
  const original = await fs.readFile(fullPath, 'utf8')
  let updated = original.replace(MARKED_BLOCK_RE, '')
  if (extraTransform) {
    updated = extraTransform(updated)
  }
  if (updated !== original) {
    await fs.writeFile(fullPath, updated, 'utf8')
    console.log(\`[restored] \${relPath}\`)
  }
}

async function main() {
  await cleanFile('web/src/styles/index.css')

  await cleanFile('web/src/components/layout/components/public-header.tsx', (s) =>
    s
      .replace('  showVersion?: boolean\\n', '')
      .replace('    showVersion = !CONSOLE_NOIR_THEME.hideBrandVersion,\\n', '')
      .replace(
        "{showVersion && <SystemUpdateAction presentation='version' />}",
        "<SystemUpdateAction presentation='version' />"
      )
  )

  await cleanFile('web/src/components/layout/components/app-header.tsx', (s) =>
    s.replace(
      "{!CONSOLE_NOIR_THEME.hideBrandVersion && (\\n          <SystemUpdateAction presentation='version' />\\n        )}",
      "<SystemUpdateAction presentation='version' />"
    )
  )

  await cleanFile('web/src/components/layout/components/system-brand.tsx', (s) =>
    s.replace(
      "{!CONSOLE_NOIR_THEME.hideBrandVersion && (\\n              <span className='truncate text-xs'>{version}</span>\\n            )}",
      "<span className='truncate text-xs'>{version}</span>"
    )
  )

  await cleanFile('web/src/features/home/index.tsx', (s) =>
    s.replace(/\\n{3,}(  return \\()/g, '\\n\\n$1')
  )

  const themeDir = path.join(webRoot, 'src/themes/console-noir')
  await fs.rm(themeDir, { recursive: true, force: true })
  console.log('[removed] web/src/themes/console-noir')
  console.log('\\nConsole Noir theme uninstalled.')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
`

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true })
  const entries = await fs.readdir(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

async function main() {
  const stagingDir = await fs.mkdtemp(path.join(os.tmpdir(), 'console-noir-pack-'))
  try {
    await fs.writeFile(
      path.join(stagingDir, 'theme.json'),
      JSON.stringify(MANIFEST, null, 2) + '\n',
      'utf8'
    )
    await fs.writeFile(path.join(stagingDir, 'README.md'), README_MD, 'utf8')
    await fs.writeFile(path.join(stagingDir, 'apply.mjs'), APPLY_SCRIPT, {
      encoding: 'utf8',
      mode: 0o755,
    })
    await fs.writeFile(path.join(stagingDir, 'uninstall.mjs'), UNINSTALL_SCRIPT, {
      encoding: 'utf8',
      mode: 0o755,
    })
    await copyDir(
      THEME_SRC_DIR,
      path.join(stagingDir, 'files/web/src/themes/console-noir')
    )

    await fs.rm(OUTPUT_ZIP, { force: true })
    execFileSync('zip', ['-r', '-q', OUTPUT_ZIP, '.'], { cwd: stagingDir })
    const stat = await fs.stat(OUTPUT_ZIP)
    console.log(
      `Packed ${path.relative(REPO_ROOT, OUTPUT_ZIP)} (${stat.size} bytes)`
    )
  } finally {
    await fs.rm(stagingDir, { recursive: true, force: true })
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
