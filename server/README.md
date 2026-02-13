# 服务器端

## 技术栈
- NestJS
- WebSocket
- Redis
- 多模型支持（Coze、通义千问、DeepSeek、豆包、GPT）

## 快速开始

1. 安装依赖：
```bash
cd server
npm install
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 API 密钥
```

3. 启动开发服务器（端口 4400）：
```bash
npm run start:dev
```

4. 构建生产版本：
```bash
npm run build
```

## 环境变量配置

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| PORT | 服务器端口 | 4400 |
| REDIS_HOST | Redis 主机 | localhost |
| REDIS_PORT | Redis 端口 | 6379 |
| COZE_BOT_ID | Coze 机器人 ID | - |
| COZE_ISS | Coze OAuth 应用 ID | - |
| COZE_KID | Coze 公钥指纹 | - |
| QWEN_API_KEY | 通义千问 API Key | - |
| DEEPSEEK_API_KEY | DeepSeek API Key | - |
| DOUBAO_API_KEY | 豆包 API Key | - |
| OPENAI_API_KEY | OpenAI API Key | - |

## API 接口

### 模型管理

- `GET /model/list` - 获取可用模型列表
- `POST /model/create-session` - 创建会话
- `POST /model/:sessionId/switch` - 切换模型
- `GET /model/:sessionId/messages` - 获取消息历史
- `POST /model/:sessionId/delete` - 删除会话

### WebSocket

- `ws://localhost:4400/chat` - 聊天 WebSocket

## WebSocket 事件

### 客户端发送
- `createSession` - 创建会话
- `sendMessage` - 发送消息
- `switchModel` - 切换模型
- `getMessages` - 获取消息
- `clearSession` - 清除会话

### 服务端推送
- `sessionCreated` - 会话创建成功
- `messageReceived` - 收到消息
- `modelSwitched` - 模型切换成功
- `sessionCleared` - 会话已清除
