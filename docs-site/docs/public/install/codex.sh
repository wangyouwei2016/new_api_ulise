#!/usr/bin/env bash
set -euo pipefail

CODEX_BASE_URL="https://api.weigeai.com/v1"
CODEX_PKG="@openai/codex"
MIN_NODE_MAJOR=22
INSTALL_NODE_VERSION="lts/*"
NVM_INSTALL_URL="https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh"
# 同时识别迁移前后的初始化标记，避免重复追加已有的 Node 环境配置。
ENV_BLOCK_MARKER="^# >>> weigeai codex env >>>$"
TARGET_USER="${SUDO_USER:-$(id -un)}"
TARGET_HOME="$HOME"
TARGET_SHELL="${SHELL:-/bin/bash}"

if [ -n "${SUDO_USER:-}" ] && [ "$SUDO_USER" != "root" ]; then
  if command -v getent >/dev/null 2>&1; then
    TARGET_HOME="$(getent passwd "$TARGET_USER" | cut -d: -f6)"
    TARGET_SHELL="$(getent passwd "$TARGET_USER" | cut -d: -f7)"
  else
    TARGET_HOME="$(eval "printf '%s' ~$TARGET_USER")"
  fi
fi

[ -n "$TARGET_HOME" ] || TARGET_HOME="$HOME"
[ -n "$TARGET_SHELL" ] || TARGET_SHELL="/bin/bash"

CODEX_HOME="$TARGET_HOME/.codex"
CONFIG_FILE="$CODEX_HOME/config.toml"

# 通过 `curl ... | bash` 运行时，fd0 是脚本自身的源码。
# 这里必须拿到真正的终端，绝不能退回 fd0，否则 read 会把脚本正文当成密钥读走，
# 把带引号的代码行写进 config.toml。
if [ ! -r /dev/tty ] || ! { exec 3</dev/tty; } 2>/dev/null; then
  printf '%s\n' "无法打开交互终端（/dev/tty），本脚本需要交互输入。" >&2
  printf '%s\n' "请改用：curl -fsSL https://api.weigeai.com/install/codex.sh -o codex.sh && bash codex.sh" >&2
  exit 1
fi

say() {
  printf '%s\n' "$*"
}

target_group() {
  id -gn "$TARGET_USER" 2>/dev/null || printf '%s' "$TARGET_USER"
}

fix_target_ownership() {
  if [ "$(id -u)" -eq 0 ] && [ "$TARGET_USER" != "root" ]; then
    chown -R "$TARGET_USER:$(target_group)" "$@" 2>/dev/null || true
  fi
  return 0
}

# 以 root 身份操作过目标用户的 nvm / npm 目录后，必须把属主改回去，
# 否则用户下次开终端时 nvm 加载失败，node 与 codex 都会从 PATH 里消失。
# 只针对 node/npm 相关的具体目录，别整个 chown ~/.cache 或 ~/.config：
# 那些目录在开发机上动辄几个 GB，递归改属主会卡住很久，且与本脚本无关。
fix_node_env_ownership() {
  [ "$(id -u)" -eq 0 ] || return 0
  [ "$TARGET_USER" != "root" ] || return 0
  local dir
  for dir in \
    "$TARGET_HOME/.nvm" \
    "$TARGET_HOME/.npm" \
    "$TARGET_HOME/.npm-global" \
    "$TARGET_HOME/.local/bin" \
    "$TARGET_HOME/.local/lib/node_modules" \
    "$TARGET_HOME/.local/share/fnm" \
    "$TARGET_HOME/.cache/npm" \
    "$TARGET_HOME/.config/npm" \
    "$TARGET_HOME/.npmrc"
  do
    if [ -e "$dir" ]; then
      fix_target_ownership "$dir"
    fi
  done
  return 0
}

shell_quote() {
  printf "'%s'" "$(printf '%s' "$1" | sed "s/'/'\\\\''/g")"
}

run_target_bash() {
  local script="$1"
  if [ "$(id -u)" -eq 0 ] && [ "$TARGET_USER" != "root" ] && command -v sudo >/dev/null 2>&1; then
    sudo -H -u "$TARGET_USER" env HOME="$TARGET_HOME" bash -lc "$script"
  else
    HOME="$TARGET_HOME" bash -lc "$script"
  fi
}

target_env_args() {
  printf 'HOME=%s\0' "$TARGET_HOME"
}

target_login_shell_path() {
  if [ "$(id -u)" -eq 0 ] && [ "$TARGET_USER" != "root" ] && command -v sudo >/dev/null 2>&1; then
    sudo -H -u "$TARGET_USER" env HOME="$TARGET_HOME" "$TARGET_SHELL" -lc 'printf "%s" "$PATH"' 2>/dev/null || true
    return
  fi
  HOME="$TARGET_HOME" "$TARGET_SHELL" -lc 'printf "%s" "$PATH"' 2>/dev/null || true
}

prepend_path() {
  local dir="$1"
  [ -n "$dir" ] || return 0
  case ":$PATH:" in
    *":$dir:"*) ;;
    *) PATH="$dir:$PATH" ;;
  esac
  return 0
}

load_target_user_path() {
  local login_path npm_prefix
  login_path="$(target_login_shell_path || true)"
  if [ -n "$login_path" ]; then
    PATH="$login_path:$PATH"
  fi

  prepend_path "$TARGET_HOME/.local/bin"
  prepend_path "$TARGET_HOME/.n/bin"
  prepend_path "$TARGET_HOME/.npm-global/bin"
  prepend_path "$TARGET_HOME/.yarn/bin"
  prepend_path "$TARGET_HOME/.config/yarn/global/node_modules/.bin"

  if command -v npm >/dev/null 2>&1; then
    npm_prefix="$(npm config get prefix 2>/dev/null || true)"
    if [ -n "$npm_prefix" ] && [ "$npm_prefix" != "undefined" ]; then
      prepend_path "$npm_prefix/bin"
    fi
  fi
  export PATH
}

target_path_bootstrap() {
  printf '%s' 'export PATH="$HOME/.local/bin:$HOME/.n/bin:$HOME/.npm-global/bin:$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"; export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"; command -v nvm >/dev/null 2>&1 && nvm use --silent default >/dev/null 2>&1 || true; if command -v npm >/dev/null 2>&1; then npm_prefix="$(npm config get prefix 2>/dev/null || true)"; [ -n "$npm_prefix" ] && [ "$npm_prefix" != "undefined" ] && export PATH="$npm_prefix/bin:$PATH"; fi'
}

# 交互式启动子命令时单独把 /dev/tty 接到它的 stdin，
# 不要用 exec 替换本脚本的 fd0（curl | bash 模式下那是脚本源码）。
run_target_command() {
  local command_name="$1"
  if [ "$(id -u)" -eq 0 ] && [ "$TARGET_USER" != "root" ] && command -v sudo >/dev/null 2>&1; then
    local env_args=()
    while IFS= read -r -d '' item; do
      env_args+=("$item")
    done < <(target_env_args)
    sudo -H -u "$TARGET_USER" env "${env_args[@]}" bash -lc "$(target_path_bootstrap); $(shell_quote "$command_name")" </dev/tty
    return
  fi

  load_target_node_env
  if command -v "$command_name" >/dev/null 2>&1; then
    "$command_name" </dev/tty
    return
  fi
  return 1
}

wait_for_success_ack() {
  [ -t 3 ] || return 0
  local ignored
  read -r -u 3 -p "配置完成，按回车键关闭此窗口..." ignored || true
  return 0
}

read_input() {
  local var_name="$1"
  local prompt="$2"
  read -r -u 3 -p "$prompt" "$var_name"
}

confirm_yes() {
  local prompt="$1"
  local default_yes="${2:-no}"
  local answer
  read_input answer "$prompt"
  if [ -z "$answer" ]; then
    [ "$default_yes" = "yes" ]
    return
  fi
  case "$answer" in
    y|Y|yes|YES|Yes) return 0 ;;
    *) return 1 ;;
  esac
}

# 反复剥掉首尾空白与成对引号（含中文全角引号），
# 避免把 "sk-xxx" / “sk-xxx” 这类粘贴结果原样写进 config.toml。
sanitize_api_key() {
  local value="$1"
  local before
  value="${value//$'\r'/}"
  value="${value//$'\n'/}"
  value="${value//$'\t'/}"
  while :; do
    before="$value"
    value="${value#"${value%%[![:space:]]*}"}"
    value="${value%"${value##*[![:space:]]}"}"
    value="${value#\"}"; value="${value%\"}"
    value="${value#\'}"; value="${value%\'}"
    value="${value#\`}"; value="${value%\`}"
    value="${value#“}"; value="${value%”}"
    value="${value#”}"; value="${value%“}"
    value="${value#‘}"; value="${value%’}"
    value="${value#’}"; value="${value%‘}"
    value="${value#＂}"; value="${value%＂}"
    value="${value#＇}"; value="${value%＇}"
    value="${value#　}"; value="${value%　}"
    [ "$value" = "$before" ] && break
  done
  printf '%s' "$value"
}

assert_api_key() {
  local key="$1"
  if [ -z "$key" ]; then
    say "API Key 不能为空。"
    exit 1
  fi
  case "$key" in
    *[!A-Za-z0-9._-]*)
      say "API Key 含有非法字符，请到控制台重新复制。"
      say "常见原因：把引号、空格或中文标点一起粘贴进来了。"
      exit 1
      ;;
  esac
  return 0
}

# 新开终端时可能被读到的初始化文件；块内自带幂等判断，写多份不会互相干扰
rc_targets() {
  local shell_name="${TARGET_SHELL##*/}"
  printf '%s\n' "$TARGET_HOME/.profile"
  printf '%s\n' "$TARGET_HOME/.bashrc"
  if [ -f "$TARGET_HOME/.bash_profile" ]; then
    printf '%s\n' "$TARGET_HOME/.bash_profile"
  fi
  if [ "$shell_name" = "zsh" ] || [ -f "$TARGET_HOME/.zshrc" ]; then
    printf '%s\n' "$TARGET_HOME/.zshrc"
  fi
}

env_init_block() {
  cat <<'EOF'

# >>> weigeai codex env >>>
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" >/dev/null 2>&1
[ -s "$NVM_DIR/nvm.sh" ] && nvm use --silent default >/dev/null 2>&1
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" >/dev/null 2>&1
for __weigeai_bin in "$HOME/.local/bin" "$HOME/.npm-global/bin" "$HOME/.n/bin"; do
  case ":$PATH:" in
    *":$__weigeai_bin:"*) ;;
    *) [ -d "$__weigeai_bin" ] && PATH="$__weigeai_bin:$PATH" ;;
  esac
done
unset __weigeai_bin
export PATH
# <<< weigeai codex env <<<
EOF
}

ensure_env_init_in_rc() {
  local rc_file
  while IFS= read -r rc_file; do
    [ -n "$rc_file" ] || continue
    if [ ! -e "$rc_file" ]; then
      : > "$rc_file" 2>/dev/null || continue
    fi
    if grep -qE "$ENV_BLOCK_MARKER" "$rc_file" 2>/dev/null; then
      continue
    fi
    env_init_block >> "$rc_file"
    fix_target_ownership "$rc_file"
    say "已更新 shell 初始化文件：$rc_file"
  done <<EOF
$(rc_targets)
EOF
  return 0
}

load_target_node_env() {
  load_target_user_path
  export NVM_DIR="$TARGET_HOME/.nvm"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck disable=SC1091
    . "$NVM_DIR/nvm.sh"
    command -v nvm >/dev/null 2>&1 && nvm use --silent default >/dev/null 2>&1 || true
  fi
  load_target_user_path
}

current_node_version() {
  load_target_node_env
  if command -v node >/dev/null 2>&1; then
    node -v 2>/dev/null
    return
  fi
  if [ "$(id -u)" -eq 0 ] && [ "$TARGET_USER" != "root" ]; then
    run_target_bash "$(target_path_bootstrap); command -v node >/dev/null 2>&1 && node -v" 2>/dev/null || true
  fi
}

current_node_major() {
  local version
  version="$(current_node_version || true)"
  if [ -n "$version" ]; then
    printf '%s\n' "$version" | sed 's/^v//' | cut -d. -f1
  fi
}

ensure_nvm_loaded() {
  export NVM_DIR="$TARGET_HOME/.nvm"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck disable=SC1091
    . "$NVM_DIR/nvm.sh"
    command -v nvm >/dev/null 2>&1 && nvm use --silent default >/dev/null 2>&1 || true
  fi
}

auto_install_node_via_nvm() {
  if ! command -v curl >/dev/null 2>&1; then
    say "未找到 curl，无法自动安装 nvm。请先安装 Node.js $MIN_NODE_MAJOR+ 后重试。"
    exit 1
  fi

  if [ "$(id -u)" -eq 0 ] && [ "$TARGET_USER" != "root" ]; then
    say "正在为 $TARGET_USER 安装 nvm..."
    run_target_bash "set -e; export NVM_DIR=\"\$HOME/.nvm\"; if [ ! -s \"\$NVM_DIR/nvm.sh\" ]; then curl -fsSL $(shell_quote "$NVM_INSTALL_URL") | bash; fi; . \"\$NVM_DIR/nvm.sh\"; nvm install $(shell_quote "$INSTALL_NODE_VERSION"); nvm alias default $(shell_quote "$INSTALL_NODE_VERSION"); nvm use default"
    ensure_nvm_loaded
    fix_node_env_ownership
    ensure_env_init_in_rc
    return
  fi

  export NVM_DIR="$TARGET_HOME/.nvm"
  if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    say "正在安装 nvm..."
    curl -fsSL "$NVM_INSTALL_URL" | bash
  fi
  ensure_nvm_loaded
  if ! command -v nvm >/dev/null 2>&1; then
    say "nvm 加载失败，请重开终端后重试，或手动安装 Node.js $MIN_NODE_MAJOR+。"
    exit 1
  fi

  say "正在安装稳定版 Node.js LTS..."
  nvm install "$INSTALL_NODE_VERSION"
  nvm alias default "$INSTALL_NODE_VERSION"
  nvm use default
  fix_node_env_ownership
  ensure_env_init_in_rc
}

ensure_node() {
  local major
  local version
  major="$(current_node_major || true)"
  if [ -n "$major" ] && [ "$major" -ge "$MIN_NODE_MAJOR" ]; then
    version="$(current_node_version || true)"
    say "Node.js 已满足要求：$version"
    return
  fi

  if [ -z "$major" ]; then
    say "未检测到 Node.js。"
  else
    version="$(current_node_version || true)"
    say "当前 Node.js 版本 $version 低于 v${MIN_NODE_MAJOR}。"
  fi

  if confirm_yes "是否自动通过 nvm 安装稳定版 Node.js LTS？[Y/n]: " "yes"; then
    auto_install_node_via_nvm
  else
    say "Codex CLI 需要 Node.js $MIN_NODE_MAJOR+。请先安装后重新运行本脚本。"
    exit 1
  fi
}

npm_install_global() {
  local package_name="$1"
  load_target_node_env
  local npm_path
  npm_path="$(command -v npm 2>/dev/null || true)"
  if [ -z "$npm_path" ]; then
    say "未找到 npm，请先安装 Node.js，再执行：npm install -g $package_name"
    exit 1
  fi
  if [ "$(id -u)" -eq 0 ] && [ "$TARGET_USER" != "root" ] && case "$npm_path" in "$TARGET_HOME"/*) true ;; *) false ;; esac; then
    run_target_bash "$(target_path_bootstrap); npm install -g $(shell_quote "$package_name")"
  else
    npm install -g "$package_name"
  fi
  fix_node_env_ownership
}

target_command_info() {
  local command_name="$1"
  load_target_node_env
  if command -v "$command_name" >/dev/null 2>&1; then
    "$command_name" --version 2>/dev/null || command -v "$command_name"
    return
  fi
  if [ "$(id -u)" -eq 0 ] && [ "$TARGET_USER" != "root" ]; then
    run_target_bash "$(target_path_bootstrap); if command -v $(shell_quote "$command_name") >/dev/null 2>&1; then $(shell_quote "$command_name") --version 2>/dev/null || command -v $(shell_quote "$command_name"); fi" 2>/dev/null || true
  fi
}

target_command_path() {
  local command_name="$1"
  load_target_node_env
  if command -v "$command_name" >/dev/null 2>&1; then
    command -v "$command_name"
    return
  fi
  if [ "$(id -u)" -eq 0 ] && [ "$TARGET_USER" != "root" ]; then
    run_target_bash "$(target_path_bootstrap); command -v $(shell_quote "$command_name") 2>/dev/null" 2>/dev/null || true
  fi
}

# 模拟"新开一个终端"：走目标用户的登录 shell，验证 codex 是否真的持久生效
codex_path_in_login_shell() {
  if [ "$(id -u)" -eq 0 ] && [ "$TARGET_USER" != "root" ] && command -v sudo >/dev/null 2>&1; then
    sudo -H -u "$TARGET_USER" env HOME="$TARGET_HOME" "$TARGET_SHELL" -lc 'command -v codex' 2>/dev/null || true
    return
  fi
  HOME="$TARGET_HOME" "$TARGET_SHELL" -lc 'command -v codex' 2>/dev/null || true
}

verify_codex_persisted() {
  local resolved actual
  resolved="$(codex_path_in_login_shell)"
  if [ -n "$resolved" ]; then
    say "已确认新终端可直接运行 codex：$resolved"
    return 0
  fi

  actual="$(target_command_path codex || true)"
  say ""
  say "⚠️  当前登录 shell 里还找不到 codex，新开终端可能提示 command not found。"
  if [ -n "$actual" ]; then
    say "codex 实际安装位置：$actual"
  fi
  say "请重开终端；若仍不生效，执行下面任意一条后重试："
  say "  source $TARGET_HOME/.bashrc"
  say "  source $TARGET_HOME/.profile"
  return 0
}

ensure_codex() {
  local installed
  installed="$(target_command_info codex || true)"
  if [ -n "$installed" ]; then
    say "Codex CLI 已安装：$installed"
    ensure_env_init_in_rc
    return
  fi

  say "当前 Node.js 环境未检测到 Codex CLI。"
  if ! confirm_yes "是否使用 npm 安装 Codex CLI？[Y/n]: " "yes"; then
    say "已跳过安装。请先安装 Codex 后再运行：codex"
    return
  fi

  ensure_node
  npm_install_global "$CODEX_PKG"
  ensure_env_init_in_rc
}

backup_if_exists() {
  local file="$1"
  if [ -f "$file" ]; then
    local stamp
    stamp="$(date +%Y%m%d%H%M%S)"
    cp "$file" "$file.bak.$stamp"
    chmod 600 "$file.bak.$stamp"
    fix_target_ownership "$file.bak.$stamp"
    say "已备份现有文件：$file.bak.$stamp"
    return 0
  fi
  return 1
}

write_config() {
  local api_key="$1"
  assert_api_key "$api_key"
  mkdir -p "$CODEX_HOME"
  fix_target_ownership "$CODEX_HOME"
  CONFIG_EXISTED=0
  if backup_if_exists "$CONFIG_FILE"; then
    CONFIG_EXISTED=1
  fi
  # 文件现在包含密钥：创建及覆盖时均限制为当前用户读写。
  (
    umask 077
    : > "$CONFIG_FILE"
    chmod 600 "$CONFIG_FILE"
    cat > "$CONFIG_FILE" <<EOF
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
experimental_bearer_token = "$api_key"
http_headers = { "x-openai-actor-authorization" = "api.weigeai.com" }

[desktop]
conversationDetailMode = "STEPS_COMMANDS"

[sandbox_workspace_write]
network_access = true

[features]
goals = true
EOF
  )
  fix_target_ownership "$CONFIG_FILE"
}

main() {
  say "维格智创Token站 Codex 交互式配置"
  say ""
  say "接口地址：$CODEX_BASE_URL"
  say "脚本会将密钥和设置写入 ${CONFIG_FILE}。"
  say ""

  say "请选择要在哪个 Codex 客户端中使用："
  say "1) Codex 桌面版 App（只写配置文件，不安装 Node.js / CLI）"
  say "2) Codex CLI（同时对 App 生效，会检测并按需安装 Node.js 与 Codex CLI）"
  say "直接回车：默认 1（Codex 桌面版 App）"
  local usage_target
  read_input usage_target "请输入序号 [直接回车=1]: "
  case "$usage_target" in
    ""|1) usage_target=1 ;;
    2) usage_target=2 ;;
    *)
      say "无效选择：$usage_target"
      exit 1
      ;;
  esac
  say ""

  local raw_key api_key
  read_input raw_key "请输入 维格智创Token站 的 API 密钥: "
  api_key="$(sanitize_api_key "$raw_key")"
  assert_api_key "$api_key"

  write_config "$api_key"

  say ""
  say "Codex 配置已写入："
  say "  - $CONFIG_FILE"
  if [ "${CONFIG_EXISTED:-0}" -eq 1 ]; then
    say "注意：config.toml 是整体覆盖写入的，原有的 MCP server / profile 等自定义配置请从上面的 .bak 备份里手动合并。"
  fi

  if [ "$usage_target" -eq 1 ]; then
    say ""
    say "配置已写入，现在彻底退出 Codex App，并重新启动 Codex App 即可生效！"
    say "以后需要用 Codex CLI 时，重新运行本脚本并选择 2 即可。"
    wait_for_success_ack
    return
  fi

  ensure_codex
  verify_codex_persisted

  if confirm_yes "是否立即启动 Codex？[y/N]: "; then
    run_target_command codex || true
  else
    say "已跳过启动。请重开终端后运行：codex"
  fi
  say "现在 Codex CLI 和 App 均已生效！"
  wait_for_success_ack
}

main "$@"
