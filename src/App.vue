<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElConfigProvider, ElMenu, ElMenuItem } from 'element-plus'
import 'element-plus/dist/index.css'

const route = useRoute()
const router = useRouter()

// 计算当前是否在登录页
const isLoginPage = computed(() => {
  return route.name === 'login'
})

// 退出登录函数
const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<template>
  <el-config-provider>
    <div class="app-container">
      <!-- 只在非登录页显示头部和侧边栏 -->
      <template v-if="!isLoginPage">
        <header class="header">
          <div class="header-content">
            <div class="logo">
              <h1>AutoGo Lab 管理平台</h1>
            </div>
            <div class="user-info">
              <span>管理员</span>
              <el-button link @click="handleLogout">
                退出登录
              </el-button>
            </div>
          </div>
        </header>

        <div class="main-container">
          <aside class="sidebar">
            <el-menu default-active="/" class="sidebar-menu" router>
              <el-menu-item index="/">
                <span>主页管理</span>
              </el-menu-item>
              <el-menu-item index="/team">
                <span>团队管理</span>
              </el-menu-item>
              <el-menu-item index="/research">
                <span>研究管理</span>
              </el-menu-item>
              <el-menu-item index="/treatise">
                <span>论文管理</span>
              </el-menu-item>
              <el-menu-item index="/device">
                <span>设备管理</span>
              </el-menu-item>
            </el-menu>
          </aside>

          <main class="content">
            <router-view />
          </main>
        </div>
      </template>

      <!-- 登录页直接显示路由内容 -->
      <template v-else>
        <router-view />
      </template>
    </div>
  </el-config-provider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f7fa;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  background-color: #3E9BD4;
  color: white;
  height: 60px;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 100%;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: bold;
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  background-color: white;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.sidebar-menu {
  height: 100%;
  border-right: none;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
</style>
