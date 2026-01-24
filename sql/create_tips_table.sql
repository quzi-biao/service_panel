-- Tips table for quick information and idea recording
CREATE TABLE IF NOT EXISTS tips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL COMMENT '内容',
  tags VARCHAR(500) DEFAULT NULL COMMENT '标签，以逗号分隔',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_created_at (created_at),
  INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='快速记录信息和想法';
