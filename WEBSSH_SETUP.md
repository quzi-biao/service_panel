# WebSSH 功能设置指南

## 需要安装的依赖

运行以下命令安装 WebSSH 所需的依赖：

```bash
npm install ssh2 socket.io socket.io-client xterm xterm-addon-fit xterm-addon-web-links
npm install --save-dev @types/ssh2
```

或使用 pnpm：

```bash
pnpm add ssh2 socket.io socket.io-client xterm xterm-addon-fit xterm-addon-web-links
pnpm add -D @types/ssh2
```

## 数据库设置

执行以下 SQL 创建服务器表：

```bash
mysql -u your_user -p your_database < sql/create_servers_table.sql
```

## 功能说明

- **服务器管理**：添加、编辑、删除服务器信息
- **WebSSH**：通过浏览器直接连接到服务器的 SSH 终端
- **分组管理**：使用主标签对服务器进行层级分组
- **标签筛选**：通过其他标签快速筛选服务器
- **搜索功能**：在服务器列表中快速搜索

## 技术栈

- **xterm.js**：终端模拟器
- **ssh2**：Node.js SSH2 客户端
- **Socket.IO**：实时双向通信
- **Next.js API Routes**：后端 API
- **MySQL**：数据存储
