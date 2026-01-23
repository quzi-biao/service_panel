-- 创建项目文件表
CREATE TABLE IF NOT EXISTS project_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL COMMENT '项目ID',
  file_path TEXT NOT NULL COMMENT '文件相对路径',
  file_name VARCHAR(255) NOT NULL COMMENT '文件名',
  file_size BIGINT DEFAULT 0 COMMENT '文件大小(字节)',
  file_type VARCHAR(50) COMMENT '文件类型/扩展名',
  file_md5 VARCHAR(32) COMMENT '文件MD5值',
  is_directory BOOLEAN DEFAULT FALSE COMMENT '是否为目录',
  parent_path TEXT COMMENT '父目录路径',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY unique_project_file (project_id, file_path(500)),
  INDEX idx_project_id (project_id),
  INDEX idx_parent_path (parent_path(500)),
  INDEX idx_file_type (file_type),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目文件表';

-- 创建文件内容表
CREATE TABLE IF NOT EXISTS file_contents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_id INT NOT NULL COMMENT '文件ID',
  content LONGTEXT COMMENT '文件内容',
  encoding VARCHAR(50) DEFAULT 'utf-8' COMMENT '文件编码',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY unique_file_content (file_id),
  FOREIGN KEY (file_id) REFERENCES project_files(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件内容表';
