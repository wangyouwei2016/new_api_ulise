/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

export interface ManagedToolItem {
  id: string
  name: string
  downloadUrl: string
  docsPath: string
}

export interface ScriptInstallItem {
  id: string
  name: string
  unixCommand: string
  winCommand: string
  docsPath: string
}

export interface ManualClientItem {
  id: string
  name: string
  docsPath: string
}

export type InstallPlatform = 'unix' | 'win'

export const MANAGED_TOOL_ITEMS: ManagedToolItem[] = [
  {
    id: 'cc-switch',
    name: 'CC Switch',
    downloadUrl: 'https://ccswitch.io/zh/',
    docsPath: '/clients/cc-switch',
  },
  {
    id: 'magpie',
    name: 'Magpie',
    downloadUrl: 'https://usemagpie.ai/docs/zh/start',
    docsPath: '/clients/magpie',
  },
]

export function buildInstallScripts(baseUrl: string): ScriptInstallItem[] {
  const cleanBase = baseUrl.trim().replace(/\/+$/, '')

  return [
    {
      id: 'claude-code-script',
      name: 'Claude Code',
      unixCommand: `curl -fsSL ${cleanBase}/install/claude-code.sh | bash`,
      winCommand: `irm ${cleanBase}/install/claude-code.ps1 | iex`,
      docsPath: '/user-guide/claude-code',
    },
    {
      id: 'codex-script',
      name: 'Codex',
      unixCommand: `curl -fsSL ${cleanBase}/install/codex.sh | bash`,
      winCommand: `irm ${cleanBase}/install/codex.ps1 | iex`,
      docsPath: '/user-guide/codex',
    },
  ]
}

export const MANUAL_CLIENT_ITEMS: ManualClientItem[] = [
  {
    id: 'claude-code-manual',
    name: 'Claude Code',
    docsPath: '/clients/claude-code-manual',
  },
  {
    id: 'codex-manual',
    name: 'Codex CLI',
    docsPath: '/clients/codex-manual',
  },
  {
    id: 'claude-desktop',
    name: 'Claude Desktop',
    docsPath: '/clients/claude-desktop',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    docsPath: '/clients/cursor',
  },
  {
    id: 'cherry-studio',
    name: 'Cherry Studio',
    docsPath: '/clients/cherry-studio',
  },
]
