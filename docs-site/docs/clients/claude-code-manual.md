# Claude Code 手工配置

适合希望手动管理环境变量或配置文件、无需安装额外工具或一键脚本的开发者。

::: tip 其他配置方式
- **方式1（推荐工具）**：使用 [CC Switch](/clients/cc-switch) 或 [Magpie](/clients/magpie) 可视化托管配置并支持一键切换模型。
- **方式2（脚本一键配置）**：运行 [Claude Code 一键脚本](/user-guide/claude-code) 自动检测 Node.js 并写入永久环境变量。
:::

## 方式一：环境变量配置（macOS / Linux）

将以下内容添加到 `~/.zshrc` 或 `~/.bashrc` 中，然后执行 `source ~/.zshrc`：

```bash
export ANTHROPIC_BASE_URL="https://api.weigeai.com"
export ANTHROPIC_AUTH_TOKEN="sk-your-api-key"
```

## 方式二：配置文件（`~/.claude/settings.json`）

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.weigeai.com",
    "ANTHROPIC_AUTH_TOKEN": "sk-your-api-key"
  }
}
```

## 启动使用

配置完成后在项目目录运行 `claude` 即可开始对话：

```bash
claude
```
