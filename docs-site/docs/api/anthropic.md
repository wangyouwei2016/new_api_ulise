# Anthropic 兼容接口

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
