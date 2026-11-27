# 视频生成指南

通过统一异步任务接口提交文生视频或图生视频任务，并轮询获取最终生成结果。

::: info 异步任务模式
视频生成耗时通常在数十秒至数分钟之间，接口采用「提交任务 → 查询状态 → 获取成片链接」的异步流程。
:::

## 1. 提交生成任务

向视频任务端点发送 `POST` 请求，创建生成任务并获取 `task_id`：

```bash
curl -X POST https://api.weigeai.com/v1/videos/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-api-key" \
  -d '{
    "model": "video-model-example",
    "prompt": "航拍镜头缓慢掠过晨雾缭绕的雪山湖泊，电影级光影",
    "duration": 5,
    "aspect_ratio": "16:9"
  }'
```

示例响应：

```json
{
  "task_id": "task_01j9example123456",
  "status": "queued"
}
```

## 2. 轮询任务状态

每隔 5–10 秒查询一次任务状态，直至返回 `succeeded` 或 `failed`：

```bash
curl https://api.weigeai.com/v1/videos/generations/task_01j9example123456 \
  -H "Authorization: Bearer sk-your-api-key"
```

| 状态值 | 含义 |
| --- | --- |
| `queued` | 任务已入队，等待调度 |
| `in_progress` | 模型正在渲染生成 |
| `succeeded` | 生成成功，响应中包含视频下载 URL |
| `failed` | 生成失败，可查看 `error` 字段原因，系统自动退还预扣额度 |

## 3. 注意事项

- 生成结果链接通常具有时效性，请在任务成功后及时转存至你的对象存储或本地。
- 请遵守 [使用政策](/terms-and-conditions/usage-policy)，避免提交违规或侵权素材。
