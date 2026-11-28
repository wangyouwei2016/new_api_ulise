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
import { Pause, Play } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { CONSOLE_NOIR_THEME } from '../config'
import { CONSOLE_CHANNELS, type ConsoleCodeLine } from '../data/channels'

interface ConsoleMonitorProps {
  baseUrl: string
  className?: string
}

const STRING_TOKEN_RE = /"[^"]*"/g

function renderCodeTokens(text: string): ReactNode {
  if (!text) return '\u00A0'
  if (text.trimStart().startsWith('#')) {
    return <span style={{ color: 'var(--cn-screen-ink-3)' }}>{text}</span>
  }
  if (text.trimStart().startsWith('[') && text.trimEnd().endsWith(']')) {
    return <span style={{ color: 'var(--cn-code-num)' }}>{text}</span>
  }

  const segments: ReactNode[] = []
  let cursor = 0
  const matches = [...text.matchAll(STRING_TOKEN_RE)]

  if (matches.length === 0) {
    const colonIdx = text.indexOf(':')
    if (colonIdx > 0 && text.includes(' : ')) {
      return (
        <>
          <span style={{ color: 'var(--cn-code-key)' }}>
            {text.slice(0, colonIdx)}
          </span>
          <span style={{ color: 'var(--cn-screen-ink-2)' }}>
            {text.slice(colonIdx)}
          </span>
        </>
      )
    }
    return <span style={{ color: 'var(--cn-screen-ink)' }}>{text}</span>
  }

  matches.forEach((match) => {
    const start = match.index ?? 0
    if (start > cursor) {
      segments.push(
        <span
          key={`p-${cursor}-${start}`}
          style={{ color: 'var(--cn-screen-ink-2)' }}
        >
          {text.slice(cursor, start)}
        </span>
      )
    }
    const token = match[0]
    const trailing = text.slice(start + token.length).trimStart()
    const isJsonKey = trailing.startsWith(':')
    segments.push(
      <span
        key={`s-${start}-${token.length}`}
        style={{
          color: isJsonKey ? 'var(--cn-code-key)' : 'var(--cn-code-str)',
        }}
      >
        {token}
      </span>
    )
    cursor = start + token.length
  })

  if (cursor < text.length) {
    segments.push(
      <span key='tail' style={{ color: 'var(--cn-screen-ink-2)' }}>
        {text.slice(cursor)}
      </span>
    )
  }

  return segments
}

function CodeSnippetRow(props: { line: ConsoleCodeLine }) {
  return (
    <div
      className={cn(
        '-mx-4 px-4 py-0.5 break-all whitespace-pre-wrap',
        props.line.highlighted && 'theme-console-noir-code-line-highlight'
      )}
    >
      {renderCodeTokens(props.line.text)}
    </div>
  )
}

export function ConsoleMonitor(props: ConsoleMonitorProps) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [autoCycle, setAutoCycle] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!autoCycle || reducedMotion) return
    const timerId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CONSOLE_CHANNELS.length)
    }, CONSOLE_NOIR_THEME.autoCycleChannelsMs)
    return () => window.clearInterval(timerId)
  }, [autoCycle, reducedMotion])

  const activeChannel = CONSOLE_CHANNELS[activeIndex] ?? CONSOLE_CHANNELS[0]

  const lines = useMemo(
    () => activeChannel.buildLines(props.baseUrl),
    [activeChannel, props.baseUrl]
  )

  const rawSnippet = useMemo(
    () => lines.map((line) => line.text).join('\n'),
    [lines]
  )

  const handleSelectChannel = (index: number) => {
    setActiveIndex(index)
    setAutoCycle(false)
  }

  const toggleAutoCycle = () => {
    setAutoCycle((prev) => !prev)
  }

  const isRunningAuto = autoCycle && !reducedMotion

  return (
    <div id='console-quickstart' className={cn('w-full', props.className)}>
      {/* Channel Switcher Strip (00..03) */}
      <div
        role='tablist'
        aria-label={t('Client configuration channels')}
        className='mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4'
      >
        {CONSOLE_CHANNELS.map((channel, index) => {
          const isActive = index === activeIndex
          return (
            <button
              key={channel.id}
              type='button'
              role='tab'
              aria-selected={isActive}
              aria-controls={`console-panel-${channel.id}`}
              id={`console-tab-${channel.id}`}
              onClick={() => handleSelectChannel(index)}
              className={cn(
                'relative flex flex-col items-start overflow-hidden rounded-lg border px-3 py-2 text-left transition-colors duration-150',
                isActive
                  ? 'border-[var(--cn-ink)] bg-[var(--cn-surface)] text-[var(--cn-ink)]'
                  : 'border-[var(--cn-line)] bg-[var(--cn-sunk)] text-[var(--cn-ink-2)] hover:border-[var(--cn-line-strong)] hover:text-[var(--cn-ink)]'
              )}
            >
              <span className='font-mono text-[10px] tracking-widest opacity-65'>
                {channel.code}
              </span>
              <span className='mt-0.5 w-full truncate text-xs font-medium'>
                {channel.name}
              </span>
              {isActive && isRunningAuto && (
                <span
                  key={`${channel.id}-${activeIndex}`}
                  aria-hidden='true'
                  className='cn-channel-timer absolute right-0 bottom-0 left-0 h-[2px] bg-[var(--cn-ink)]'
                  style={{
                    animationDuration: `${CONSOLE_NOIR_THEME.autoCycleChannelsMs}ms`,
                  }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Hardware Monitor Frame */}
      <div
        role='tabpanel'
        id={`console-panel-${activeChannel.id}`}
        aria-labelledby={`console-tab-${activeChannel.id}`}
        className='theme-console-noir-screen overflow-hidden rounded-2xl p-4 sm:p-5'
      >
        {/* Screen Header */}
        <div
          className='flex flex-wrap items-center justify-between gap-2 border-b pb-3.5'
          style={{ borderColor: 'var(--cn-screen-line)' }}
        >
          <div className='flex items-baseline gap-3'>
            <span className='font-mono text-xl font-semibold tracking-wider'>
              CH {activeChannel.code}
            </span>
            <span
              className='text-sm font-medium'
              style={{ color: 'var(--cn-screen-ink-2)' }}
            >
              {activeChannel.name}
            </span>
          </div>

          <Button
            type='button'
            size='sm'
            variant='outline'
            aria-pressed={isRunningAuto}
            onClick={toggleAutoCycle}
            className='h-7 gap-1.5 rounded-md border-[var(--cn-screen-line-strong)] bg-[var(--cn-screen-surface)] px-2.5 text-[11px] text-[var(--cn-screen-ink-2)] hover:bg-[#1f2421] hover:text-[var(--cn-screen-ink)]'
          >
            {isRunningAuto ? (
              <Pause className='size-3' aria-hidden='true' />
            ) : (
              <Play className='size-3' aria-hidden='true' />
            )}
            <span>{isRunningAuto ? t('Auto switch') : t('Switch paused')}</span>
          </Button>
        </div>

        {/* Protocol & Endpoint Rows */}
        <div
          className='divide-y border-b text-xs'
          style={{ borderColor: 'var(--cn-screen-line)' }}
        >
          <div
            className='flex items-center justify-between gap-3 py-2.5'
            style={{ borderColor: 'var(--cn-screen-line)' }}
          >
            <div className='flex min-w-0 items-center gap-2'>
              <span
                aria-hidden='true'
                className='h-3.5 w-[2px] shrink-0 rounded-full'
                style={{ backgroundColor: 'var(--cn-screen-ink)' }}
              />
              <span className='truncate font-medium'>
                {activeChannel.protocol}
              </span>
              <span
                className='hidden rounded px-1.5 py-0.5 text-[10px] font-medium sm:inline-block'
                style={{
                  backgroundColor: 'var(--cn-warn-soft)',
                  color: '#e3a846',
                }}
              >
                {t(activeChannel.badgeKey)}
              </span>
            </div>
            <code
              className='shrink-0 font-mono text-[11px]'
              style={{ color: 'var(--cn-screen-ink-2)' }}
            >
              {activeChannel.endpointPath}
            </code>
          </div>

          <div
            className='flex items-center justify-between gap-3 py-2.5'
            style={{ borderColor: 'var(--cn-screen-line)' }}
          >
            <span style={{ color: 'var(--cn-screen-ink-3)' }}>
              {t('Gateway Base URL')}
            </span>
            <div className='flex min-w-0 items-center gap-1.5'>
              <code
                className='truncate font-mono text-[11px]'
                style={{ color: 'var(--cn-code-num)' }}
              >
                {props.baseUrl}
              </code>
              <CopyButton
                value={props.baseUrl}
                variant='ghost'
                size='icon'
                className='size-6 text-[var(--cn-screen-ink-2)] hover:bg-white/10 hover:text-[var(--cn-screen-ink)]'
                iconClassName='size-3'
                aria-label={t('Copy gateway URL')}
              />
            </div>
          </div>
        </div>

        {/* Copyable Config Snippet Card */}
        <div
          className='mt-4 overflow-hidden rounded-xl border'
          style={{
            borderColor: 'var(--cn-screen-line)',
            backgroundColor: '#090b0a',
          }}
        >
          <div
            className='flex items-center justify-between gap-2 border-b px-4 py-2'
            style={{ borderColor: 'var(--cn-screen-line)' }}
          >
            <code
              className='truncate font-mono text-[11px]'
              style={{ color: 'var(--cn-screen-ink-3)' }}
            >
              {activeChannel.filePath}
            </code>
            <CopyButton
              value={rawSnippet}
              variant='outline'
              size='sm'
              className='h-6 gap-1 rounded-md border-[var(--cn-screen-line-strong)] bg-[var(--cn-screen-surface)] px-2 text-[11px] text-[var(--cn-screen-ink)] hover:bg-[#222825]'
              iconClassName='size-3'
              aria-label={t('Copy configuration snippet')}
            >
              <span>{t('Copy')}</span>
            </CopyButton>
          </div>

          <div className='min-h-[196px] overflow-x-auto px-4 py-3.5 font-mono text-[12px] leading-6'>
            {lines.map((line) => (
              <CodeSnippetRow key={line.id} line={line} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
