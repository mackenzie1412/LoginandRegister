<template>
    <div class="login-box">
      <h2>用户注册</h2>
      <div class="form-group">
        <input 
          v-model="form.username" 
          type="text" 
          placeholder="请输入用户名"
          @keyup.enter="handleRegister"
        >
        <span class="error-msg">{{ errors.username }}</span>
      </div>
      <div class="form-group">
        <input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          @keyup.enter="handleRegister"
        >
        <span class="error-msg">{{ errors.password }}</span>
      </div>
      <div class="button-group">
        <button @click="handleRegister" :disabled="isSubmitting">
          {{ isSubmitting ? '注册中...' : '立即注册' }}
        </button>
        <button @click="handleReset" class="cancel-btn">重置</button>
      </div>
      <div class="login-link">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import axios from 'axios'
  import { useRouter } from 'vue-router'
  import bcrypt from 'bcryptjs' 
  
  const router = useRouter()
  const isSubmitting = ref(false)
  
  const form = ref({
    username: '',
    password: ''
  })
  
  const errors = ref({
    username: '',
    password: ''
  })
  
  const validateForm = () => {
    let isValid = true
    errors.value = { username: '', password: '' }
  
    if (!form.value.username.trim()) {
      errors.value.username = '用户名不能为空'
      isValid = false
    } else if (form.value.username.length < 4) {
      errors.value.username = '用户名至少4个字符'
      isValid = false
    }
  
    if (!form.value.password) {
      errors.value.password = '密码不能为空'
      isValid = false
    } else if (form.value.password.length < 6) {
      errors.value.password = '密码至少6个字符'
      isValid = false
    }
  
    return isValid
  }
  
  const handleRegister = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const response = await axios.post('/api/register', {
      username: form.value.username,
      password: form.value.password // 保持发送明文密码
    })
    if (response.status === 201) {
      // 注册成功后在 local storage 中存储用户信息
      localStorage.setItem('username', form.value.username)
      localStorage.setItem('role', 'user')
      alert('注册成功，已自动登录')
      router.push('/user-home')
    }
  } catch (error) {
    if (error.response) {
      alert(error.response.data.message)
    } else {
      alert('注册时发生未知错误')
    }
  } finally {
    isSubmitting.value = false
  }
}
  
  const handleReset = () => {
    form.value = {
      username: '',
      password: ''
    }
    errors.value = {
      username: '',
      password: ''
    }
  }
  </script>

<style scoped>
.login-box h2 {
    margin-bottom: 2rem;
    color: #333;
    font-size: 1.8rem;
    font-weight: 600;
    letter-spacing: 1px;
}

.form-group {
    margin-bottom: 1.5rem;
}

.login-box input {
    width: 90%;
    padding: 1rem;
    margin-bottom: 0.3rem;
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

.error-msg {
    display: block;
    color: #e74c3c;
    font-size: 0.9rem;
    text-align: left;
    margin-top: 0.2rem;
}

.button-group {
    display: flex;
    flex-direction: column; 
}

.login-box button {
    width: 100%;
    padding: 1rem;
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

.login-box button:hover:not(:disabled) {
    background: linear-gradient(135deg, #0056b3, #003d82);
    box-shadow: 0 6px 15px rgba(0, 123, 255, 0.4);
}

.login-box button:disabled {
    background: linear-gradient(135deg, #bdc3c7, #aab1b7);
    box-shadow: 0 4px 10px rgba(189, 195, 199, 0.3);
    cursor: not-allowed;
}

.cancel-btn {
    background: linear-gradient(135deg, #6c757d, #5a6268) !important;
    box-shadow: 0 4px 10px rgba(108, 117, 125, 0.3) !important;
}

.cancel-btn:hover {
    background: linear-gradient(135deg, #5a6268, #495057) !important;
    box-shadow: 0 6px 15px rgba(108, 117, 125, 0.4) !important;
}

.login-link {
    display: block;
    color: #007BFF;
    text-decoration: none;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    margin-top: 1.5rem;
}

.login-link router-link:hover {
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