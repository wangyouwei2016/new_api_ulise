<template>
  <section class="home-methods">
    <div class="home-methods__header">
      <h2>三种客户端接入方式</h2>
      <p>按你的使用习惯选择对应安装方式，点击直达完整配置指南。</p>
    </div>

    <div class="home-methods__grid">
      <div class="home-method-card is-recommended">
        <div class="home-method-card__top">
          <span class="home-method-card__step">方式 1</span>
          <span class="home-method-card__badge">推荐</span>
        </div>
        <h3>推荐工具托管</h3>
        <p class="home-method-card__desc">
          可视化管理或本机协议网关，免手动修改配置文件，支持多端一键切换。
        </p>
        <div class="home-method-card__links">
          <a href="/clients/cc-switch"><span>CC Switch</span><span>→</span></a>
          <a href="/clients/magpie"><span>Magpie</span><span>→</span></a>
        </div>
      </div>

      <div class="home-method-card">
        <div class="home-method-card__top">
          <span class="home-method-card__step">方式 2</span>
        </div>
        <h3>脚本一键配置</h3>
        <p class="home-method-card__desc">
          复制一行 PowerShell / Bash 命令，自动检测环境并完成安装与配置写入。
        </p>
        <div class="home-method-card__links">
          <a href="/user-guide/claude-code"><span>Claude Code（一键脚本）</span><span>→</span></a>
          <a href="/user-guide/codex"><span>Codex（一键脚本）</span><span>→</span></a>
        </div>
      </div>

      <div class="home-method-card">
        <div class="home-method-card__top">
          <span class="home-method-card__step">方式 3</span>
        </div>
        <h3>手工配置</h3>
        <p class="home-method-card__desc">
          手动写入环境变量或编辑本地配置文件，轻量可控，无额外依赖。
        </p>
        <div class="home-method-card__links">
          <a href="/clients/claude-code-manual"><span>Claude Code（手工配置）</span><span>→</span></a>
          <a href="/clients/codex-manual"><span>Codex CLI（手工配置）</span><span>→</span></a>
          <a href="/clients/claude-desktop"><span>Claude Desktop</span><span>→</span></a>
          <a href="/clients/cursor"><span>Cursor</span><span>→</span></a>
          <a href="/clients/cherry-studio"><span>Cherry Studio</span><span>→</span></a>
        </div>
      </div>
    </div>
  </section>
</template>
