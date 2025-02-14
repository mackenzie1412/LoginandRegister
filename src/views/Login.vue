<template>
    <div class="login-box">
      <h2>登录</h2>
      <input v-model="form.username" placeholder="用户名">
      <input v-model="form.password" type="password" placeholder="密码">
      <button @click="handleLogin">登录</button>
      <button @click="form = { username: '', password: '' }">重置</button>
      <router-link to="/register">注册账号</router-link>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import axios from 'axios'
  import { useRouter } from 'vue-router'
  
  const form = ref({ username: '', password: '' })
  const router = useRouter()
  
  const handleLogin = async () => {
    try {
      const res = await axios.post('/api/login', form.value)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('username', form.value.username)
      
      if (res.data.role === 'admin') {
        alert('管理员登录成功')
        router.push('/admin')
      } else {
        router.push('/user-home')
      }
    } catch (error) {
      alert(error.response?.data?.message || '登录失败')
    }
  }
  </script>
<style>
.login-box h2 {
    margin-bottom: 2rem;
    color: #333;
    font-size: 1.8rem;
    font-weight: 600;
    letter-spacing: 1px;
  }
  .login-box input {
    width: 90%;
    padding: 1rem;
    margin-bottom: 1.5rem;
    border: none;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.8);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    font-size: 1rem;
    transition: all 0.3s ease;
  }
  .login-box input:focus {
    outline: none;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 8px rgba(0, 123, 255, 0.6);
  }
  .login-box button {
    width: 100%;
    padding: 1rem;
    margin-bottom: 1.2rem;
    border: none;
    border-radius: 8px;
    background: linear-gradient(135deg, #007BFF, #0056b3);
    color: white;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(0, 123, 255, 0.3);
  }
  .login-box button:hover {
    background: linear-gradient(135deg, #0056b3, #003d82);
    box-shadow: 0 6px 15px rgba(0, 123, 255, 0.4);
  }
  .login-box button:nth-of-type(2) {
    background: linear-gradient(135deg, #6c757d, #5a6268);
    box-shadow: 0 4px 10px rgba(108, 117, 125, 0.3);
  }
  .login-box button:nth-of-type(2):hover {
    background: linear-gradient(135deg, #5a6268, #495057);
    box-shadow: 0 6px 15px rgba(108, 117, 125, 0.4);
  }
  .login-box router-link {
    display: block;
    color: #007BFF;
    text-decoration: none;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    margin-top: 0.5rem;
  }
  .login-box router-link:hover {
    color: #0056b3;
    text-decoration: underline;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>