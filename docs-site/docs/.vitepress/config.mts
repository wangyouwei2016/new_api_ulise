import { defineConfig } from 'vitepress'
import { brand } from './brand'

export default defineConfig({
  lang: 'zh-CN',
  title: brand.siteTitle,
  description: brand.siteDescription,
  cleanUrls: true,
  lastUpdated: true,
  appearance: 'light',
  scrollOffset: 88,

  sitemap: {
    hostname: brand.docsOrigin,
  },

  vite: {
    css: {
      postcss: {
        plugins: [],
      },
    },
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: brand.logo.src }],
  ],

  themeConfig: {
    siteTitle: brand.shortName,
    logo: brand.logo,

    nav: [
      {
        text: '指南',
        link: '/user-guide/getting-started',
        activeMatch: '^/(?:$|index|user-guide/getting-started)',
      },
      {
        text: '客户端',
        link: '/user-guide/help-center#cc-switch-config',
        activeMatch: '^/clients/',
      },
      {
        text: 'API',
        link: '/user-guide/help-center#openai-compatible-api',
        activeMatch: '^/api/',
      },
      {
        text: '帮助',
        link: '/user-guide/help-center#faq',
        activeMatch: '^/(?:about|terms-and-conditions/)',
      },
    ],

    sidebar: [
      {
        text: '快速开始',
        items: [
          { text: '概览', link: '/' },
          { text: '快速上手', link: '/user-guide/getting-started' },
          { text: '计费与套餐', link: '/user-guide/help-center#purchase-payment' },
          { text: 'API Key 与分组', link: '/user-guide/help-center#create-api-key' },
          { text: '选择客户端', link: '/user-guide/getting-started#client-config' },
        ],
      },
      {
        text: '客户端接入',
        items: [
          { text: 'CC Switch', link: '/user-guide/help-center#cc-switch-config' },
          { text: 'Claude Code', link: '/user-guide/help-center#claude-code-config' },
          { text: 'Claude Desktop', link: '/user-guide/help-center#claude-desktop-config' },
          { text: 'Codex CLI', link: '/user-guide/help-center#codex-config' },
          { text: 'Cursor', link: '/user-guide/help-center#cursor-config' },
          { text: 'Cherry Studio', link: '/user-guide/help-center#cherry-studio-config' },
        ],
      },
      {
        text: 'API',
        items: [
          { text: '接口与模型', link: '/user-guide/help-center#groups-and-api-types' },
          { text: 'OpenAI 兼容接口', link: '/user-guide/help-center#openai-compatible-api' },
          { text: 'Anthropic 兼容接口', link: '/user-guide/help-center#anthropic-compatible-api' },
          { text: 'Gemini / xAI 接口', link: '/user-guide/help-center#xai-compatible-api' },
          { text: '图像与多模态', link: '/user-guide/help-center#multimodal-config' },
          { text: '视频生成指南', link: '/user-guide/video-generation' },
        ],
      },
      {
        text: '帮助',
        items: [
          { text: '帮助中心', link: '/user-guide/help-center' },
          { text: '故障排查', link: '/user-guide/help-center#faq' },
          { text: '安全建议', link: '/user-guide/help-center#security-tips' },
          { text: '联系支持', link: '/user-guide/help-center#support' },
          { text: '条款与政策', link: '/terms-and-conditions/terms' },
          { text: '服务特定条款', link: '/terms-and-conditions/service-specific-terms' },
          { text: '隐私政策', link: '/terms-and-conditions/privacy' },
          { text: '使用政策', link: '/terms-and-conditions/usage-policy' },
          { text: '关于我们', link: '/about' },
        ],
      },
    ],

    outline: {
      level: [2, 3],
      label: '本页目录',
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    lastUpdated: {
      text: '最后更新于',
    },

    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                noResultsText: '没有找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                },
              },
            },
          },
        },
      },
    },
  },
})
