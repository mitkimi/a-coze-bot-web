# 后端

首先创建一个 coze 智能体

然后授权 coze-api 使用

分别获取到（存入 /src/configs/coze.config.js）：
- bot_id（智能体 id）
- iss（oAuth 应用 id）
- kid（公钥指纹）

以及私钥文件（存入 /src/configs 目录）
- private_key.pem

就可以正常使用了