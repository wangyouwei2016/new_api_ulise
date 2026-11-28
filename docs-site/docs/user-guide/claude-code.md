# Claude Code 配置教程

安装 Claude Code，配置 **维格智创Token站**（`https://api.weigeai.com/`）接口地址与 API Key，查看 Windows、macOS 和 Linux 的完整接入步骤。

用一键脚本安装并接入 **维格智创Token站**。脚本会自动检测 Node.js 和 Claude Code，缺失时按提示安装并写入配置。复制的命令不包含密钥。

## 按系统选择一键脚本

复制对应系统的命令，运行后输入 API 密钥即可：

::: code-group

```powershell [Windows PowerShell]
irm https://api.weigeai.com/install/claude-code.ps1 | iex
```

```bash [macOS / Linux / WSL]
curl -fsSL https://api.weigeai.com/install/claude-code.sh | bash
```

:::

::: tip 重启生效
配置写入后，已打开的终端和 Claude Code 需要重启后才会读取新配置。
:::

::: tip 密钥分组说明
任一 Claude 分组的密钥都可以用于 Claude Code，请在 [控制台密钥页](https://api.weigeai.com/) 创建；Claude Code 专用分组仅能用于 Claude Code。
:::

:::: details 备用方式：手动安装 Claude Code（需要审查命令或一键脚本不可用时展开）

::: warning 环境要求
手动安装前，请确保本机已安装 **Node.js 22+** 与 `npm`（可通过 `node --version` 检查）。
:::

### 第一步：安装 Claude Code

::: code-group

```powershell [Windows (CMD / PowerShell)]
npm install -g @anthropic-ai/claude-code
```

```bash [Linux]
sudo npm install -g @anthropic-ai/claude-code
```

```bash [macOS]
npm install -g @anthropic-ai/claude-code
```

:::

也可以使用 Anthropic 官方安装脚本（会在后台自动更新；Windows 需先安装 Git for Windows）：

::: code-group

```bash [macOS / Linux / WSL]
curl -fsSL https://claude.ai/install.sh | bash
```

```powershell [Windows PowerShell]
irm https://claude.ai/install.ps1 | iex
```

:::

验证安装：

```bash
claude --version
```

### 第二步：配置环境变量

把下面的值写入当前终端或系统环境变量：

| 变量名 | 填写值 | 说明 |
| --- | --- | --- |
| `ANTHROPIC_BASE_URL` | `https://api.weigeai.com` | 接口地址，不带 `/v1` |
| `ANTHROPIC_AUTH_TOKEN` | `your-key` | 你的 API 密钥 |
| `ANTHROPIC_MODEL` | `claude-opus-5-5` | 默认模型（可按控制台可用模型调整） |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | `1` | 关闭非必要遥测流量，请保留 |

**临时设置**（只在当前终端有效）：

::: code-group

```bat [Windows CMD]
set ANTHROPIC_BASE_URL=https://api.weigeai.com
set ANTHROPIC_AUTH_TOKEN=your-key
set ANTHROPIC_MODEL=claude-opus-5-5
set CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
cd your-project
claude
```

```powershell [Windows PowerShell]
$env:ANTHROPIC_BASE_URL="https://api.weigeai.com"
$env:ANTHROPIC_AUTH_TOKEN="your-key"
$env:ANTHROPIC_MODEL="claude-opus-5-5"
$env:CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="1"
cd your-project
claude
```

```bash [macOS / Linux]
export ANTHROPIC_BASE_URL="https://api.weigeai.com"
export ANTHROPIC_AUTH_TOKEN="your-key"
export ANTHROPIC_MODEL="claude-opus-5-5"
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
cd your-project
claude
```

:::

**永久设置**（新开的终端也生效）：

::: code-group

```powershell [Windows PowerShell]
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "https://api.weigeai.com", [System.EnvironmentVariableTarget]::User)
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", "your-key", [System.EnvironmentVariableTarget]::User)
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_MODEL", "claude-opus-5-5", [System.EnvironmentVariableTarget]::User)
[System.Environment]::SetEnvironmentVariable("CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC", "1", [System.EnvironmentVariableTarget]::User)
```

```bash [Linux (bash)]
echo 'export ANTHROPIC_BASE_URL="https://api.weigeai.com"' >> ~/.bashrc
echo 'export ANTHROPIC_AUTH_TOKEN="your-key"' >> ~/.bashrc
echo 'export ANTHROPIC_MODEL="claude-opus-5-5"' >> ~/.bashrc
echo 'export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1' >> ~/.bashrc

source ~/.bashrc
```

```zsh [macOS (zsh)]
echo 'export ANTHROPIC_BASE_URL="https://api.weigeai.com"' >> ~/.zshrc
echo 'export ANTHROPIC_AUTH_TOKEN="your-key"' >> ~/.zshrc
echo 'export ANTHROPIC_MODEL="claude-opus-5-5"' >> ~/.zshrc
echo 'export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1' >> ~/.zshrc

source ~/.zshrc
```

:::

::: tip 替换密钥
请将命令中的 `your-key` 替换为在 [控制台](https://api.weigeai.com/) 复制的 API 密钥。
:::

::::

## 开始使用

进入项目目录后运行：

```bash
claude
```

启动后，Claude Code 会分析当前目录的代码，并提供编程辅助。更多使用说明请参考 [Anthropic 官方文档](https://platform.claude.com/docs/zh-CN/intro)。
