<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData, useRoute, useRouter } from 'vitepress'
import { brand } from '../brand'

const { hash } = useData()
const route = useRoute()
const router = useRouter()

const GROUP_LABELS = {
  guide: '快速开始',
  clientsMethod1: '客户端接入 · 方式1：推荐工具',
  clientsMethod2: '客户端接入 · 方式2：脚本一键配置',
  clientsMethod3: '客户端接入 · 方式3：手工配置',
  api: 'API',
  help: '帮助',
} as const

const LEGACY_HELP_REDIRECTS: Record<string, string> = {
  'purchase-payment': '/user-guide/billing',
  'redeem-code': '/user-guide/billing#redeem-code',
  'create-api-key': '/user-guide/api-keys',
  'cc-switch-config': '/clients/cc-switch',
  'magpie-config': '/clients/magpie',
  'claude-code-config': '/clients/claude-code-manual',
  'claude-desktop-config': '/clients/claude-desktop',
  'codex-config': '/clients/codex-manual',
  'cursor-config': '/clients/cursor',
  'cherry-studio-config': '/clients/cherry-studio',
  'groups-and-api-types': '/api/overview',
  'openai-compatible-api': '/api/openai',
  'anthropic-compatible-api': '/api/anthropic',
  'xai-compatible-api': '/api/gemini-xai',
  'multimodal-config': '/api/multimodal',
  faq: '/help/faq',
  'security-tips': '/help/security',
  support: '/help/support',
}

function redirectLegacyHelpAnchor() {
  if (typeof window === 'undefined') return
  const normalizedPath = route.path.replace(/\.html$/, '').replace(/\/$/, '')
  if (normalizedPath !== '/user-guide/help-center') return
  const anchor = (hash.value || window.location.hash).replace(/^#/, '')
  const target = LEGACY_HELP_REDIRECTS[anchor]
  if (target) {
    router.go(target)
  }
}

onMounted(() => {
  redirectLegacyHelpAnchor()
})

watch(
  () => [route.path, hash.value],
  () => {
    redirectLegacyHelpAnchor()
  },
)

const activeSection = computed(() => {
  if (
    route.path.includes('/clients/cc-switch') ||
    route.path.includes('/clients/magpie')
  ) {
    return { group: 'clients', label: GROUP_LABELS.clientsMethod1 }
  }

  if (
    route.path.includes('/user-guide/claude-code') ||
    route.path.includes('/user-guide/codex')
  ) {
    return { group: 'clients', label: GROUP_LABELS.clientsMethod2 }
  }

  if (route.path.includes('/clients/')) {
    return { group: 'clients', label: GROUP_LABELS.clientsMethod3 }
  }

  if (route.path.includes('/api/') || route.path.includes('/video-generation')) {
    return { group: 'api', label: GROUP_LABELS.api }
  }

  if (
    route.path.includes('/help/') ||
    route.path.includes('/help-center') ||
    route.path.includes('/terms-and-conditions') ||
    route.path.includes('/about')
  ) {
    return { group: 'help', label: GROUP_LABELS.help }
  }

  return { group: 'guide', label: GROUP_LABELS.guide }
})

const currentYear = new Date().getFullYear()

function handleSidebarClick(event: MouseEvent) {
  if (window.innerWidth >= 960) return
  const target = event.target as HTMLElement | null
  if (!target?.closest('.VPSidebar a[href]')) return
  const backdrop = document.querySelector<HTMLElement>('.VPBackdrop')
  backdrop?.click()
}
</script>

<template>
  <DefaultTheme.Layout
    :data-nav-group="activeSection.group"
    @click.capture="handleSidebarClick"
  >
    <template #nav-bar-title-after>
      <span class="brand-docs">{{ brand.docsLabel }}</span>
    </template>

    <template #nav-bar-content-after>
      <a
        class="console-link"
        :href="brand.consoleUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ brand.consoleLabel }}
      </a>
    </template>

    <template #doc-before>
      <div class="doc-breadcrumb">{{ activeSection.label }}</div>
    </template>

    <template #layout-bottom>
      <footer class="site-footer">
        <span>{{ brand.supportText }}</span>
        <span>© {{ currentYear }} {{ brand.copyrightOwner }}</span>
      </footer>
    </template>
  </DefaultTheme.Layout>
</template>
