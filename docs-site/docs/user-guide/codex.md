# Codex 配置教程

安装并配置 Codex，通过 `~/.codex` 连接 **维格智创Token站**（`https://api.weigeai.com/`），完成 Codex CLI 与桌面端 App 的模型、API Key 和 Responses 接口设置。

## 按系统选择一键脚本

脚本会自动检测 Node.js 和 Codex CLI，缺失时引导安装；随后提示输入 API 密钥，并写入 `~/.codex/config.toml`。复制的命令不包含密钥。

::: code-group

```powershell [Windows PowerShell]
irm https://api.weigeai.com/install/codex.ps1 | iex
```

```bash [macOS / Linux / WSL]
curl -fsSL https://api.weigeai.com/install/codex.sh | bash
```

:::

::: tip 生效范围提示
配置写入 `~/.codex` 后，Codex CLI 和 Codex App 会同时生效；已打开的 CLI 需要重启后才会读取新配置。
:::

::: tip 密钥与模型提示
任一 Codex / GPT 分组的密钥都可以用于 Codex，请在 [控制台密钥页](https://api.weigeai.com/) 创建。你也可以根据控制台模型广场支持的模型名称，随时调整 `~/.codex/config.toml` 中的 `model` 字段。
:::

:::: details 备用方式：手动安装 Codex（一键脚本不可用时展开使用）

::: warning 环境要求
手动安装前，请确保本机已安装 **Node.js 22+** 与 `npm`（可通过 `node --version` 检查）。
:::

### 第一步：安装 Codex

::: code-group

```powershell [Windows (CMD / PowerShell)]
npm install -g @openai/codex@latest
```

```bash [Linux]
sudo npm install -g @openai/codex@latest
```

```bash [macOS]
npm install -g @openai/codex@latest
```

:::

以上命令会从 npm 官方仓库下载并安装最新版本的 Codex。验证安装：

```bash
codex --version
```

### 第二步：创建配置文件

Codex 只需要配置 `config.toml`，把 API 密钥填写到 `experimental_bearer_token`：

::: code-group

```powershell [Windows PowerShell]
# 创建配置目录（已有配置会被下面的命令覆盖，建议先自行备份）
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.codex" | Out-Null
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# 创建 config.toml
$config = @'
model_provider = "codex"
model = "gpt-6.1-sol"
model_reasoning_effort = "high"
model_context_window = 272000
sandbox_mode = "workspace-write"

[model_providers.codex]
name = "codex"
base_url = "https://api.weigeai.com/v1"
wire_api = "responses"
requires_openai_auth = false
supports_websockets = false
experimental_bearer_token = "YOUR_API_KEY"
http_headers = { "x-openai-actor-authorization" = "api.weigeai.com" }

[desktop]
conversationDetailMode = "STEPS_COMMANDS"

[sandbox_workspace_write]
network_access = true

[features]
goals = true
'@
[System.IO.File]::WriteAllText("$env:USERPROFILE\.codex\config.toml", $config, $utf8NoBom)
```

```bash [Linux]
# 创建配置目录（已有配置会被下面的命令覆盖，建议先自行备份）
mkdir -p ~/.codex

# 创建 config.toml
cat > ~/.codex/config.toml << 'EOF'
model_provider = "codex"
model = "gpt-6.1-sol"
model_reasoning_effort = "high"
model_context_window = 272000
sandbox_mode = "workspace-write"

[model_providers.codex]
name = "codex"
base_url = "https://api.weigeai.com/v1"
wire_api = "responses"
requires_openai_auth = false
supports_websockets = false
experimental_bearer_token = "YOUR_API_KEY"
http_headers = { "x-openai-actor-authorization" = "api.weigeai.com" }

[desktop]
conversationDetailMode = "STEPS_COMMANDS"

[sandbox_workspace_write]
network_access = true

[features]
goals = true
EOF
```

```bash [macOS]
# 创建配置目录（已有配置会被下面的命令覆盖，建议先自行备份）
mkdir -p ~/.codex

# 创建 config.toml
cat > ~/.codex/config.toml << 'EOF'
model_provider = "codex"
model = "gpt-6.1-sol"
model_reasoning_effort = "high"
model_context_window = 272000
sandbox_mode = "workspace-write"

[model_providers.codex]
name = "codex"
base_url = "https://api.weigeai.com/v1"
wire_api = "responses"
requires_openai_auth = false
supports_websockets = false
experimental_bearer_token = "YOUR_API_KEY"
http_headers = { "x-openai-actor-authorization" = "api.weigeai.com" }

[desktop]
conversationDetailMode = "STEPS_COMMANDS"

[sandbox_workspace_write]
network_access = true

[features]
goals = true
EOF
```

:::

::: tip 替换密钥
请将配置中的 `YOUR_API_KEY` 替换为你在 [控制台](https://api.weigeai.com/) 复制的 API 密钥。
:::

::::

## 开始使用

进入项目目录后运行：

```bash
codex
```

更多使用说明请参考 [OpenAI 官方文档](https://platform.openai.com/docs)。
