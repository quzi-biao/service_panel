# 服务管理面板

一个基于 Next.js 的服务管理系统，用于统一管理和访问多个服务。

## 功能特性

- ✅ 服务列表展示
- ✅ 添加新服务
- ✅ 编辑服务信息
- ✅ 删除服务
- ✅ 一键打开服务
- ✅ 密码显示/隐藏切换
- ✅ 响应式设计
- ✅ Docker 部署支持

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI 框架**: Tailwind CSS
- **图标库**: Lucide React
- **数据库**: MySQL
- **部署**: Docker

## 快速开始

### 1. 初始化数据库

首先，在 MySQL 数据库中执行 `init.sql` 文件创建表结构：

```bash
mysql -h 106.52.105.143 -P 3306 -u waterdev -p panel_system < init.sql
# 密码: waterdev@123
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## Docker 部署

### 构建镜像

```bash
docker build -t dev-panel .
```

### 使用 Docker Compose 部署

```bash
docker-compose up -d
```

### 停止服务

```bash
docker-compose down
```

## 服务字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 服务名称 |
| url | string | 是 | 服务地址（完整 URL） |
| username | string | 否 | 登录用户名 |
| password | string | 否 | 登录密码 |
| description | string | 否 | 服务介绍 |

## API 接口

### 获取所有服务
```
GET /api/services
```

### 创建服务
```
POST /api/services
Content-Type: application/json

{
  "name": "服务名称",
  "url": "https://example.com",
  "username": "admin",
  "password": "password",
  "description": "服务描述"
}
```

### 获取单个服务
```
GET /api/services/:id
```

### 更新服务
```
PUT /api/services/:id
Content-Type: application/json

{
  "name": "更新后的名称",
  "url": "https://example.com",
  ...
}
```

### 删除服务
```
DELETE /api/services/:id
```

## 数据库配置

数据库连接配置位于 `lib/db.ts`：

```typescript
{
  host: '106.52.105.143',
  port: 3306,
  database: 'panel_system',
  user: 'waterdev',
  password: 'waterdev@123',
  timezone: '+08:00'
}
```

## 项目结构

```
dev_panel/
├── app/
│   ├── api/
│   │   └── services/
│   │       ├── route.ts          # 服务列表 API
│   │       └── [id]/
│   │           └── route.ts      # 单个服务 API
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 主页面
├── lib/
│   └── db.ts                     # 数据库连接
├── types/
│   └── service.ts                # TypeScript 类型定义
├── Dockerfile                    # Docker 镜像配置
├── docker-compose.yml            # Docker Compose 配置
├── init.sql                      # 数据库初始化脚本
├── package.json                  # 项目依赖
└── README.md                     # 项目文档
```

## 开发说明

- 使用 TypeScript 进行类型安全开发
- 使用 Tailwind CSS 进行样式开发
- API 路由遵循 RESTful 规范
- 所有密码在前端可以切换显示/隐藏

## 注意事项

1. 确保 MySQL 数据库已创建 `panel_system` 数据库
2. 确保数据库用户有足够的权限
3. 生产环境建议使用环境变量管理数据库连接信息
4. 建议为密码字段添加加密存储（当前为明文存储）

## License

MIT
