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

export interface WorkflowStepDefinition {
  num: string
  tag: string
  titleKey: string
  shortDescKey: string
  descKey: string
  actionLabelKey: string
  /** Target route when user is authenticated */
  authTo: string
  /** Target route or hash anchor when user is not authenticated */
  guestTo: string
}

/**
 * Editable workflow steps for the homepage visual quickstart flow diagram.
 * Customize titles, tags, descriptions, or target routes here without touching layout components.
 */
export const WORKFLOW_STEPS: WorkflowStepDefinition[] = [
  {
    num: '01',
    tag: 'sk-***',
    titleKey: 'Create API Key',
    shortDescKey: 'Generate a token in Console',
    descKey:
      'Generate an API key in the console and configure model access and quota limits as needed.',
    actionLabelKey: 'Manage API Keys',
    authTo: '/keys',
    guestTo: '/sign-up',
  },
  {
    num: '02',
    tag: 'Base URL + Key',
    titleKey: 'Configure Client or SDK',
    shortDescKey: 'Pick one of 3 setup methods below',
    descKey:
      'Replace the Base URL with this gateway endpoint and paste your key into Claude Code, Codex CLI, Cherry Studio, or any compatible SDK.',
    actionLabelKey: 'View Config Examples',
    authTo: '#install-methods',
    guestTo: '#install-methods',
  },
  {
    num: '03',
    tag: 'Claude · GPT · Gemini',
    titleKey: 'Send Requests & Monitor',
    shortDescKey: 'Call models & track usage live',
    descKey:
      'Start calling models across providers immediately and track logs, token usage, and billing in real time.',
    actionLabelKey: 'View Usage Logs',
    authTo: '/usage-logs',
    guestTo: '/pricing',
  },
]
