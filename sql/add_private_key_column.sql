-- 添加私钥字段到 servers 表
ALTER TABLE servers 
ADD COLUMN private_key TEXT AFTER password,
ADD COLUMN auth_method ENUM('password', 'private_key') DEFAULT 'password' AFTER private_key;
