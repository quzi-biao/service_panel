-- 创建任务管理表
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_name VARCHAR(255) COMMENT '任务名称',
  task_description TEXT COMMENT '任务描述',
  proposed_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '提出时间',
  completed_time TIMESTAMP NULL DEFAULT NULL COMMENT '完成时间',
  project_id INT DEFAULT NULL COMMENT '关联的项目ID',
  project_name VARCHAR(255) DEFAULT NULL COMMENT '关联的项目名称',
  status ENUM('not_started', 'in_progress', 'completed', 'abandoned') DEFAULT 'not_started' COMMENT '任务状态：未开始、进行中、已完成、已放弃',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_project_id (project_id),
  INDEX idx_status (status),
  INDEX idx_proposed_time (proposed_time),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务管理表';
