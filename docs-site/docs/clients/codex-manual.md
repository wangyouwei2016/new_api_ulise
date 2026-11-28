# Codex CLI 手工配置

适合需要手动控制 `~/.codex/config.toml` 与 `~/.codex/auth.json` 的开发者。

::: tip 其他配置方式
- **方式1（推荐工具）**：使用 [CC Switch](/clients/cc-switch) 或 [Magpie](/clients/magpie) 可视化管理配置。
- **方式2（脚本一键配置）**：运行 [Codex 一键脚本](/user-guide/codex) 自动完成环境检测与 `config.toml` 写入。
:::

## 1. 安装 Codex CLI

```bash
npm install -g @openai/codex
```

## 2. 编辑 `~/.codex/config.toml`

```toml
model_provider = "weigeai"
model = "gpt-5"

[model_providers.weigeai]
name = "维格智创Token站"
base_url = "https://api.weigeai.com/v1"
wire_api = "responses"
requires_openai_auth = true
```

## 3. 编辑 `~/.codex/auth.json` 填入密钥

```json
{
  "OPENAI_API_KEY": "sk-your-api-key"
}
```

## 4. 启动使用

进入项目目录后运行：

```bash
codex
```
