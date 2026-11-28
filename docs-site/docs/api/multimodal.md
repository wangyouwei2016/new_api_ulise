# 图像与多模态接口

支持通过 `/v1/images/generations` 进行文生图，或在 `/v1/chat/completions` 中传入 `image_url` 进行图像理解：

```bash
curl https://api.weigeai.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-api-key" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "A minimalist isometric illustration of a cloud API gateway",
    "size": "1024x1024"
  }'
```

如需视频生成异步任务接入指南，请参阅 [视频生成指南](/user-guide/video-generation)。
