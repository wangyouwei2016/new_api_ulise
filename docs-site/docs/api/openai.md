# OpenAI 兼容接口

使用官方 OpenAI SDK 时，只需修改 `base_url` 与 `api_key`：

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.weigeai.com/v1",
)

resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "用三句话介绍 API 网关的作用"}],
)
print(resp.choices[0].message.content)
```
