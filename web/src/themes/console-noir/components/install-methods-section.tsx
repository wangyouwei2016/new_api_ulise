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
import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { CopyButton } from '@/components/copy-button'

import {
  buildInstallScripts,
  MANAGED_TOOL_ITEMS,
  MANUAL_CLIENT_ITEMS,
  type InstallPlatform,
} from '../data/install-methods'

interface InstallMethodsSectionProps {
  baseUrl: string
  docsUrl: string
}

function buildDocsLink(docsUrl: string, docsPath: string): string {
  const trimmed = docsUrl.trim().replace(/\/+$/, '')
  const normalizedPath = docsPath.startsWith('/') ? docsPath : `/${docsPath}`
  if (!trimmed) {
    return normalizedPath
  }
  return `${trimmed}${normalizedPath}`
}

export function InstallMethodsSection(props: InstallMethodsSectionProps) {
  const { t } = useTranslation()
  const [platform, setPlatform] = useState<InstallPlatform>('unix')

  const scripts = buildInstallScripts(props.baseUrl)
  const isExternalDocs = props.docsUrl.startsWith('http')

  return (
    <section
      id='install-methods'
      className='relative z-10 border-t px-6 py-20 md:py-24'
      style={{ borderColor: 'var(--cn-line)' }}
    >
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mb-10 flex flex-col gap-3 md:mb-12 md:flex-row md:items-end md:justify-between'>
          <div>
            <p
              className='mb-2 font-mono text-xs font-medium tracking-[0.16em] uppercase'
              style={{ color: 'var(--cn-ink-3)' }}
            >
              {t('Client Setup')}
            </p>
            <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
              {t('Three ways to connect your clients')}
            </h2>
          </div>
          <p
            className='max-w-md text-sm leading-relaxed'
            style={{ color: 'var(--cn-ink-2)' }}
          >
            {t(
              'Choose a managed tool, run a one-click script, or configure files manually to start calling models.'
            )}
          </p>
        </AnimateInView>

        <div className='grid gap-6 md:grid-cols-3'>
          {/* Method 01: Recommended Managed Tools */}
          <AnimateInView
            delay={0}
            animation='fade-up'
            className='flex flex-col rounded-xl border p-6'
            style={{
              borderColor: 'var(--cn-accent)',
              backgroundColor: 'var(--cn-surface)',
            }}
          >
            <div
              className='mb-4 flex items-center justify-between border-b pb-3'
              style={{ borderColor: 'var(--cn-line)' }}
            >
              <span
                className='font-mono text-xs font-semibold tracking-wider uppercase'
                style={{ color: 'var(--cn-accent)' }}
              >
                {t('Method {{num}}', { num: '01' })}
              </span>
              <span
                className='rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium'
                style={{
                  color: 'var(--cn-accent)',
                  backgroundColor: 'var(--cn-accent-soft)',
                }}
              >
                {t('Recommended')}
              </span>
            </div>

            <h3 className='text-base font-semibold tracking-tight'>
              {t('Managed Tools')}
            </h3>
            <p
              className='mt-2 text-sm leading-relaxed'
              style={{ color: 'var(--cn-ink-2)' }}
            >
              {t(
                'Visual desktop managers or a local protocol gateway—no manual config edits, switch models in one click.'
              )}
            </p>

            <div className='mt-5 flex flex-1 flex-col justify-end gap-2.5'>
              {MANAGED_TOOL_ITEMS.map((tool) => (
                <div
                  key={tool.id}
                  className='flex items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5'
                  style={{
                    borderColor: 'var(--cn-line)',
                    backgroundColor: 'var(--cn-bg)',
                  }}
                >
                  <span className='text-sm font-medium'>{tool.name}</span>
                  <div className='flex items-center gap-3 text-xs'>
                    <a
                      href={tool.downloadUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-0.5 font-medium transition-opacity hover:opacity-80'
                      style={{ color: 'var(--cn-ink)' }}
                    >
                      <span>{t('Download')}</span>
                      <ArrowUpRight className='size-3' aria-hidden='true' />
                    </a>
                    <a
                      href={buildDocsLink(props.docsUrl, tool.docsPath)}
                      target={isExternalDocs ? '_blank' : undefined}
                      rel={isExternalDocs ? 'noopener noreferrer' : undefined}
                      className='inline-flex items-center gap-0.5 transition-opacity hover:opacity-80'
                      style={{ color: 'var(--cn-ink-2)' }}
                    >
                      <span>{t('Guide')}</span>
                      <ArrowUpRight className='size-3' aria-hidden='true' />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </AnimateInView>

          {/* Method 02: One-Click Install Scripts */}
          <AnimateInView
            delay={80}
            animation='fade-up'
            className='flex flex-col rounded-xl border p-6'
            style={{
              borderColor: 'var(--cn-line)',
              backgroundColor: 'var(--cn-surface)',
            }}
          >
            <div
              className='mb-4 flex items-center justify-between border-b pb-3'
              style={{ borderColor: 'var(--cn-line)' }}
            >
              <span
                className='font-mono text-xs font-semibold tracking-wider uppercase'
                style={{ color: 'var(--cn-ink)' }}
              >
                {t('Method {{num}}', { num: '02' })}
              </span>
              <div
                role='group'
                aria-label={t('One-click install script platform')}
                className='flex items-center gap-1 rounded-md p-0.5'
                style={{ backgroundColor: 'var(--cn-sunk)' }}
              >
                <button
                  type='button'
                  aria-pressed={platform === 'unix'}
                  onClick={() => setPlatform('unix')}
                  className='rounded px-2 py-0.5 font-mono text-[11px] font-medium transition-colors'
                  style={
                    platform === 'unix'
                      ? {
                          backgroundColor: 'var(--cn-pri-bg)',
                          color: 'var(--cn-pri-ink)',
                        }
                      : { color: 'var(--cn-ink-2)' }
                  }
                >
                  macOS / Linux
                </button>
                <button
                  type='button'
                  aria-pressed={platform === 'win'}
                  onClick={() => setPlatform('win')}
                  className='rounded px-2 py-0.5 font-mono text-[11px] font-medium transition-colors'
                  style={
                    platform === 'win'
                      ? {
                          backgroundColor: 'var(--cn-pri-bg)',
                          color: 'var(--cn-pri-ink)',
                        }
                      : { color: 'var(--cn-ink-2)' }
                  }
                >
                  Windows
                </button>
              </div>
            </div>

            <h3 className='text-base font-semibold tracking-tight'>
              {t('One-Click Script')}
            </h3>
            <p
              className='mt-2 text-sm leading-relaxed'
              style={{ color: 'var(--cn-ink-2)' }}
            >
              {t(
                'Run a single command to detect Node.js, install the CLI, and write your gateway configuration automatically.'
              )}
            </p>

            <div className='mt-5 flex flex-1 flex-col justify-end gap-2.5'>
              {scripts.map((item) => {
                const command =
                  platform === 'unix' ? item.unixCommand : item.winCommand
                return (
                  <div
                    key={item.id}
                    className='rounded-lg border px-3 py-2.5'
                    style={{
                      borderColor: 'var(--cn-line)',
                      backgroundColor: 'var(--cn-bg)',
                    }}
                  >
                    <div className='mb-1.5 flex items-center justify-between gap-2'>
                      <span className='text-xs font-semibold'>{item.name}</span>
                      <a
                        href={buildDocsLink(props.docsUrl, item.docsPath)}
                        target={isExternalDocs ? '_blank' : undefined}
                        rel={isExternalDocs ? 'noopener noreferrer' : undefined}
                        className='inline-flex items-center gap-0.5 text-xs transition-opacity hover:opacity-80'
                        style={{ color: 'var(--cn-ink-2)' }}
                      >
                        <span>{t('Guide')}</span>
                        <ArrowUpRight className='size-3' aria-hidden='true' />
                      </a>
                    </div>
                    <div
                      className='flex items-center justify-between gap-2 rounded border px-2.5 py-1.5'
                      style={{
                        borderColor: 'var(--cn-line)',
                        backgroundColor: 'var(--cn-sunk)',
                      }}
                    >
                      <code className='min-w-0 truncate font-mono text-[11px]'>
                        {command}
                      </code>
                      <CopyButton
                        value={command}
                        variant='ghost'
                        size='sm'
                        className='h-6 shrink-0 px-1.5 text-[11px] text-[var(--cn-ink-2)] hover:bg-[var(--cn-hover)] hover:text-[var(--cn-ink)]'
                        iconClassName='size-3'
                        aria-label={t('Copy install command')}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </AnimateInView>

          {/* Method 03: Manual Configuration */}
          <AnimateInView
            delay={160}
            animation='fade-up'
            className='flex flex-col rounded-xl border p-6'
            style={{
              borderColor: 'var(--cn-line)',
              backgroundColor: 'var(--cn-surface)',
            }}
          >
            <div
              className='mb-4 flex items-center justify-between border-b pb-3'
              style={{ borderColor: 'var(--cn-line)' }}
            >
              <span
                className='font-mono text-xs font-semibold tracking-wider uppercase'
                style={{ color: 'var(--cn-ink)' }}
              >
                {t('Method {{num}}', { num: '03' })}
              </span>
              <a
                href='#console-quickstart'
                className='inline-flex items-center gap-0.5 text-xs font-medium underline underline-offset-4 transition-opacity hover:opacity-80'
                style={{ color: 'var(--cn-ink)' }}
              >
                <span>{t('View Config Examples')}</span>
                <ArrowUpRight className='size-3' aria-hidden='true' />
              </a>
            </div>

            <h3 className='text-base font-semibold tracking-tight'>
              {t('Manual Configuration')}
            </h3>
            <p
              className='mt-2 text-sm leading-relaxed'
              style={{ color: 'var(--cn-ink-2)' }}
            >
              {t(
                'Set environment variables or edit local config files directly—lightweight, transparent, and zero extra dependencies.'
              )}
            </p>

            <div className='mt-5 flex flex-1 flex-col justify-end gap-2'>
              {MANUAL_CLIENT_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={buildDocsLink(props.docsUrl, item.docsPath)}
                  target={isExternalDocs ? '_blank' : undefined}
                  rel={isExternalDocs ? 'noopener noreferrer' : undefined}
                  className='flex items-center justify-between rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors hover:bg-[var(--cn-hover)]'
                  style={{
                    borderColor: 'var(--cn-line)',
                    backgroundColor: 'var(--cn-bg)',
                    color: 'var(--cn-ink)',
                  }}
                >
                  <span>{item.name}</span>
                  <ArrowUpRight
                    className='size-3.5'
                    style={{ color: 'var(--cn-ink-2)' }}
                    aria-hidden='true'
                  />
                </a>
              ))}
            </div>
          </AnimateInView>
        </div>
      </div>
    </section>
  )
}
