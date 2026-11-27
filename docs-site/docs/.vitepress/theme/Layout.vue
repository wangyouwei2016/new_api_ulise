<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData, useRoute } from 'vitepress'
import { brand } from '../brand'

const { hash } = useData()
const route = useRoute()
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})

const activeHash = computed(() => (mounted.value ? hash.value : ''))

const GROUP_LABELS = {
  guide: '快速开始',
  clients: '客户端接入',
  api: 'API',
  help: '帮助',
} as const

const CLIENT_ANCHORS = new Set([
  'cc-switch-config',
  'claude-code-config',
  'claude-desktop-config',
  'codex-config',
  'cursor-config',
  'cherry-studio-config',
])

const API_ANCHORS = new Set([
  'groups-and-api-types',
  'openai-compatible-api',
  'anthropic-compatible-api',
  'xai-compatible-api',
  'multimodal-config',
])

const GUIDE_ANCHORS = new Set([
  'purchase-payment',
  'redeem-code',
  'create-api-key',
])

const activeSection = computed(() => {
  const anchor = activeHash.value.replace(/^#/, '')

  if (route.path.includes('/help-center')) {
    if (CLIENT_ANCHORS.has(anchor)) {
      return { group: 'clients', label: GROUP_LABELS.clients }
    }
    if (API_ANCHORS.has(anchor)) {
      return { group: 'api', label: GROUP_LABELS.api }
    }
    if (GUIDE_ANCHORS.has(anchor)) {
      return { group: 'guide', label: GROUP_LABELS.guide }
    }
    return { group: 'help', label: GROUP_LABELS.help }
  }

  if (route.path.includes('/video-generation')) {
    return { group: 'api', label: GROUP_LABELS.api }
  }

  if (route.path.includes('/terms-and-conditions') || route.path.includes('/about')) {
    return { group: 'help', label: GROUP_LABELS.help }
  }

  return { group: 'guide', label: GROUP_LABELS.guide }
})

const isHelpAnchor = computed(
  () => route.path.includes('/help-center') && Boolean(activeHash.value),
)

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
    :data-help-anchor="isHelpAnchor"
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
