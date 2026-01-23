import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '106.52.105.143',
  port: 3306,
  database: 'panel_system',
  user: 'waterdev',
  password: 'waterdev@123',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+08:00',
});

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

export default pool;
