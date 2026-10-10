# 微信记账小程序

一款基于 **uni-app、Vue 3、TypeScript 和微信云开发**构建的个人记账小程序。项目采用 **OpenSpec** 管理需求、设计与实施任务，并通过自动化测试保障核心业务逻辑。

## 功能特性

- 微信用户身份识别与自动登录
- 收入、支出账目的新增、编辑和删除
- 按月份查看账目明细
- 月度收入、支出和结余统计
- 每日支出趋势与支出分类排行
- 微信云数据库同步
- 基于 OpenID 的用户数据隔离
- 金额统一按“分”存储，避免浮点数精度问题

## 技术栈

- [uni-app](https://uniapp.dcloud.net.cn/)
- [Vue 3](https://vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Vitest](https://vitest.dev/)
- 微信小程序云开发（云函数、云数据库）
- OpenSpec（规格驱动开发）

## 项目结构

```text
.
├─ cloudfunctions/          # 微信云函数
│  ├─ get-session/         # 获取当前微信用户身份
│  ├─ transactions/        # 账目增删改查
│  └─ monthly-insights/    # 月度统计
├─ docs/                    # 开发、数据库与验证文档
├─ openspec/                # OpenSpec 规范及变更归档
├─ src/
│  ├─ components/          # 通用组件
│  ├─ domain/              # 领域模型与业务规则
│  ├─ pages/               # 小程序页面
│  ├─ platforms/wechat/    # 微信平台适配
│  ├─ services/            # 服务接口
│  └─ stores/              # 状态管理
└─ package.json
```

## 本地运行

### 前置条件

- Node.js 20 或更高版本
- 微信开发者工具
- 可用的微信小程序 AppID
- 已开通的微信云开发环境

### 1. 安装依赖

```bash
npm install
```

### 2. 配置云环境

复制环境变量示例文件：

```bash
cp .env.example .env
```

Windows PowerShell 可使用：

```powershell
Copy-Item .env.example .env
```

在 `.env` 中填写微信云开发环境 ID：

```dotenv
VITE_WECHAT_CLOUD_ENV_ID=your-wechat-cloud-environment-id
```

> 云环境 ID 不是 AppSecret。请勿将 AppSecret、私钥、访问令牌等敏感信息写入源码或提交到 Git 仓库。

### 3. 启动微信小程序开发构建

```bash
npm run dev:mp-weixin
```

构建产物位于：

```text
dist/dev/mp-weixin
```

使用微信开发者工具导入该目录，并配置自己的小程序 AppID。

## 云端配置

### 数据库

在微信云开发控制台创建 `transactions` 集合，并禁止客户端直接读写。账目访问统一通过云函数完成，由云函数根据可信 OpenID 限制数据归属。

为该集合创建以下组合索引：

| 顺序 | 字段 | 排序方式 |
| --- | --- | --- |
| 1 | `ownerOpenId` | 升序 |
| 2 | `monthKey` | 升序 |
| 3 | `occurredAt` | 降序 |
| 4 | `createdAt` | 降序 |

更完整的字段说明见 [云数据库配置](docs/cloud-database.md)。

### 云函数

需要在微信云开发环境中上传并部署以下云函数：

- `get-session`
- `transactions`
- `monthly-insights`

部署时请在云端安装各云函数目录中的依赖。

## 常用命令

```bash
# 微信小程序开发构建
npm run dev:mp-weixin

# 微信小程序生产构建
npm run build:mp-weixin

# 自动化测试
npm test

# TypeScript 类型检查
npm run type-check

# 代码检查
npm run lint
```

当前项目包含覆盖领域规则、表单提交、账目服务、月度统计、页面状态与云函数处理器的自动化测试。

## OpenSpec 工作流

本项目使用规格驱动方式开发，典型流程如下：

1. 提出变更并明确目标与范围；
2. 编写需求规格、场景和技术设计；
3. 将设计拆分为可验证的实施任务；
4. 按任务实现代码并运行自动化测试；
5. 完成人工验收，包括真机/模拟器和云端数据验证；
6. 将增量规范同步到主规范；
7. 归档已完成的变更。

本次初始版本的完整提案、设计、任务及增量规范保存在：

```text
openspec/changes/archive/2026-10-09-create-bookkeeping-mini-program/
```

## 数据安全

- 客户端不能直接读写账目集合；
- 云函数从微信上下文获取可信 OpenID，不信任客户端传入的用户标识；
- 所有查询、修改和删除操作均校验账目归属；
- 不同微信账号之间的数据相互隔离；
- 本地环境变量与微信开发者工具个人配置已加入 `.gitignore`。

## 更多文档

- [本地开发说明](docs/development.md)
- [云数据库配置](docs/cloud-database.md)
- [功能验证记录](docs/verification.md)

## 项目状态

首个可用版本已经完成，核心记账流程、账目管理、月度统计、云端同步和用户数据隔离均已通过测试与人工验证。

