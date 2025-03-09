<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">AutoGo Lab 管理平台</h1>
      <div class="login-form">
        <el-input 
          v-model="password" 
          type="password" 
          placeholder="请输入密码" 
          show-password
          @keyup.enter="handleLogin"
        />
        <el-button type="primary" :loading="loading" @click="handleLogin">登录</el-button>
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from '../api/request'

const router = useRouter()
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!password.value) {
    errorMessage.value = '请输入密码'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await axios.post('/api/login', null, {
      params: {
        password: password.value
      }
    })

    if (response.data.code === 200) {
      // 登录成功，保存token
      const token = response.data.data
      localStorage.setItem('token', token)
      
      // 设置axios默认headers
      axios.defaults.headers.common['Authorization'] = token
      
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      errorMessage.value = response.data.info || '登录失败'
    }
  } catch (error) {
    console.error('登录失败:', error)
    errorMessage.value = '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-box {
  width: 400px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login-title {
  margin-bottom: 30px;
  color: #303133;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-message {
  margin-top: 20px;
  color: #f56c6c;
}
</style>