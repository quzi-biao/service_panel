# 多 ZeroTier Planet 环境支持方案

## 问题背景

当你有多个独立的 ZeroTier 服务器（不同的 Planet 文件），它们之间完全隔离，无法直接互通。应用服务器需要访问不同 Planet 网络中的服务器。

## 解决方案：跳板机架构

通过在每个 ZeroTier 网络中部署一个跳板机（Bastion Host），应用服务器通过跳板机转发 SSH 连接到目标服务器。

### 架构图

```
应用服务器 (公网)
    ↓
跳板机A (ZeroTier 网络A) → 目标服务器A1, A2, A3...
    ↓
跳板机B (ZeroTier 网络B) → 目标服务器B1, B2, B3...
    ↓
跳板机C (ZeroTier 网络C) → 目标服务器C1, C2, C3...
```

## 部署步骤

### 1. 数据库迁移

执行 SQL 脚本添加跳板机相关字段：

```bash
mysql -u your_user -p your_database < sql/add_network_group_to_servers.sql
```

### 2. 配置跳板机

在每个 ZeroTier 网络中选择一台服务器作为跳板机：

**跳板机要求：**
- 同时具有公网 IP（或应用服务器可访问的 IP）
- 加入对应的 ZeroTier 网络
- 开启 SSH 服务
- 配置好防火墙规则

**示例配置（Ubuntu）：**

```bash
# 安装 SSH 服务
sudo apt update
sudo apt install openssh-server

# 配置 SSH（可选，增强安全性）
sudo vim /etc/ssh/sshd_config
# 建议配置：
# PermitRootLogin no
# PasswordAuthentication no  # 使用密钥认证
# AllowUsers bastion_user

# 重启 SSH 服务
sudo systemctl restart sshd

# 配置防火墙
sudo ufw allow 22/tcp
sudo ufw enable
```

### 3. 添加服务器配置

在应用中添加服务器时，填写以下信息：

**目标服务器配置：**
- 服务器名称：`目标服务器名称`
- 主机地址：`ZeroTier IP`（如 172.25.0.10）
- 端口：`22`
- 用户名：`目标服务器用户名`
- 认证方式：密码或私钥
- 网络分组：`ZT-Network-A`（用于标识所属网络）

**跳板机配置：**
- 跳板机地址：`跳板机公网IP或域名`
- 跳板机端口：`22`
- 跳板机用户名：`bastion_user`
- 跳板机认证方式：密码或私钥（推荐私钥）

### 4. 连接流程

1. 应用服务器连接到跳板机（公网 IP）
2. 跳板机通过 ZeroTier 网络转发连接到目标服务器
3. 建立 SSH 会话

## 配置示例

### 示例 1：使用密码认证

```json
{
  "name": "生产服务器-01",
  "host": "172.25.0.10",
  "port": 22,
  "username": "admin",
  "password": "target_password",
  "auth_method": "password",
  "network_group": "Production-ZT-A",
  "bastion_host": "bastion-a.example.com",
  "bastion_port": 22,
  "bastion_username": "bastion",
  "bastion_password": "bastion_password",
  "bastion_auth_method": "password"
}
```

### 示例 2：使用私钥认证（推荐）

```json
{
  "name": "开发服务器-01",
  "host": "172.26.0.20",
  "port": 22,
  "username": "developer",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----",
  "auth_method": "private_key",
  "network_group": "Dev-ZT-B",
  "bastion_host": "123.45.67.89",
  "bastion_port": 22,
  "bastion_username": "bastion",
  "bastion_private_key": "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----",
  "bastion_auth_method": "private_key"
}
```

## 安全建议

1. **使用密钥认证**：跳板机和目标服务器都应使用 SSH 密钥认证，禁用密码登录
2. **限制跳板机访问**：配置防火墙只允许应用服务器 IP 访问跳板机
3. **定期轮换密钥**：定期更新 SSH 密钥
4. **审计日志**：在跳板机上启用详细的 SSH 日志记录
5. **最小权限原则**：跳板机用户只需要转发权限，不需要其他权限

## 故障排查

### 连接失败

1. 检查跳板机是否可访问：
   ```bash
   ssh bastion_user@bastion_host
   ```

2. 从跳板机测试目标服务器连接：
   ```bash
   ssh target_user@172.25.0.10
   ```

3. 检查 ZeroTier 网络状态：
   ```bash
   zerotier-cli listnetworks
   zerotier-cli peers
   ```

### 查看日志

应用服务器日志会显示连接详情：
```
Bastion connection ready
Target server connection ready via bastion
```

## 网络分组管理

使用 `network_group` 字段对服务器进行分组：

- `Production-ZT-A`：生产环境 ZeroTier 网络 A
- `Dev-ZT-B`：开发环境 ZeroTier 网络 B
- `Test-ZT-C`：测试环境 ZeroTier 网络 C

这样可以方便地按网络筛选和管理服务器。

## 性能考虑

- 跳板机会增加一跳延迟（通常 < 50ms）
- 建议跳板机配置足够的带宽和 CPU 资源
- 可以在不同地域部署多个跳板机以优化延迟
