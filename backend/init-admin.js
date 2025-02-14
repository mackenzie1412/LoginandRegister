import bcrypt from 'bcrypt';
import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量（使用绝对路径）
const __dirname = path.resolve();
dotenv.config({ path: path.join(__dirname, '.env') });

// 调试输出
console.log('✅ 当前数据库用户:', process.env.DB_USER);
console.log('✅ 当前数据库名称:', process.env.DB_NAME);
const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306, 
  waitForConnections: true 
});

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('AdminPassword123!', 10); // 修改管理员密码
  await pool.query(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    ['admin', hashedPassword, 'admin']
  );
  console.log('✅ 管理员账户创建成功');
}

createAdmin().catch(console.error);