const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('连接数据库成功...');

    // 检查字段是否已存在
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'services' AND COLUMN_NAME = 'is_pinned'`,
      [process.env.DB_NAME]
    );

    if (columns.length > 0) {
      console.log('✓ is_pinned 字段已存在，无需迁移');
      await connection.end();
      return;
    }

    console.log('开始添加 is_pinned 字段...');

    // 添加字段
    await connection.query(
      `ALTER TABLE services 
       ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE COMMENT '是否置顶' 
       AFTER description`
    );
    console.log('✓ is_pinned 字段添加成功');

    // 添加索引
    await connection.query(
      `ALTER TABLE services 
       ADD INDEX idx_pinned (is_pinned)`
    );
    console.log('✓ 索引添加成功');

    // 验证
    const [result] = await connection.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, COLUMN_COMMENT 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'services' AND COLUMN_NAME = 'is_pinned'`,
      [process.env.DB_NAME]
    );

    console.log('\n迁移完成！字段信息：');
    console.log(result[0]);

  } catch (error) {
    console.error('迁移失败：', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
