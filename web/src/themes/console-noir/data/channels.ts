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

import { CONSOLE_NOIR_THEME } from '../config'

export interface ConsoleCodeLine {
  id: string
  text: string
  highlighted?: boolean
}

function toCodeLines(
  prefix: string,
  entries: Array<{ text: string; highlighted?: boolean }>
): ConsoleCodeLine[] {
  return entries.map((entry, position) => ({
    id: `${prefix}-line-${position + 1}`,
    text: entry.text,
    highlighted: entry.highlighted,
  }))
}

export interface ConsoleChannel {
  id: string
  code: string
  name: string
  protocol: string
  endpointPath: string
  filePath: string
  badgeKey: string
  buildLines: (baseUrl: string) => ConsoleCodeLine[]
}

export function normalizeGatewayBaseUrl(rawUrl?: string): string {
  const trimmed = rawUrl?.trim()
  if (trimmed) {
    return trimmed.replace(/\/+$/, '')
  }
  return CONSOLE_NOIR_THEME.gatewayUrl.replace(/\/+$/, '')
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

export const CONSOLE_CHANNELS: ConsoleChannel[] = [
  {
    id: 'claude-code',
    code: '00',
    name: 'Claude Code',
    protocol: 'Anthropic Messages',
    endpointPath: '/v1/messages',
    filePath: '~/.claude/settings.json',
    badgeKey: 'Anthropic compatible',
    buildLines: (baseUrl) =>
      toCodeLines('claude-code', [
        { text: '{' },
        { text: '  "env": {' },
        {
          text: `    "ANTHROPIC_BASE_URL": "${baseUrl}",`,
          highlighted: true,
        },
        {
          text: '    "ANTHROPIC_AUTH_TOKEN": "sk-your-api-key",',
          highlighted: true,
        },
        { text: '    "ANTHROPIC_MODEL": "claude-sonnet-4-5"' },
        { text: '  }' },
        { text: '}' },
      ]),
  },
  {
    id: 'codex-cli',
    code: '01',
    name: 'Codex CLI',
    protocol: 'OpenAI Responses',
    endpointPath: '/v1/responses',
    filePath: '~/.codex/config.toml',
    badgeKey: 'Responses API',
    buildLines: (baseUrl) =>
      toCodeLines('codex-cli', [
        { text: 'model_provider = "gateway"' },
        { text: 'model = "gpt-5.2"' },
        { text: '' },
        { text: '[model_providers.gateway]' },
        { text: 'name = "gateway"' },
        {
          text: `base_url = "${stripTrailingSlash(baseUrl)}/v1"`,
          highlighted: true,
        },
        { text: 'env_key = "OPENAI_API_KEY"', highlighted: true },
        { text: 'wire_api = "responses"' },
      ]),
  },
  {
    id: 'cherry-studio',
    code: '02',
    name: 'Cherry Studio',
    protocol: 'OpenAI Compatible',
    endpointPath: '/v1/chat/completions',
    filePath: 'Settings / Provider',
    badgeKey: 'Desktop client',
    buildLines: (baseUrl) =>
      toCodeLines('cherry-studio', [
        { text: 'Provider Type : OpenAI Compatible' },
        { text: `API Host      : ${baseUrl}`, highlighted: true },
        { text: 'API Key       : sk-your-api-key', highlighted: true },
        { text: 'Models        : Click "Manage" to sync list' },
      ]),
  },
  {
    id: 'openai-sdk',
    code: '03',
    name: 'SDK / curl',
    protocol: 'OpenAI Chat',
    endpointPath: '/v1/chat/completions',
    filePath: 'client.ts',
    badgeKey: 'Drop-in SDK',
    buildLines: (baseUrl) =>
      toCodeLines('openai-sdk', [
        { text: 'import OpenAI from "openai"' },
        { text: '' },
        { text: 'const client = new OpenAI({' },
        {
          text: `  baseURL: "${stripTrailingSlash(baseUrl)}/v1",`,
          highlighted: true,
        },
        { text: '  apiKey: process.env.GATEWAY_API_KEY,', highlighted: true },
        { text: '})' },
      ]),
  },
]
