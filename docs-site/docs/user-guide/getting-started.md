# 快速上手

只需 3 步完成账号准备、密钥创建与客户端接入，约 5 分钟即可开始调用全系列大模型。

::: tip 开始之前
请确保你已在控制台完成账号注册并拥有可用余额或订阅额度。控制台地址：`https://api.weigeai.com/`，统一 API 地址：`https://api.weigeai.com`。
:::

## 第一步：获取额度或充值

前往控制台的「钱包 / 充值」页面选择适合你的计费方式：

- **按量计费（Pay-as-you-go）**：充值余额后按实际消耗 Token 扣费，无时间限制，适合个人开发者与弹性调用场景。
- **兑换码 / 套餐**：若你持有兑换码，可在钱包页直接兑换并实时入账。

详细计费说明与常见问题请查看 [计费与套餐](/user-guide/billing)。

## 第二步：创建 API Key

1. 登录控制台并进入 **API 令牌（API Keys）** 页面。
2. 点击 **新建令牌**，填写便于识别的名称（例如 `claude-code-mac`）。
3. 按需选择 **分组**、**可用模型范围**、**额度上限** 与 **过期时间**。
4. 创建完成后复制以 `sk-` 开头的密钥并妥善保存。

::: danger 安全提示
API Key 等同于账户消费凭证，请勿提交到公开 Git 仓库或在前端代码中硬编码。若怀疑泄露，请立即在控制台禁用或删除该密钥。
:::

## 第三步：选择客户端接入 {#client-config}

提供三种客户端接入方式，按你的使用习惯选择对应入口：

### 方式1：推荐工具

<div class="doc-cards">
  <a href="/clients/cc-switch">
    <strong>CC Switch <span>推荐 →</span></strong>
    <p>一站式可视化管理多端配置，一键切换 Claude Code / Codex / Gemini 等代理参数。</p>
  </a>
  <a href="/clients/magpie">
    <strong>Magpie <span>推荐 →</span></strong>
    <p>统一管理所有 AI Agent 与模型供应商，内置本机协议转换网关，支持路由组与用量统计。</p>
  </a>
</div>

### 方式2：脚本一键配置

<div class="doc-cards">
  <a href="/user-guide/claude-code">
    <strong>Claude Code（一键脚本） <span>→</span></strong>
    <p>运行 Windows / macOS / Linux 一键脚本，自动检测环境并写入配置。</p>
  </a>
  <a href="/user-guide/codex">
    <strong>Codex（一键脚本） <span>→</span></strong>
    <p>运行一键脚本自动生成 config.toml，同时兼容 Codex CLI 与桌面端 App。</p>
  </a>
</div>

### 方式3：手工配置

<div class="doc-cards">
  <a href="/clients/claude-code-manual">
    <strong>Claude Code（手工配置） <span>→</span></strong>
    <p>手动写入环境变量或 ~/.claude/settings.json，灵活可控无额外依赖。</p>
  </a>
  <a href="/clients/codex-manual">
    <strong>Codex CLI（手工配置） <span>→</span></strong>
    <p>手动安装 CLI 并编辑 ~/.codex/config.toml 与 auth.json。</p>
  </a>
</div>

## 快速验证连通性

在终端运行以下命令测试密钥与接口是否正常：

```bash
curl https://api.weigeai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-api-key" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      { "role": "user", "content": "你好，请回复 OK 表示连接成功。" }
    ]
  }'
```

收到正常的 JSON 响应即表示接入成功。如需更多接口协议与排错说明，请继续阅读 [帮助中心](/user-guide/help-center)。
