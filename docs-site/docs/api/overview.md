# 接口与模型

维格智创Token站 提供多协议统一接入，开发者无需修改已有 SDK 即可平滑切换。

<table class="method-table">
  <thead>
    <tr>
      <th>协议类型</th>
      <th>Base URL</th>
      <th>适用场景与典型端点</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>OpenAI 兼容接口</td>
      <td><code>https://api.weigeai.com/v1</code></td>
      <td><code>/v1/chat/completions</code>、<code>/v1/responses</code>、<code>/v1/embeddings</code></td>
    </tr>
    <tr>
      <td>Anthropic 兼容接口</td>
      <td><code>https://api.weigeai.com</code></td>
      <td><code>/v1/messages</code>，原生支持 Prompt Caching 与工具调用</td>
    </tr>
    <tr>
      <td>Gemini / xAI 接口</td>
      <td><code>https://api.weigeai.com</code></td>
      <td>支持原生协议或通过 OpenAI 兼容端点统一调用</td>
    </tr>
  </tbody>
</table>
