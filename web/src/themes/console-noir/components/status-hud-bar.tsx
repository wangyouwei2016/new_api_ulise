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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '@/context/theme-provider'

interface StatusHudBarProps {
  crtEnabled: boolean
  onToggleCrt: () => void
}

const TOTAL_SECONDS = 60
const TICK_SLOTS = Array.from({ length: 28 }, (_, position) => position + 1)

function formatTimecode(ratio: number): string {
  const clamped = Math.min(Math.max(ratio, 0), 1)
  const seconds = Math.round(clamped * TOTAL_SECONDS)
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss} / 01:00`
}

export function StatusHudBar(props: StatusHudBarProps) {
  const { t } = useTranslation()
  const { resolvedTheme, setTheme } = useTheme()
  const [scrollRatio, setScrollRatio] = useState(0)

  useEffect(() => {
    const updateScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight
      if (scrollable <= 0) {
        setScrollRatio(0)
        return
      }
      setScrollRatio(window.scrollY / scrollable)
    }
    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('resize', updateScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateScroll)
      window.removeEventListener('resize', updateScroll)
    }
  }, [])

  const isDark = resolvedTheme === 'dark'
  const activeTicks = Math.max(1, Math.round(scrollRatio * TICK_SLOTS.length))

  return (
    <aside
      aria-label={t('Gateway status bar')}
      className='fixed inset-x-0 bottom-0 z-40 border-t px-4 backdrop-blur-md md:px-6'
      style={{
        borderColor: 'var(--cn-line)',
        backgroundColor: 'color-mix(in srgb, var(--cn-bg) 92%, transparent)',
      }}
    >
      <div className='mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 font-mono text-[11px]'>
        {/* Left: live gateway status + quick pricing link */}
        <div className='flex items-center gap-3'>
          <span className='inline-flex items-center gap-1.5'>
            <span
              aria-hidden='true'
              className='size-1.5 rounded-full'
              style={{ backgroundColor: 'var(--cn-ok)' }}
            />
            <span style={{ color: 'var(--cn-ink-2)' }}>
              {t('Service operational')}
            </span>
          </span>
          <span aria-hidden='true' style={{ color: 'var(--cn-line-strong)' }}>
            |
          </span>
          <Link
            to='/pricing'
            className='transition-colors hover:underline'
            style={{ color: 'var(--cn-ink-2)' }}
          >
            {t('View Pricing')}
          </Link>
        </div>

        {/* Center: segmented scroll timeline */}
        <div
          aria-hidden='true'
          className='hidden items-center gap-3 md:flex'
          style={{ color: 'var(--cn-ink-3)' }}
        >
          <div className='flex items-center gap-[3px]'>
            {TICK_SLOTS.map((slot) => (
              <span
                key={`tick-${slot}`}
                className='block h-2 w-[2px] rounded-full transition-colors'
                style={{
                  backgroundColor:
                    slot <= activeTicks
                      ? 'var(--cn-ink)'
                      : 'var(--cn-line-strong)',
                }}
              />
            ))}
          </div>
          <span className='tabular-nums'>{formatTimecode(scrollRatio)}</span>
        </div>

        {/* Right: bracketed retro display & theme switches */}
        <div
          className='flex items-center gap-3'
          style={{ color: 'var(--cn-ink-2)' }}
        >
          <button
            type='button'
            onClick={props.onToggleCrt}
            aria-pressed={props.crtEnabled}
            className='hidden transition-colors hover:text-[var(--cn-ink)] sm:inline-flex'
          >
            {t('Display')} [ {props.crtEnabled ? 'CRT' : t('Crisp')} ]
          </button>
          <button
            type='button'
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={t('Toggle theme')}
            className='transition-colors hover:text-[var(--cn-ink)]'
          >
            {t('Theme')} [ {isDark ? t('Dark') : t('Light')} ]
          </button>
        </div>
      </div>
    </aside>
  )
}
