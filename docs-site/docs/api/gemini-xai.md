# Gemini / xAI 兼容接口

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
