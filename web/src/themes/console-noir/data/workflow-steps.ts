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
  titleKey: string
  descKey: string
  actionLabelKey: string
  /** Target route when user is authenticated */
  authTo: string
  /** Target route or hash anchor when user is not authenticated */
  guestTo: string
}

/**
 * Editable workflow steps for the homepage.
 * Customize titles, descriptions, or target routes here without touching layout components.
 */
export const WORKFLOW_STEPS: WorkflowStepDefinition[] = [
  {
    num: '01',
    titleKey: 'Create API Key',
    descKey:
      'Generate an API key in the console and configure model access and quota limits as needed.',
    actionLabelKey: 'Manage API Keys',
    authTo: '/keys',
    guestTo: '/sign-up',
  },
  {
    num: '02',
    titleKey: 'Configure Client or SDK',
    descKey:
      'Replace the Base URL with this gateway endpoint and paste your key into Claude Code, Codex CLI, Cherry Studio, or any compatible SDK.',
    actionLabelKey: 'View Config Examples',
    authTo: '#console-quickstart',
    guestTo: '#console-quickstart',
  },
  {
    num: '03',
    titleKey: 'Send Requests & Monitor',
    descKey:
      'Start calling models across providers immediately and track logs, token usage, and billing in real time.',
    actionLabelKey: 'View Usage Logs',
    authTo: '/usage-logs',
    guestTo: '/pricing',
  },
]
