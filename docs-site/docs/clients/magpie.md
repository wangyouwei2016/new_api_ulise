# Magpie 配置

::: tip 推荐使用
[Magpie](https://usemagpie.ai/docs/zh/start) 是一款面向多 Agent 的统一模型管理与本机网关工具（默认监听 `http://127.0.0.1:3425`），内置 OpenAI、Anthropic 与 Gemini 三协议互通转换。添加一次 **维格智创Token站** 后，即可在 Claude Code、Codex、Gemini CLI、OpenCode、Cursor CLI 等 20+ 种工具中自由切换任意模型，无需手动修改各客户端配置文件。
:::

## 第一步：安装 Magpie

- **macOS / Linux（一键脚本）**：

```bash
curl -fsSL https://usemagpie.ai/install.sh | sh
```

如因网络原因无法直连，可通过 `--proxy` 指定代理：

```bash
curl -fsSL https://usemagpie.ai/install.sh | sh -s -- --proxy http://127.0.0.1:7890
```

- **Windows / 桌面安装包**：前往 [usemagpie.ai](https://usemagpie.ai/) 下载对应系统安装包。

## 第二步：添加「维格智创Token站」为自定义供应商

### 方式一：图形界面配置（推荐）

1. 打开 Magpie，切换到 **供应商** 标签页，点击 **＋ 添加供应商**。
2. 选择 **自定义 · 任意兼容的 URL**，按以下参数填写并保存：

| 配置项 | 填写值 | 说明 |
| --- | --- | --- |
| 名称 | `维格智创Token站` | 自定义显示名称 |
| OpenAI 兼容地址 | `https://api.weigeai.com/v1` | 需以 `/v1` 结尾 |
| Anthropic 兼容地址 | `https://api.weigeai.com` | 根地址，不要带 `/v1` |
| API Key | `sk-your-api-key` | 控制台创建的令牌密钥 |

3. 保存后 Magpie 会自动拉取可用模型列表；展开该供应商可勾选要暴露给 Agent 的模型，或点击 **测试** 验证连通性。

### 方式二：命令行快速添加（CLI）

```bash
magpie provider add weigeai \
  url=https://api.weigeai.com/v1 \
  responses=https://api.weigeai.com/v1 \
  anthropic=https://api.weigeai.com \
  key=sk-your-api-key \
  name="维格智创Token站"
```

## 第三步：给每个 Agent 选择模型

1. 切换到 **Agent** 标签页，Magpie 会自动识别本机已安装的 Claude Code、Codex、Gemini CLI、OpenCode 等工具。
2. 点击目标 Agent 对应的模型下拉框，选择 `weigeai/<模型ID>`（也可直接输入模型名称）。
3. Magpie 会自动把本机网关配置写入对应 Agent 的配置文件；**新开一个会话**即可生效（Codex 切换后请重启应用和已有会话）。
4. 如需将某个 Agent 恢复原样，在下拉列表选回 Agent 自带模型，或运行 `magpie <agent> default` 即可一键还原。

::: info 使用与排错小贴士
- **保持网关运行**：通过 Magpie 路由的模型需要保持 Magpie 运行（关闭窗口会常驻托盘，或运行 `magpie daemon install` 安装为开机后台服务）。
- **不改动原 Claude Code 配置**：若只想临时经由 Magpie 使用 Claude Code，可使用 `claude-magpie` 或 `magpie claude run` 启动单次会话。
- **开代理软件后 Agent 报 502 / 连不上**：若使用 Surge、Clash 或 mihomo（系统代理 / TUN / 增强模式），请在代理规则最前面添加本地直连规则，防止发往 `127.0.0.1:3425` 的流量被拦截：
  - `IP-CIDR,127.0.0.0/8,DIRECT,no-resolve`
  - `IP-CIDR6,::1/128,DIRECT,no-resolve`
- **多账号与用量统计**：可在 **路由** 页组合多个渠道自动故障转移，在 **用量** 页查看每次请求的 Token、缓存命中与费用。更多高阶用法请参阅 [Magpie 官方中文指南](https://usemagpie.ai/docs/zh/start)。
:::
