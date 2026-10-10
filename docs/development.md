# 本地开发

## 前置条件

- Node.js 20 或更高版本
- 微信开发者工具
- 可用的微信小程序 AppID
- 已开通的微信云开发环境

## 安装与构建

```powershell
npm install
npm run dev:mp-weixin
```

开发构建产物位于 `dist/dev/mp-weixin`，使用微信开发者工具导入该目录。

生产构建：

```powershell
npm run build:mp-weixin
```

生产构建产物位于 `dist/build/mp-weixin`。

## 云环境配置

默认构建读取 `.env` 中的 `VITE_WECHAT_CLOUD_ENV_ID`，开发模式可由 `.env.development` 覆盖。新建其他构建环境时，复制 `.env.example` 并设置对应的微信云开发环境 ID。

云环境 ID用于选择运行环境，不是 AppSecret。AppSecret、私钥、访问令牌和其他敏感凭据不得写入 `.env`、源代码或 Git 仓库。
