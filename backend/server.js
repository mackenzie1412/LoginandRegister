import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import { createPool } from 'mysql2/promise'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
// 数据库连接池
const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '521412',
  database: process.env.DB_NAME || 'user_system',
  waitForConnections: true,
  connectionLimit: 10
})

// 安全验证：确保 JWT_SECRET 存在
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET 未在环境变量中配置！')
}

// 在数据库连接池后添加初始管理员账户检查和创建
const initAdminUser = async () => {
  try {
    const [adminUsers] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      ['admin']
    )
    
    if (adminUsers.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      await pool.query(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['admin', hashedPassword, 'admin']
      )
      console.log('初始管理员账户已创建')
    }
  } catch (error) {
    console.error('初始化管理员账户失败:', error)
  }
}

// 在服务器启动时初始化管理员账户
initAdminUser()

// 管理员权限中间件
const adminMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未提供认证令牌' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const [users] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [decoded.id]
    )

    if (users.length === 0 || users[0].role !== 'admin') { // 重点修改处
      return res.status(403).json({ message: '权限状态已变更' })
    }
    req.user = decoded
    next()
  } catch (err) {
    console.error('JWT验证失败:', err)
    return res.status(401).json({ message: '无效令牌' })
  }
}

// 用户管理路由
app.get('/api/users', adminMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, username, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '服务器错误' })
  }
})

app.delete('/api/users/:id', adminMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ?',
      [req.params.id]
    )
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }
    
    res.sendStatus(204)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '删除失败' })
  }
})

app.put('/api/users/:id/role', adminMiddleware, async (req, res) => {
  const { role } = req.body
  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: '无效角色' })
  }

  try {
    const [result] = await pool.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, req.params.id]
    )
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '用户不存在' })
    }
    
    res.json({ message: '角色更新成功' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '更新失败' })
  }
})

// 注册接口
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码必填' })
    }

    // 检查用户名是否存在
    const [checkRows] = await pool.query(
      'SELECT username FROM users WHERE username = ?',
      [username]
    )

    if (checkRows.length > 0) {
      return res.status(400).json({ message: '用户名已存在' })
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const [result] = await pool.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, 'user'] // 默认角色为user
    )

    res.status(201).json({
      message: '注册成功',
      userId: result.insertId
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 登录接口
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码必填' })
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    )

    if (rows.length === 0) {
      return res.status(401).json({ message: '用户不存在' })
    }

    const user = rows[0]
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ message: '密码错误' })
    }

    // 生成JWT
    const token = jwt.sign(
      { id: user.id,
        role: user.role // 新增角色存储
       },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.json({
      token,
      role: user.role // 修改字段名
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 添加根路径重定向到登录页面
app.get('/', (req, res) => {
  res.redirect('/login');
});

// 添加一个测试路由
app.get('/api/test', (req, res) => {
  res.json({ message: '服务器连接正常' })
})

// 环境变量验证
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '已配置' : '未配置')
console.log('DB_HOST:', process.env.DB_HOST || 'localhost')

app.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000')
})