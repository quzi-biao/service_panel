-- 删除已存在的项目类型表（如果存在）
DROP TABLE IF EXISTS project_types;

-- 创建项目类型表
CREATE TABLE project_types (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '类型ID',
  name VARCHAR(100) NOT NULL UNIQUE COMMENT '类型名称',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_sort_order (sort_order),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目类型表';

-- 从现有项目中提取唯一类型并插入到 project_types 表
INSERT INTO project_types (name, sort_order)
SELECT DISTINCT 
  project_type as name,
  ROW_NUMBER() OVER (ORDER BY project_type) as sort_order
FROM projects 
WHERE project_type IS NOT NULL AND project_type != ''
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 添加临时列用于存储新的类型ID
ALTER TABLE projects ADD COLUMN project_type_id BIGINT COMMENT '项目类型ID';

-- 更新 projects 表，将类型名称映射到新的类型ID
UPDATE projects p
INNER JOIN project_types pt ON p.project_type = pt.name
SET p.project_type_id = pt.id
WHERE p.project_type IS NOT NULL AND p.project_type != '';

-- 删除旧的 project_type 列
ALTER TABLE projects DROP COLUMN project_type;

-- 重命名新列为 project_type
ALTER TABLE projects CHANGE COLUMN project_type_id project_type BIGINT COMMENT '项目类型ID';

-- 添加外键约束（可选）
ALTER TABLE projects ADD INDEX idx_project_type (project_type);
ALTER TABLE projects ADD CONSTRAINT fk_project_type 
  FOREIGN KEY (project_type) REFERENCES project_types(id) ON DELETE SET NULL ON UPDATE CASCADE;
