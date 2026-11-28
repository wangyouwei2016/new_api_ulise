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
import { Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen, KeyRound } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { PublicLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/context/theme-provider'
import { useStatus } from '@/hooks/use-status'
import { THEME_STORAGE_KEYS } from '@/lib/theme-storage'

import { ConsoleMonitor } from './components/console-monitor'
import { InstallMethodsSection } from './components/install-methods-section'
import { WorkflowSection } from './components/workflow-section'
import { CONSOLE_NOIR_THEME } from './config'
import { normalizeGatewayBaseUrl } from './data/channels'

interface ConsoleNoirHomeProps {
  isAuthenticated?: boolean
}

export function ConsoleNoirHome(props: ConsoleNoirHomeProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const { setTheme } = useTheme()

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (!window.localStorage.getItem(THEME_STORAGE_KEYS.mode)) {
        setTheme(CONSOLE_NOIR_THEME.defaultThemeMode)
      }
    } catch {
      // Ignore storage failures when private mode blocks localStorage.
    }
  }, [setTheme])

  const isAuthenticated = Boolean(props.isAuthenticated)
  const baseUrl = normalizeGatewayBaseUrl(CONSOLE_NOIR_THEME.gatewayUrl)
  const docsUrl =
    (status?.docs_link as string | undefined) || 'https://docs.newapi.pro'
  const isExternalDocs = docsUrl.startsWith('http')

  const renderDocsButton = () => {
    const className =
      'h-10 rounded-lg border-[var(--cn-line-strong)] bg-[var(--cn-surface)] px-4 text-sm font-medium text-[var(--cn-ink)] hover:bg-[var(--cn-hover)]'

    if (isExternalDocs) {
      return (
        <Button
          variant='outline'
          className={className}
          render={
            <a href={docsUrl} target='_blank' rel='noopener noreferrer' />
          }
        >
          <BookOpen className='mr-1.5 size-4' aria-hidden='true' />
          <span>{t('Docs')}</span>
        </Button>
      )
    }

    return (
      <Button
        variant='outline'
        className={className}
        render={<Link to={docsUrl} />}
      >
        <BookOpen className='mr-1.5 size-4' aria-hidden='true' />
        <span>{t('Docs')}</span>
      </Button>
    )
  }

  return (
    <PublicLayout
      showMainContainer={false}
      className='theme-console-noir'
      headerProps={{ showVersion: false }}
    >
      <main>
        {/* Hero Section: Preserved Slogan + Usage-focused Interactive Console */}
        <section className='relative z-10 px-6 pt-28 pb-16 md:pt-36 md:pb-24'>
          <div className='mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10'>
            {/* Left Column: Slogan, Usage Guide, Quick Endpoint & Actions */}
            <div className='flex flex-col items-start text-left lg:col-span-5'>
              <h1 className='text-[clamp(2.2rem,4vw,3.35rem)] leading-[1.12] font-bold tracking-tight'>
                {t('Unified API Gateway for')}
                <br />
                {t('Vast Range of AI Models')}
              </h1>

              <p
                className='mt-5 max-w-md text-sm leading-relaxed md:text-[15px]'
                style={{ color: 'var(--cn-ink-2)' }}
              >
                {t(
                  'Pick a client channel on the right to see the exact endpoint and config lines to change. Copy, paste your key, and start calling models immediately.'
                )}
              </p>

              {/* Live Gateway Endpoint Copy Bar */}
              <div
                className='mt-6 flex w-full max-w-md items-center justify-between gap-2 rounded-lg border px-3.5 py-2'
                style={{
                  borderColor: 'var(--cn-line)',
                  backgroundColor: 'var(--cn-surface)',
                }}
              >
                <div className='min-w-0'>
                  <span
                    className='block font-mono text-[10px] tracking-wider uppercase'
                    style={{ color: 'var(--cn-ink-3)' }}
                  >
                    BASE URL
                  </span>
                  <code className='block truncate font-mono text-xs font-medium'>
                    {baseUrl}
                  </code>
                </div>
                <CopyButton
                  value={baseUrl}
                  variant='ghost'
                  size='sm'
                  className='h-7 gap-1 px-2 text-xs text-[var(--cn-ink-2)] hover:bg-[var(--cn-hover)] hover:text-[var(--cn-ink)]'
                  iconClassName='size-3.5'
                  aria-label={t('Copy gateway URL')}
                >
                  <span>{t('Copy')}</span>
                </CopyButton>
              </div>

              {/* Primary / Secondary Actions */}
              <div className='mt-6 flex flex-wrap items-center gap-3'>
                {isAuthenticated ? (
                  <>
                    <Button
                      className='h-10 rounded-lg border-0 bg-[var(--cn-pri-bg)] px-5 text-sm font-medium text-[var(--cn-pri-ink)] hover:bg-[var(--cn-pri-hover)]'
                      render={<Link to='/dashboard' />}
                    >
                      <span>{t('Go to Dashboard')}</span>
                      <ArrowRight
                        className='ml-1.5 size-4'
                        aria-hidden='true'
                      />
                    </Button>
                    <Button
                      variant='outline'
                      className='h-10 rounded-lg border-[var(--cn-line-strong)] bg-[var(--cn-surface)] px-4 text-sm font-medium text-[var(--cn-ink)] hover:bg-[var(--cn-hover)]'
                      render={<Link to='/keys' />}
                    >
                      <KeyRound className='mr-1.5 size-4' aria-hidden='true' />
                      <span>{t('API Keys')}</span>
                    </Button>
                    {renderDocsButton()}
                  </>
                ) : (
                  <>
                    <Button
                      className='h-10 rounded-lg border-0 bg-[var(--cn-pri-bg)] px-5 text-sm font-medium text-[var(--cn-pri-ink)] hover:bg-[var(--cn-pri-hover)]'
                      render={<Link to='/sign-up' />}
                    >
                      <span>{t('Get API Key')}</span>
                      <ArrowRight
                        className='ml-1.5 size-4'
                        aria-hidden='true'
                      />
                    </Button>
                    <Button
                      variant='outline'
                      className='h-10 rounded-lg border-[var(--cn-line-strong)] bg-[var(--cn-surface)] px-4 text-sm font-medium text-[var(--cn-ink)] hover:bg-[var(--cn-hover)]'
                      render={<Link to='/pricing' />}
                    >
                      {t('View Pricing')}
                    </Button>
                    {renderDocsButton()}
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Interactive Channel Config Monitor */}
            <div className='lg:col-span-7'>
              <ConsoleMonitor baseUrl={baseUrl} />
            </div>
          </div>
        </section>

        {/* Compact Three-Step Quickstart Flow Diagram */}
        <WorkflowSection isAuthenticated={isAuthenticated} />

        {/* Three Client Installation Methods */}
        <InstallMethodsSection baseUrl={baseUrl} docsUrl={docsUrl} />
      </main>
    </PublicLayout>
  )
}
