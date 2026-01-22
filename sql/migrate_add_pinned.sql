-- 添加置顶字段迁移脚本
-- 为现有的 services 表添加 is_pinned 字段

-- 添加 is_pinned 字段
ALTER TABLE services 
ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE COMMENT '是否置顶' 
AFTER description;

-- 添加索引以优化查询性能
ALTER TABLE services 
ADD INDEX idx_pinned (is_pinned);

-- 验证字段已添加
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'panel_system' 
  AND TABLE_NAME = 'services' 
  AND COLUMN_NAME = 'is_pinned';
