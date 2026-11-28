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
import {
  Activity,
  ArrowUpRight,
  KeyRound,
  SlidersHorizontal,
} from 'lucide-react'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'

import {
  WORKFLOW_STEPS,
  type WorkflowStepDefinition,
} from '../data/workflow-steps'

interface WorkflowSectionProps {
  isAuthenticated?: boolean
}

function StepIcon(props: { num: string }) {
  if (props.num === '01') {
    return (
      <KeyRound
        className='size-4 shrink-0'
        style={{ color: 'var(--cn-accent)' }}
        aria-hidden='true'
      />
    )
  }
  if (props.num === '02') {
    return (
      <SlidersHorizontal
        className='size-4 shrink-0'
        style={{ color: 'var(--cn-accent)' }}
        aria-hidden='true'
      />
    )
  }
  return (
    <Activity
      className='size-4 shrink-0'
      style={{ color: 'var(--cn-accent)' }}
      aria-hidden='true'
    />
  )
}

function FlowConnector() {
  return (
    <div
      className='flex items-center justify-center py-1.5 md:px-1 md:py-0'
      aria-hidden='true'
    >
      {/* Desktop horizontal arrow */}
      <svg
        width='36'
        height='20'
        viewBox='0 0 36 20'
        fill='none'
        className='hidden md:block'
      >
        <line
          x1='2'
          y1='10'
          x2='28'
          y2='10'
          stroke='var(--cn-accent)'
          strokeWidth='1.75'
          strokeDasharray='3 3'
        />
        <path
          d='M24 5.5L31 10L24 14.5'
          stroke='var(--cn-accent)'
          strokeWidth='1.75'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
      {/* Mobile vertical arrow */}
      <svg
        width='20'
        height='24'
        viewBox='0 0 20 24'
        fill='none'
        className='block md:hidden'
      >
        <line
          x1='10'
          y1='2'
          x2='10'
          y2='18'
          stroke='var(--cn-accent)'
          strokeWidth='1.75'
          strokeDasharray='3 3'
        />
        <path
          d='M5.5 14L10 21L14.5 14'
          stroke='var(--cn-accent)'
          strokeWidth='1.75'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </div>
  )
}

function WorkflowActionLink(props: {
  step: WorkflowStepDefinition
  isAuthenticated: boolean
}) {
  const { t } = useTranslation()
  const target = props.isAuthenticated ? props.step.authTo : props.step.guestTo
  const label = t(props.step.actionLabelKey)

  if (target.startsWith('#')) {
    return (
      <a
        href={target}
        className='mt-3 inline-flex items-center gap-1 text-xs font-medium underline underline-offset-4 transition-opacity hover:opacity-80'
        style={{ color: 'var(--cn-ink)' }}
      >
        <span>{label}</span>
        <ArrowUpRight className='size-3.5' aria-hidden='true' />
      </a>
    )
  }

  return (
    <Link
      to={target}
      className='mt-3 inline-flex items-center gap-1 text-xs font-medium underline underline-offset-4 transition-opacity hover:opacity-80'
      style={{ color: 'var(--cn-ink)' }}
    >
      <span>{label}</span>
      <ArrowUpRight className='size-3.5' aria-hidden='true' />
    </Link>
  )
}

export function WorkflowSection(props: WorkflowSectionProps) {
  const { t } = useTranslation()
  const isAuthenticated = Boolean(props.isAuthenticated)

  return (
    <section
      id='workflow'
      className='relative z-10 border-t px-6 py-12 md:py-16'
      style={{ borderColor: 'var(--cn-line)' }}
    >
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mb-6 flex flex-wrap items-baseline justify-between gap-3'>
          <div>
            <p
              className='mb-1.5 font-mono text-xs font-medium tracking-[0.16em] uppercase'
              style={{ color: 'var(--cn-ink-3)' }}
            >
              {t('How It Works')}
            </p>
            <h2 className='text-xl font-bold tracking-tight md:text-2xl'>
              {t('Three steps to get started')}
            </h2>
          </div>
        </AnimateInView>

        <AnimateInView
          animation='fade-up'
          className='rounded-xl border p-5 md:p-6'
          style={{
            borderColor: 'var(--cn-line)',
            backgroundColor: 'var(--cn-surface)',
          }}
        >
          <div className='flex flex-col md:grid md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch'>
            {WORKFLOW_STEPS.map((step, index) => (
              <Fragment key={step.num}>
                <div
                  className='flex flex-col rounded-lg border p-4'
                  style={{
                    borderColor: 'var(--cn-line)',
                    backgroundColor: 'var(--cn-bg)',
                  }}
                >
                  <div className='mb-3 flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <span
                        className='inline-flex size-6 items-center justify-center rounded font-mono text-xs font-semibold'
                        style={{
                          backgroundColor: 'var(--cn-accent-soft)',
                          color: 'var(--cn-accent)',
                        }}
                      >
                        {step.num}
                      </span>
                      <StepIcon num={step.num} />
                    </div>
                    <code
                      className='rounded px-2 py-0.5 font-mono text-[11px]'
                      style={{
                        backgroundColor: 'var(--cn-sunk)',
                        color: 'var(--cn-ink-2)',
                      }}
                    >
                      {step.tag}
                    </code>
                  </div>

                  <h3 className='text-sm font-semibold tracking-tight'>
                    {t(step.titleKey)}
                  </h3>
                  <p
                    className='mt-1 flex-1 text-xs leading-relaxed'
                    style={{ color: 'var(--cn-ink-2)' }}
                  >
                    {t(step.shortDescKey)}
                  </p>

                  <WorkflowActionLink
                    step={step}
                    isAuthenticated={isAuthenticated}
                  />
                </div>

                {index < WORKFLOW_STEPS.length - 1 && <FlowConnector />}
              </Fragment>
            ))}
          </div>
        </AnimateInView>
      </div>
    </section>
  )
}
