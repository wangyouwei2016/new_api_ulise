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
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { ThemeProvider } from '@/context/theme-provider'
import { createAppQueryClient } from '@/lib/query-client'
import { ROLE } from '@/lib/roles'
import { STATUS_QUERY_KEY } from '@/lib/status-query'
import { useAuthStore } from '@/stores/auth-store'
import { useSystemConfigStore } from '@/stores/system-config-store'

import { ConsoleNoirHome } from '../home-page'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    className,
    title,
    onClick,
  }: {
    to: string
    children?: ReactNode
    className?: string
    title?: string
    onClick?: React.MouseEventHandler<HTMLAnchorElement>
  }) => (
    <a href={to} className={className} title={title} onClick={onClick}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
  useRouterState: () => ({ location: { pathname: '/' } }),
}))

let client: QueryClient

function Wrapper(props: { children: ReactNode }) {
  return (
    <QueryClientProvider client={client}>
      <ThemeProvider defaultTheme='dark'>{props.children}</ThemeProvider>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  localStorage.clear()
  client = createAppQueryClient()
  client.setQueryData(STATUS_QUERY_KEY, {
    system_name: 'Demo Gateway',
    version: 'v1.9.9-secret',
    server_address: 'https://api.example.com',
    docs_link: 'https://docs.example.com',
  })
  useSystemConfigStore.setState({
    config: {
      ...useSystemConfigStore.getState().config,
      systemName: 'Demo Gateway',
      logo: '/logo.png',
      footerHtml: '',
      demoSiteEnabled: false,
    },
    loading: false,
    loadedLogoUrl: '/logo.png',
  })
  useAuthStore.getState().auth.setUser({
    id: 1,
    username: 'admin',
    role: ROLE.ADMIN,
  })
})

afterEach(() => {
  cleanup()
  client.clear()
  useAuthStore.getState().auth.reset()
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('ConsoleNoirHome theme', () => {
  test('hides version label next to top-left logo even for administrators', () => {
    render(<ConsoleNoirHome isAuthenticated />, { wrapper: Wrapper })

    const banner = screen.getByRole('banner')
    expect(within(banner).getByText('Demo Gateway')).toBeInTheDocument()
    expect(within(banner).queryByText('v1.9.9-secret')).not.toBeInTheDocument()
    expect(
      within(banner).queryByRole('button', {
        name: /System updates, current version/i,
      })
    ).not.toBeInTheDocument()
  })

  test('preserves the gateway slogan and editable three-step workflow', () => {
    render(<ConsoleNoirHome isAuthenticated={false} />, { wrapper: Wrapper })

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Unified API Gateway for')
    expect(heading).toHaveTextContent('Vast Range of AI Models')

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Three steps to get started',
      })
    ).toBeInTheDocument()
    expect(screen.getByText('Create API Key')).toBeInTheDocument()
    expect(screen.getByText('Configure Client or SDK')).toBeInTheDocument()
    expect(screen.getByText('Send Requests & Monitor')).toBeInTheDocument()
  })

  test('switches interactive client config channels without Gemini and uses configured gateway URL', async () => {
    const user = userEvent.setup()
    render(<ConsoleNoirHome isAuthenticated={false} />, { wrapper: Wrapper })

    expect(screen.getAllByRole('tab')).toHaveLength(4)
    expect(
      screen.queryByRole('tab', { name: /Gemini/i })
    ).not.toBeInTheDocument()
    expect(screen.getByText('CH 00')).toBeInTheDocument()
    expect(screen.getByText('~/.claude/settings.json')).toBeInTheDocument()
    expect(
      screen.getAllByText('https://api.weigeai.com').length
    ).toBeGreaterThan(0)
    expect(
      screen.queryByText('https://api.weigeai.com/')
    ).not.toBeInTheDocument()

    expect(document.documentElement).toHaveClass('light')
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('complementary', { name: 'Gateway status bar' })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /Codex CLI/i }))

    expect(screen.getByText('CH 01')).toBeInTheDocument()
    expect(screen.getByText('~/.codex/config.toml')).toBeInTheDocument()
    expect(
      screen.getByText(/https:\/\/api\.weigeai\.com\/v1/)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Switch paused/i })
    ).toHaveAttribute('aria-pressed', 'false')
  })

  test('renders three client installation methods and switches script platform', async () => {
    const user = userEvent.setup()
    render(<ConsoleNoirHome isAuthenticated={false} />, { wrapper: Wrapper })

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Three ways to connect your clients',
      })
    ).toBeInTheDocument()
    expect(screen.getByText('Managed Tools')).toBeInTheDocument()
    expect(screen.getByText('One-Click Script')).toBeInTheDocument()
    expect(screen.getByText('Manual Configuration')).toBeInTheDocument()

    // Method 01: Recommended managed tools
    const downloadLinks = screen.getAllByRole('link', { name: 'Download' })
    expect(downloadLinks).toHaveLength(2)
    expect(downloadLinks[0]).toHaveAttribute('href', 'https://ccswitch.io/zh/')
    expect(downloadLinks[1]).toHaveAttribute(
      'href',
      'https://usemagpie.ai/docs/zh/start'
    )

    // Method 02: One-click script defaults to macOS / Linux and switches to Windows
    expect(
      screen.getByText(
        'curl -fsSL https://api.weigeai.com/install/claude-code.sh | bash'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText('curl -fsSL https://api.weigeai.com/install/codex.sh | bash')
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Windows' }))

    expect(
      screen.getByText(
        'irm https://api.weigeai.com/install/claude-code.ps1 | iex'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText('irm https://api.weigeai.com/install/codex.ps1 | iex')
    ).toBeInTheDocument()

    // Method 03: Manual config links point to docs site manual pages
    expect(
      screen.getByRole('link', { name: 'Codex CLI' })
    ).toHaveAttribute('href', 'https://docs.example.com/clients/codex-manual')

    // Simplified three-step visual flow diagram appears above install methods
    const workflowHeading = screen.getByRole('heading', {
      level: 2,
      name: 'Three steps to get started',
    })
    const installHeading = screen.getByRole('heading', {
      level: 2,
      name: 'Three ways to connect your clients',
    })
    expect(
      Boolean(
        workflowHeading.compareDocumentPosition(installHeading) &
          Node.DOCUMENT_POSITION_FOLLOWING
      )
    ).toBe(true)
    expect(
      screen.getAllByRole('link', { name: 'View Config Examples' })[0]
    ).toHaveAttribute('href', '#install-methods')
  })
})
