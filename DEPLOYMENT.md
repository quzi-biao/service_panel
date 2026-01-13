# 服务管理面板 - 部署文档

## 项目简介

一个现代化的服务管理面板，用于统一管理和访问各种服务入口。

## 功能特性

- 🔐 服务凭证管理（用户名/密码）
- 📌 服务置顶功能
- 🔍 实时搜索过滤
- 🎨 现代化 UI 设计（玻璃态风格）
- 🖱️ 右键菜单操作
- 📱 响应式布局

## 技术栈

- **前端框架**: Next.js 14
- **样式**: TailwindCSS
- **数据库**: MySQL
- **部署**: Docker

## 环境要求

- Node.js 20+
- MySQL 5.7+
- Docker & Docker Compose (可选)

## 本地开发

### 1. 克隆项目

```bash
git clone git@github.com:quzi-biao/service_panel.git
cd service_panel
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并配置数据库连接：

```env
DB_HOST=your_database_host
DB_PORT=3306
DB_NAME=panel_system
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

### 4. 初始化数据库

执行 `init.sql` 文件创建数据表：

```bash
mysql -h your_host -u your_user -p your_database < init.sql
```

或使用 Node.js 迁移脚本：

```bash
node scripts/migrate.js
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3004

## Docker 部署

### 方式一：使用 Docker Compose（推荐）

1. 确保 `.env` 文件已配置

2. 构建并启动容器：

```bash
docker-compose up -d --build
```

3. 查看日志：

```bash
docker-compose logs -f
```

4. 停止服务：

```bash
docker-compose down
```

### 方式二：使用 Docker 命令

1. 构建镜像：

```bash
docker build -t service-panel:latest .
```

2. 运行容器：

```bash
docker run -d \
  --name service-panel \
  -p 3004:3000 \
  -e DB_HOST=your_host \
  -e DB_PORT=3306 \
  -e DB_NAME=panel_system \
  -e DB_USER=your_user \
  -e DB_PASSWORD=your_password \
  --restart unless-stopped \
  service-panel:latest
```

## 生产环境部署

### 1. 服务器准备

确保服务器已安装：
- Docker
- Docker Compose
- Git

### 2. 部署步骤

```bash
# 克隆项目
git clone git@github.com:quzi-biao/service_panel.git
cd service_panel

# 配置环境变量
cp .env.example .env
vim .env  # 编辑配置

# 初始化数据库
mysql -h your_host -u your_user -p panel_system < init.sql

# 启动服务
docker-compose up -d --build
```

### 3. 更新部署

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose up -d --build
```

### 4. 数据库迁移

如果需要添加 `is_pinned` 字段（已有数据库）：

```bash
mysql -h your_host -u your_user -p panel_system < migrate_add_pinned.sql
```

或使用 Node.js 脚本：

```bash
node scripts/migrate.js
```

## 端口配置

- 开发环境：3004
- Docker 容器内部：3000
- Docker 映射端口：3004

## 常见问题

### 1. 置顶功能不生效

确保数据库表已添加 `is_pinned` 字段：

```sql
ALTER TABLE services ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE COMMENT '是否置顶';
ALTER TABLE services ADD INDEX idx_pinned (is_pinned);
```

### 2. 数据库连接失败

检查：
- 数据库服务是否运行
- `.env` 配置是否正确
- 数据库用户权限是否足够

### 3. Docker 容器无法访问数据库

如果数据库在宿主机上，使用 `host.docker.internal` 作为 DB_HOST：

```env
DB_HOST=host.docker.internal
```

## 维护

### 查看日志

```bash
docker-compose logs -f app
```

### 进入容器

```bash
docker-compose exec app sh
```

### 备份数据库

```bash
mysqldump -h your_host -u your_user -p panel_system > backup.sql
```

## 许可证

MIT

## 联系方式

如有问题，请提交 Issue 或 Pull Request。
