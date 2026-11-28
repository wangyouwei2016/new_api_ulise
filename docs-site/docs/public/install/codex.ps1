$ErrorActionPreference = "Stop"

# 通过 `irm ... | iex` 运行时，npm / codex 的 .ps1 启动器会被系统执行策略拦下
# （报错：无法加载文件 ...\npm.ps1，因为在此系统上禁止运行脚本）。
# 这里只放宽当前进程，不改动用户级或机器级策略；被组策略锁定时下面还有 .cmd 兜底。
try {
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force -ErrorAction Stop
} catch {
  # 忽略，后续统一用 .cmd 启动器
}

$CodexBaseUrl = "https://api.weigeai.com/v1"
$CodexPackage = "@openai/codex"
$MinNodeMajor = 22

$CodexHome = Join-Path $HOME ".codex"
$ConfigFile = Join-Path $CodexHome "config.toml"

# 粘贴密钥时常见的多余字符：首尾空白、直角引号、中文全角引号
$KeyTrimChars = [char[]]@(
  ' ', "`t", "`r", "`n",
  '"', "'", '`',
  [char]0x201C, [char]0x201D, [char]0x2018, [char]0x2019,
  [char]0xFF02, [char]0xFF07, [char]0x3000
)

function Say([string]$Message) {
  Write-Host $Message
}

function Confirm-Yes([string]$Prompt, [bool]$DefaultYes = $false) {
  $suffix = if ($DefaultYes) { "[Y/n]" } else { "[y/N]" }
  $answer = Read-Host "$Prompt $suffix"
  if ([string]::IsNullOrWhiteSpace($answer)) {
    return $DefaultYes
  }
  return @("y", "yes") -contains $answer.Trim().ToLowerInvariant()
}

function Wait-ForSuccessAck {
  if ([Environment]::UserInteractive -and -not [Console]::IsInputRedirected) {
    [void](Read-Host "配置完成，按回车键关闭此窗口...")
  }
}

# 反复剥掉首尾的空白与成对引号，避免把 "sk-xxx" 或 “sk-xxx” 原样写进 config.toml
function Get-CleanApiKey([string]$Value) {
  if ($null -eq $Value) {
    return ""
  }
  $key = $Value
  while ($true) {
    $trimmed = $key.Trim($KeyTrimChars)
    if ($trimmed -eq $key) {
      break
    }
    $key = $trimmed
  }
  return $key
}

function Assert-ApiKey([string]$Key) {
  if ([string]::IsNullOrWhiteSpace($Key)) {
    throw "API Key 不能为空。"
  }
  if ($Key -notmatch '^[A-Za-z0-9._\-]+$') {
    $bad = (($Key.ToCharArray() | Where-Object { "$_" -notmatch '[A-Za-z0-9._\-]' } | Select-Object -Unique) -join ' ')
    throw "API Key 含有非法字符（$bad）。请到控制台重新复制，注意不要把引号、空格或中文标点一起粘进来。"
  }
}

# npm / codex 在 Windows 上同时提供 .cmd 与 .ps1 两种启动器，
# .ps1 会受执行策略限制，这里优先返回可执行文件（.cmd / .exe）。
function Resolve-CliCommand([string]$Name) {
  foreach ($candidate in @("$Name.cmd", "$Name.exe", "$Name.bat")) {
    $command = Get-Command $candidate -ErrorAction SilentlyContinue
    if ($command -and $command.Source) {
      return $command.Source
    }
  }

  $fallback = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $fallback) {
    return $null
  }
  if ($fallback.Source -and $fallback.Source.ToLowerInvariant().EndsWith(".ps1")) {
    $cmdPath = [System.IO.Path]::ChangeExtension($fallback.Source, ".cmd")
    if (Test-Path $cmdPath) {
      return $cmdPath
    }
  }
  return $fallback.Source
}

function Get-NodeMajor {
  $nodePath = Resolve-CliCommand "node"
  if (-not $nodePath) {
    return $null
  }
  $version = (& $nodePath -v 2>$null)
  if ($version -match '^v?(\d+)\.') {
    return [int]$Matches[1]
  }
  return $null
}

# 只把注册表里的机器级 / 用户级 PATH 追加进来，不要整体替换：
# 直接覆盖会丢掉 fnm / volta 等工具在当前进程注入的路径，
# 刚装好的 codex 反而会变成"未找到"。
function Refresh-EnvPath {
  $parts = @()
  $seen = @{}
  $groups = @(
    $env:Path,
    [System.Environment]::GetEnvironmentVariable("Path", "Machine"),
    [System.Environment]::GetEnvironmentVariable("Path", "User")
  )
  foreach ($group in $groups) {
    if ([string]::IsNullOrWhiteSpace($group)) {
      continue
    }
    foreach ($item in ($group -split ";")) {
      $entry = $item.Trim()
      if ([string]::IsNullOrWhiteSpace($entry)) {
        continue
      }
      $key = $entry.TrimEnd("\").ToLowerInvariant()
      if (-not $seen.ContainsKey($key)) {
        $seen[$key] = $true
        $parts += $entry
      }
    }
  }
  $env:Path = ($parts -join ";")
}

function Ensure-Node {
  $major = Get-NodeMajor
  if ($null -ne $major -and $major -ge $MinNodeMajor) {
    $nodePath = Resolve-CliCommand "node"
    Say "Node.js 已满足要求：$(& $nodePath -v)"
    return
  }

  if ($null -eq $major) {
    Say "未检测到 Node.js。"
  } else {
    $nodePath = Resolve-CliCommand "node"
    Say "当前 Node.js 版本 $(& $nodePath -v) 低于 v$MinNodeMajor。"
  }

  if (-not (Confirm-Yes "是否使用 winget 安装稳定版 Node.js LTS？" $true)) {
    throw "Codex CLI 需要 Node.js $MinNodeMajor+。请先安装后重新运行本脚本。"
  }

  $winget = Resolve-CliCommand "winget"
  if (-not $winget) {
    throw "未找到 winget，请手动安装 Node.js $MinNodeMajor+ 后重新运行本脚本。"
  }

  & $winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  Refresh-EnvPath

  $major = Get-NodeMajor
  if ($null -eq $major -or $major -lt $MinNodeMajor) {
    throw "安装后仍未检测到符合要求的 Node.js，请重开 PowerShell 后重新运行本脚本。"
  }
}

function Backup-IfExists([string]$Path) {
  if (Test-Path $Path) {
    $stamp = Get-Date -Format "yyyyMMddHHmmss"
    $backup = "$Path.bak.$stamp"
    Copy-Item $Path $backup
    Say "已备份现有文件：$backup"
    return $true
  }
  return $false
}

function Write-CodexConfig([string]$ApiKey) {
  Assert-ApiKey $ApiKey
  if (-not (Test-Path $CodexHome)) {
    New-Item -ItemType Directory -Path $CodexHome -Force | Out-Null
  }
  $hadConfig = Backup-IfExists $ConfigFile
  $content = @'
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
experimental_bearer_token = "__API_KEY__"
http_headers = { "x-openai-actor-authorization" = "api.weigeai.com" }

[desktop]
conversationDetailMode = "STEPS_COMMANDS"

[sandbox_workspace_write]
network_access = true

[features]
goals = true
'@
  # 仅替换已校验的密钥，不执行或二次解释用户输入。
  $content = $content.Replace('__API_KEY__', $ApiKey)
  # PowerShell 5.1 也必须写 UTF-8 无 BOM，避免 TOML 解析失败。
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($ConfigFile, $content, $utf8NoBom)
  return $hadConfig
}

function Install-CodexCli {
  $codexPath = Resolve-CliCommand "codex"
  if ($codexPath) {
    Say "Codex CLI 已安装：$codexPath"
    return
  }

  Say "未检测到 Codex CLI。"
  if (-not (Confirm-Yes "是否使用 npm 安装 Codex CLI？" $true)) {
    Say "已跳过安装。稍后可手动执行：npm install -g $CodexPackage"
    return
  }

  Ensure-Node
  $npmPath = Resolve-CliCommand "npm"
  if (-not $npmPath) {
    throw "未找到 npm，请先安装 Node.js，再执行：npm install -g $CodexPackage"
  }

  Say "正在安装 $CodexPackage ..."
  & $npmPath install -g $CodexPackage
  if ($LASTEXITCODE -ne 0) {
    throw "npm 安装失败（退出码 $LASTEXITCODE）。可手动执行：npm.cmd install -g $CodexPackage"
  }
  Refresh-EnvPath
}

Say "维格智创Token站 Codex 交互式配置"
Say ""
Say "接口地址：$CodexBaseUrl"
Say "脚本会将密钥和设置写入 $ConfigFile。"
Say ""

Say "请选择要在哪个 Codex 客户端中使用："
Say "1) Codex 桌面版 App（只写配置文件，不安装 Node.js / CLI）"
Say "2) Codex CLI（同时对 App 生效，会检测并按需安装 Node.js 与 Codex CLI）"
Say "直接回车：默认 1（Codex 桌面版 App）"
$UsageTarget = Read-Host "请输入序号 [直接回车=1]"
if ([string]::IsNullOrWhiteSpace($UsageTarget)) {
  $UsageTarget = "1"
} else {
  $UsageTarget = $UsageTarget.Trim()
}
if (@("1", "2") -notcontains $UsageTarget) {
  throw "无效选择：$UsageTarget"
}
Say ""

$ApiKey = Get-CleanApiKey (Read-Host "请输入 维格智创Token站 的 API 密钥")
Assert-ApiKey $ApiKey

$HadConfig = Write-CodexConfig -ApiKey $ApiKey

Say ""
Say "Codex 配置已写入："
Say "  - $ConfigFile"
if ($HadConfig) {
  Say "注意：config.toml 是整体覆盖写入的，原有的 MCP server / profile 等自定义配置请从上面的 .bak 备份里手动合并。"
}

if ($UsageTarget -eq "1") {
  Say ""
  Say "配置已写入，现在彻底退出 Codex App，并重新启动 Codex App 即可生效！"
  Say "以后需要用 Codex CLI 时，重新运行本脚本并选择 2 即可。"
  Wait-ForSuccessAck
  exit 0
}

Install-CodexCli

$CodexPath = Resolve-CliCommand "codex"
if (Confirm-Yes "是否立即启动 Codex？" $false) {
  if ($CodexPath) {
    & $CodexPath
  } else {
    Say "未找到 codex 命令，请重开 PowerShell 后手动运行：codex"
  }
} else {
  Say "已跳过启动。请重开 PowerShell 后运行：codex"
}

Say "现在 Codex CLI 和 App 均已生效！"
Wait-ForSuccessAck
