-- 为服务器表添加网络分组和跳板机支持
ALTER TABLE servers 
ADD COLUMN network_group VARCHAR(100) DEFAULT NULL COMMENT 'ZeroTier 网络分组标识',
ADD COLUMN bastion_host VARCHAR(255) DEFAULT NULL COMMENT '跳板机地址',
ADD COLUMN bastion_port INT DEFAULT 22 COMMENT '跳板机端口',
ADD COLUMN bastion_username VARCHAR(255) DEFAULT NULL COMMENT '跳板机用户名',
ADD COLUMN bastion_password VARCHAR(255) DEFAULT NULL COMMENT '跳板机密码',
ADD COLUMN bastion_private_key TEXT DEFAULT NULL COMMENT '跳板机私钥',
ADD COLUMN bastion_auth_method ENUM('password', 'private_key') DEFAULT 'password' COMMENT '跳板机认证方式',
ADD INDEX idx_network_group (network_group);
