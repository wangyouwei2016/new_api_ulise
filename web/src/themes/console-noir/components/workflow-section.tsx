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
import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'

import {
  WORKFLOW_STEPS,
  type WorkflowStepDefinition,
} from '../data/workflow-steps'

interface WorkflowSectionProps {
  isAuthenticated?: boolean
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
        className='mt-5 inline-flex items-center gap-1 text-xs font-medium underline underline-offset-4 transition-opacity hover:opacity-80'
        style={{ color: 'var(--cn-accent)' }}
      >
        <span>{label}</span>
        <ArrowUpRight className='size-3.5' aria-hidden='true' />
      </a>
    )
  }

  return (
    <Link
      to={target}
      className='mt-5 inline-flex items-center gap-1 text-xs font-medium underline underline-offset-4 transition-opacity hover:opacity-80'
      style={{ color: 'var(--cn-accent)' }}
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
      className='relative z-10 border-t px-6 py-20 md:py-28'
      style={{ borderColor: 'var(--cn-line)' }}
    >
      <div className='mx-auto max-w-6xl'>
        <AnimateInView className='mb-12 flex flex-col gap-3 md:mb-16 md:flex-row md:items-end md:justify-between'>
          <div>
            <p
              className='mb-2 font-mono text-xs font-medium tracking-[0.16em] uppercase'
              style={{ color: 'var(--cn-ink-3)' }}
            >
              {t('How It Works')}
            </p>
            <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
              {t('Three steps to get started')}
            </h2>
          </div>
          <p
            className='max-w-md text-sm leading-relaxed'
            style={{ color: 'var(--cn-ink-2)' }}
          >
            {t(
              'Follow this workflow to generate a key, point your client to the gateway, and start calling models in minutes.'
            )}
          </p>
        </AnimateInView>

        <div className='grid gap-8 md:grid-cols-3 md:gap-10'>
          {WORKFLOW_STEPS.map((step, index) => (
            <AnimateInView
              key={step.num}
              delay={index * 100}
              animation='fade-up'
              className='flex flex-col border-t pt-6'
            >
              <div
                className='mb-4 flex items-center justify-between border-b pb-3'
                style={{ borderColor: 'var(--cn-line)' }}
              >
                <span
                  className='font-mono text-lg font-semibold tracking-wider'
                  style={{ color: 'var(--cn-ink)' }}
                >
                  {step.num}
                </span>
                <span
                  className='font-mono text-[11px] uppercase'
                  style={{ color: 'var(--cn-ink-3)' }}
                >
                  {t('Step {{num}}', { num: step.num })}
                </span>
              </div>

              <h3 className='text-base font-semibold tracking-tight'>
                {t(step.titleKey)}
              </h3>
              <p
                className='mt-2.5 flex-1 text-sm leading-relaxed'
                style={{ color: 'var(--cn-ink-2)' }}
              >
                {t(step.descKey)}
              </p>

              <WorkflowActionLink
                step={step}
                isAuthenticated={isAuthenticated}
              />
            </AnimateInView>
          ))}
        </div>
      </div>
    </section>
  )
}
