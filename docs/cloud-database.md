# 云数据库配置

目标环境：由 `VITE_WECHAT_CLOUD_ENV_ID` 指定的微信云开发环境。

## transactions 集合

创建名为 `transactions` 的集合。客户端不得直接读写该集合；所有访问必须通过云函数，并由云函数使用可信 OpenID 限制数据归属。

核心字段：

- `ownerOpenId`：账目所有者的微信 OpenID
- `type`：`income` 或 `expense`
- `amountFen`：大于零的安全整数，单位为分
- `categoryId`：内置分类标识
- `occurredAt`：`YYYY-MM-DD` 格式的业务日期
- `monthKey`：`YYYY-MM` 格式的月份查询键
- `note`：可选备注，最多 100 个字符
- `createdAt`：服务端创建时间
- `updatedAt`：服务端最后更新时间

## 组合索引

为 `transactions` 创建组合索引，字段顺序如下：

1. `ownerOpenId`：升序
2. `monthKey`：升序
3. `occurredAt`：降序
4. `createdAt`：降序

该索引支持按当前用户和月份过滤，并按业务日期与创建时间从新到旧稳定排序。

## 验证

在微信云开发控制台确认：

- `transactions` 集合存在；
- 集合未开放客户端直接读写；
- 上述组合索引状态为可用；
- 使用测试账号的云函数只能访问该账号所有的记录。
