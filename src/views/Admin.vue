<template>
  <div class="admin-container">
    <header class="admin-header">
      <h1>后台管理系统</h1>
      <div class="admin-info">
        <span>欢迎, {{ currentUser }}</span>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </div>
    </header>

    <div class="admin-content">
      <div class="stats-cards">
        <div class="stat-card">
          <h3>用户总数</h3>
          <p>{{ userStats.total }}</p>
        </div>
        <div class="stat-card">
          <h3>管理员数</h3>
          <p>{{ userStats.adminCount }}</p>
        </div>
      </div>

      <div class="user-management">
        <h2>用户管理</h2>
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            placeholder="搜索用户名..."
            @input="filterUsers"
          >
        </div>
        
        <div class="user-list">
          <table>
            <thead>
              <tr>
                <th>用户名</th>
                <th>角色</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>{{ user.username }}</td>
                <td :class="{ 'admin-role': user.role === 'admin' }">
                  {{ user.role === 'admin' ? '管理员' : '普通用户' }}
                </td>
                <td>{{ formatDate(user.created_at) }}</td>
                <td>
                  <button 
                    class="danger"
                    @click="handleDelete(user.id)"
                    :disabled="user.role === 'admin' || user.username === 'admin'"
                  >
                    删除
                  </button>
                  <button
                    @click="toggleRole(user)"
                    :class="{ 'warning': user.role === 'admin' }"
                    :disabled="user.username === 'admin'"
                  >
                    {{ user.role === 'admin' ? '降为普通用户' : '设为管理员' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const users = ref([])
const searchQuery = ref('')
const currentUser = ref(localStorage.getItem('username'))

const userStats = computed(() => {
  return {
    total: users.value.length,
    adminCount: users.value.filter(user => user.role === 'admin').length
  }
})

const filteredUsers = computed(() => {
  return users.value.filter(user => 
    user.username.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

const fetchUsers = async () => {
  try {
    const res = await axios.get('/api/users', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    users.value = res.data
  } catch (error) {
    alert('获取用户列表失败')
    console.error(error)
    if (error.response?.status === 401 || error.response?.status === 403) {
      handleLogout()
    }
  }
}

const handleDelete = async (userId) => {
  if (!confirm('确定要删除该用户吗？')) return
  
  try {
    await axios.delete(`/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    await fetchUsers()
  } catch (error) {
    alert('删除用户失败')
  }
}

const toggleRole = async (user) => {
  const newRole = user.role === 'admin' ? 'user' : 'admin'
  
  try {
    await axios.put(`/api/users/${user.id}/role`, 
      { role: newRole },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
    await fetchUsers()
  } catch (error) {
    alert('修改权限失败')
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('username')
  router.push('/login')
}

onMounted(() => {
  if (localStorage.getItem('role') !== 'admin') {
    router.push('/login')
    return
  }
  fetchUsers()
})
</script>

<style scoped>
.admin-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  min-height: 100vh;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 30px;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.stat-card p {
  margin: 10px 0 0;
  font-size: 2rem;
  font-weight: bold;
  color: #2196f3;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
}

button {
  padding: 6px 12px;
  margin-right: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
}

button:hover {
  opacity: 0.8;
}

.danger {
  background-color: #ff4757;
  color: white;
}

.warning {
  background-color: #ffa502;
  color: white;
}

.admin-role {
  color: #2ed573;
  font-weight: bold;
}
</style>