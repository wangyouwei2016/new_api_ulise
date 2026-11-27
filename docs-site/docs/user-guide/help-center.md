# 帮助中心

集中查阅账户计费、API Key 管理、主流客户端接入方式、接口协议规范、常见故障排查与技术支持。

## 计费与套餐 {#purchase-payment}

维格智创Token站 采用透明的统一额度计费机制，你在控制台即可实时查看每次请求的模型、输入/输出 Token 数及对应费用明细。

| 计费项 | 说明 |
| --- | --- |
| 按量计费 | 按请求的实际 Prompt Token 与 Completion Token 扣费，不同分组对应不同倍率 |
| 缓存命中 | 支持上游 Prompt Caching 的模型会自动按缓存命中费率计费 |
| 失败请求 | 上游报错或网络超时且未产生有效回复时，不扣除额度 |

### 兑换码使用 {#redeem-code}

1. 登录控制台并进入 **钱包 → 兑换码**。
2. 输入兑换码并点击 **确认兑换**，额度会即时计入账户余额。
3. 如提示「兑换码无效或已使用」，请检查前后是否误带空格，或联系支持核查。

## 创建与管理 API Key {#create-api-key}

在控制台 **令牌管理** 中可以为不同设备、项目或成员创建独立的 API Key：

- **名称**：建议使用「用途-设备」格式命名（如 `cursor-work-mac`），便于后续审计与吊销。
- **分组（Group）**：不同分组决定可用线路与计费倍率，请按需匹配。
- **额度限制**：建议为第三方工具设置单密钥额度上限，降低异常循环调用风险。
- **模型白名单**：仅勾选当前工具需要的模型，避免误调用高单价模型。

---

## CC Switch 配置 {#cc-switch-config}

::: tip 推荐使用
如果你同时使用 Claude Code、Codex CLI 等多个终端工具，使用 CC Switch 可以避免手动编辑环境变量和 JSON 配置文件，切换供应商更省心。
:::

1. 下载并安装最新版本的 **CC Switch** 桌面客户端。
2. 打开软件后点击 **新增供应商（Add Provider）**。
3. 填写以下配置项并保存：

| 配置项 | 填写值 |
| --- | --- |
| 名称 | `维格智创Token站` |
| API Base URL（Anthropic） | `https://api.weigeai.com` |
| API Base URL（OpenAI） | `https://api.weigeai.com/v1` |
| API Key | 控制台创建的 `sk-...` 密钥 |

4. 在主界面点击 **启用**，重启终端即可生效。

## Claude Code 配置 {#claude-code-config}

### 方式一：环境变量配置（macOS / Linux）

将以下内容添加到 `~/.zshrc` 或 `~/.bashrc` 中，然后执行 `source ~/.zshrc`：

```bash
export ANTHROPIC_BASE_URL="https://api.weigeai.com"
export ANTHROPIC_AUTH_TOKEN="sk-your-api-key"
```

### 方式二：配置文件（`~/.claude/settings.json`）

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.weigeai.com",
    "ANTHROPIC_AUTH_TOKEN": "sk-your-api-key"
  }
}
```

配置完成后在项目目录运行 `claude` 即可开始对话。

## Claude Desktop 配置 {#claude-desktop-config}

若通过本地代理或第三方插件将 Claude Desktop 指向自定义端点，请按以下要点检查：

1. 在客户端中开启自定义 API / 开发者模式（若版本支持）。
2. 将服务端点设为 `https://api.weigeai.com`，并填入 `sk-` 密钥。
3. 保存后**完全退出并重启** Claude Desktop 使配置生效。

## Codex CLI 配置 {#codex-config}

1. 安装 Codex CLI：

```bash
npm install -g @openai/codex
```

2. 编辑 `~/.codex/config.toml`：

```toml
model_provider = "weigeai"
model = "gpt-5"

[model_providers.weigeai]
name = "维格智创Token站"
base_url = "https://api.weigeai.com/v1"
wire_api = "responses"
requires_openai_auth = true
```

3. 编辑 `~/.codex/auth.json` 填入密钥：

```json
{
  "OPENAI_API_KEY": "sk-your-api-key"
}
```

## Cursor 配置 {#cursor-config}

1. 打开 Cursor，进入 **Settings → Models**。
2. 展开 **OpenAI API Key** 区域：
   - 填入控制台创建的 `sk-...` 密钥；
   - 开启 **Override OpenAI Base URL**，填写 `https://api.weigeai.com/v1`。
3. 点击 **Verify** 验证通过后，在模型列表中勾选需要使用的模型。

## Cherry Studio 配置 {#cherry-studio-config}

1. 打开 Cherry Studio，进入左下角 **设置 → 模型服务**。
2. 点击 **添加** 创建自定义供应商（类型选择 `OpenAI` 或 `Anthropic`）。
3. 填写 API 密钥与 API 地址：
   - OpenAI 类型填写 `https://api.weigeai.com`（Cherry Studio 会自动补全 `/v1`）
   - Anthropic 类型填写 `https://api.weigeai.com`
4. 点击 **管理** 拉取或手动添加模型名称，点击 **检查** 验证连通性。

---

## 接口类型与模型说明 {#groups-and-api-types}

维格智创Token站 提供多协议统一接入，开发者无需修改已有 SDK 即可平滑切换。

<table class="method-table">
  <thead>
    <tr>
      <th>协议类型</th>
      <th>Base URL</th>
      <th>适用场景与典型端点</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>OpenAI 兼容接口</td>
      <td><code>https://api.weigeai.com/v1</code></td>
      <td><code>/v1/chat/completions</code>、<code>/v1/responses</code>、<code>/v1/embeddings</code></td>
    </tr>
    <tr>
      <td>Anthropic 兼容接口</td>
      <td><code>https://api.weigeai.com</code></td>
      <td><code>/v1/messages</code>，原生支持 Prompt Caching 与工具调用</td>
    </tr>
    <tr>
      <td>Gemini / xAI 接口</td>
      <td><code>https://api.weigeai.com</code></td>
      <td>支持原生协议或通过 OpenAI 兼容端点统一调用</td>
    </tr>
  </tbody>
</table>

## OpenAI 兼容接口 {#openai-compatible-api}

使用官方 OpenAI SDK 时，只需修改 `base_url` 与 `api_key`：

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.weigeai.com/v1",
)

resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "用三句话介绍 API 网关的作用"}],
)
print(resp.choices[0].message.content)
```

## Anthropic 兼容接口 {#anthropic-compatible-api}

使用官方 Anthropic SDK 调用 Claude 系列模型：

```python
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-api-key",
    base_url="https://api.weigeai.com",
)

message = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "你好，请介绍一下你自己"}],
)
print(message.content[0].text)
```

## Gemini / xAI 兼容接口 {#xai-compatible-api}

可通过 OpenAI 兼容协议直接传入对应模型名称，无需额外更换 SDK：

```bash
curl https://api.weigeai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-api-key" \
  -d '{
    "model": "gemini-2.5-pro",
    "messages": [
      { "role": "user", "content": "比较 REST 与 GraphQL 的核心差异" }
    ]
  }'
```

## 图像与多模态接口 {#multimodal-config}

支持通过 `/v1/images/generations` 进行文生图，或在 `/v1/chat/completions` 中传入 `image_url` 进行图像理解：

```bash
curl https://api.weigeai.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-api-key" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "A minimalist isometric illustration of a cloud API gateway",
    "size": "1024x1024"
  }'
```

如需视频生成异步任务接入指南，请参阅 [视频生成指南](/user-guide/video-generation)。

---

## 常见故障排查 {#faq}

### 返回 `401 Unauthorized`
- 检查 API Key 是否复制完整、是否存在多余空格或换行符。
- 检查该密钥在控制台是否已被禁用、过期或耗尽独立额度。

### 返回 `403` 或提示「当前分组无可用渠道 / 模型无权限」
- 在控制台确认你的令牌分组是否支持所调用的模型。
- 检查模型名称拼写是否与控制台「模型广场」中的准确名称一致。

### 返回 `429 Too Many Requests`
- 触发了并发速率限制或上游通道临时拥堵，建议在客户端启用指数退避重试（Exponential Backoff）。

### 路径拼接出现 `/v1/v1/...` 导致 `404`
- 部分客户端会自动追加 `/v1`，遇到 404 时尝试将 Base URL 末尾的 `/v1` 去掉再试。

## 安全建议 {#security-tips}

::: warning 密钥管理最佳实践
1. **按场景拆分密钥**：开发调试、生产服务与桌面客户端分别使用独立 API Key，便于快速定位与吊销。
2. **设置额度上限与过期时间**：避免测试脚本死循环造成意外高额消费。
3. **禁止前端暴露密钥**：浏览器或移动端应用必须经由自有后端转发请求，切勿将 `sk-` 密钥打包进前端代码。
:::

## 联系支持 {#support}

如上述指南仍无法解决你的问题，请准备以下信息联系技术支持，以便更快排查：

- 你的账户名或用户 ID（**切勿发送完整 API Key**）
- 发生问题的大致时间与调用的模型名称
- 完整的报错状态码、错误 JSON 或请求 ID（`X-Request-Id`）

支持渠道：`QQ群XXXXX`。
