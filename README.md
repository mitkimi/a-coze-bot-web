# Coze Bot - 多模型智能对话系统

[官方网站](https://agent.mitkimi.com)

## 📖 项目简介

Coze Bot 是一个基于多模型 AI 的智能对话系统，支持 Coze、通义千问、DeepSeek、豆包、GPT-4 等多种 AI 模型的前端组件和后端服务。

## 📁 项目结构

```
a-coze-bot-web/
├── core/                    # ⚠️ 已弃用（旧版后端）
│
├── server/                  # ✅ NestJS 主服务器实例
│   ├── src/
│   │   ├── chat/          # WebSocket 聊天模块
│   │   │   └── providers/ # 多模型提供商实现
│   │   ├── model/         # 模型管理模块（REST API）
│   │   ├── redis/         # Redis 会话状态管理
│   │   ├── main.ts        # 应用入口
│   │   └── app.module.ts  # 根模块
│   ├── .env.example       # 环境变量配置模板
│   ├── package.json
│   └── README.md
│
├── nestjs-chat/           # ✅ 独立插件包 - WebSocket Gateway
│   ├── src/
│   │   ├── chat.gateway.ts   # WebSocket 网关实现
│   │   ├── model.service.ts  # 会话和模型管理服务
│   │   ├── providers/        # 多模型提供商（可复用）
│   │   │   ├── coze.provider.ts
│   │   │   ├── qwen.provider.ts
│   │   │   ├── deepseek.provider.ts
│   │   │   ├── doubao.provider.ts
│   │   │   └── openai.provider.ts
│   │   └── index.ts        # 导出入口
│   └── package.json
│
└── vue-next/              # Vue 3 前端组件
    └── src/lib/CozeBot/   # 可复用的聊天组件
        ├── index.vue      # 聊天窗口组件
        └── utils/         # 工具函数
```

## 🛠 技术栈

### 前端 (vue-next)
- **框架**: Vue 3 + TypeScript
- **样式**: Less
- **构建工具**: Vite
- **Markdown**: markdown-it
- **通信**: Socket.io Client

### 后端 (server)
- **框架**: NestJS
- **WebSocket**: Socket.io + @nestjs/websockets
- **状态管理**: Redis (会话存储)
- **配置管理**: @nestjs/config

### 插件 (nestjs-chat)
- **类型**: NestJS 独立插件包
- **功能**: WebSocket Gateway + 多模型支持
- **复用性**: 可独立发布为 NPM 包

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装服务器依赖
cd server
npm install

# 安装前端依赖
cd ../vue-next
npm install
```

### 2. 配置环境变量

```bash
cd server
cp .env.example .env
# 编辑 .env 文件，配置你的 API 密钥
```

### 3. 启动服务

```bash
# 启动后端（端口 4400）
cd server
npm run start:dev

# 启动前端开发服务器（新终端）
cd ../vue-next
npm run dev
```

## 📡 API 接口

### 模型管理 REST API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/model/list` | 获取可用模型列表 |
| POST | `/model/create-session` | 创建新会话 |
| POST | `/model/:sessionId/switch` | 切换会话模型 |
| GET | `/model/:sessionId/messages` | 获取消息历史 |
| POST | `/model/:sessionId/delete` | 删除会话 |

### WebSocket API

**连接地址**: `ws://localhost:4400/chat`

#### 客户端发送事件

| 事件 | 参数 | 描述 |
|------|------|------|
| `createSession` | `{ modelId? }` | 创建会话 |
| `sendMessage` | `{ message }` | 发送消息 |
| `switchModel` | `{ modelId }` | 切换模型 |
| `getMessages` | - | 获取消息历史 |
| `clearSession` | - | 清除会话 |

#### 服务端推送事件

| 事件 | 数据 | 描述 |
|------|------|------|
| `sessionCreated` | `{ sessionId, modelId }` | 会话创建成功 |
| `messageReceived` | `{ sessionId, message, modelId, timestamp }` | 收到消息 |
| `modelSwitched` | `{ sessionId, modelId }` | 模型切换成功 |
| `sessionCleared` | - | 会话已清除 |

## 🤖 支持的模型

| 模型 | 提供商 | API 类型 | 默认模型 |
|------|--------|----------|----------|
| Coze AI | Coze | OAuth + JWT | coze-bot |
| 通义千问 | 阿里云 | DashScope | qwen-turbo |
| DeepSeek | DeepSeek | OpenAI 兼容 | deepseek-chat |
| 豆包 | 字节跳动 | 火山引擎 | doubao-pro-32k |
| GPT-4 | OpenAI | OpenAI 标准 | gpt-4o |

## 📝 环境变量配置

```env
# 服务器配置
PORT=4400
NODE_ENV=development

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Coze 配置
COZE_BOT_ID=your_bot_id
COZE_ISS=your_iss
COZE_KID=your_kid

# 通义千问
QWEN_API_KEY=your_qwen_api_key
QWEN_MODEL=qwen-turbo

# DeepSeek
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_MODEL=deepseek-chat

# 豆包
DOUBAO_API_KEY=your_doubao_api_key
DOUBAO_MODEL=doubao-pro-32k

# OpenAI (GPT)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o
OPENAI_BASE_URL=https://api.openai.com/v1
```

## 🔧 前端组件使用

```html
<template>
  <coze-bot 
    server-url="http://localhost:4400"
    placeholder="输入消息..."
    theme="light"
    :assistant="{
      headImgUrl: '头像地址',
      name: 'AI 助手',
      bio: '智能对话助手'
    }"
  />
</template>

<script setup>
import CozeBot from './lib/CozeBot'
</script>
```

### 组件 Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `serverUrl` | String | `http://localhost:4400` | 后端服务地址 |
| `theme` | String | `light` | 主题：`light` / `dark` |
| `show` | Boolean | `true` | 是否显示组件 |
| `placeholder` | String | `''` | 输入框占位文字 |
| `greating` | String | `null` | 主动打招呼内容 |
| `assistant` | Object | 见下表 | AI 助理信息 |

### Assistant 对象

```typescript
interface AssistantInfo {
  headImgUrl: string;  // 头像 URL
  name: string;        // 名字
  bio: string;         // 个性签名
}
```

## 🔌 在 NestJS 项目中使用 nestjs-chat 插件

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ChatModule } from 'nestjs-chat';

@Module({
  imports: [
    ChatModule.forRoot({
      // 可选：覆盖默认配置
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
})
export class AppModule {}
```

## 📄 开源协议

本项目基于 **GPLv3** 开源协议开源。

```
Coze Bot - 多模型智能对话系统
Copyright (C) 2024 MITKIMI

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```

## 📞 联系方式

- **官方网站**: https://agent.mitkimi.com
- **问题反馈**: https://github.com/yourname/a-coze-bot-web/issues

## 🙏 致谢

感谢所有开源项目的贡献者！
