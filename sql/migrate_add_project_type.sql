-- 添加项目类型字段
ALTER TABLE projects ADD COLUMN project_type VARCHAR(100) DEFAULT 'default' COMMENT '项目类型' AFTER name;

-- 添加项目类型索引
ALTER TABLE projects ADD INDEX idx_project_type (project_type);
