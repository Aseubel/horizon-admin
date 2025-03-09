<template>
    <div class="page-container">
        <div class="page-header">
            <h1 class="page-title">当前标题页名称：主页</h1>
        </div>

        <div class="page-content" v-loading="loading">
            <div class="form-item">
                <label>关于我们：</label>
                <el-input v-model="homeData.about" type="textarea" :rows="3" placeholder="关于我们的内容"></el-input>
                <button class="reset-btn" @click="resetField('about')">重置</button>
            </div>

            <div class="form-item">
                <label>联系我们：</label>
                <el-input v-model="homeData.contact" type="textarea" :rows="3" placeholder="联系我们的内容"></el-input>
                <button class="reset-btn" @click="resetField('contact')">重置</button>
            </div>

            <div class="form-item">
                <label>地址：</label>
                <el-input v-model="homeData.address" placeholder="地址信息"></el-input>
                <button class="reset-btn" @click="resetField('address')">重置</button>
            </div>

            <div class="form-item">
                <label>电话：</label>
                <el-input v-model="homeData.phone" placeholder="电话号码"></el-input>
                <button class="reset-btn" @click="resetField('phone')">重置</button>
            </div>

            <div class="form-item wheel-container">
                <label>轮播图图片</label>
                <div class="image-upload-list">
                    <div class="image-item" v-for="(item, index) in 5" :key="index">{{ item }}</div>
                    <button class="add-btn">+</button>
                </div>
                <button class="save-btn" @click="saveHomeData">保存</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from '../api/request'

interface HomeData {
    id: number;
    about: string;
    contact: string;
    address: string;
    phone: string;
}

const loading = ref(false)
const originalData = ref<HomeData | null>(null)
const homeData = reactive<HomeData>({
    id: 1,
    about: '',
    contact: '',
    address: '',
    phone: ''
})

// 获取主页数据
const fetchHomeData = async () => {
    loading.value = true
    try {
        const response = await axios.get('/api/index/')
        if (response.data.code === 200) {
            const data = response.data.data
            homeData.id = data.id
            homeData.about = data.about
            homeData.contact = data.contact
            homeData.address = data.address
            homeData.phone = data.phone

            // 保存原始数据，用于重置
            originalData.value = { ...data }
        } else {
            ElMessage.error('获取主页数据失败')
        }
    } catch (error) {
        console.error('Error fetching home data:', error)
        ElMessage.error('获取主页数据失败')
    } finally {
        loading.value = false
    }
}

// 保存主页数据
const saveHomeData = async () => {
    loading.value = true
    try {
        const response = await axios.put('/api/index/', homeData)
        if (response.data.code === 200) {
            ElMessage.success('保存成功')
            // 更新原始数据
            originalData.value = { ...homeData }
        } else {
            ElMessage.error('保存失败')
        }
    } catch (error) {
        console.error('Error saving home data:', error)
        ElMessage.error('保存失败')
    } finally {
        loading.value = false
    }
}

// 重置单个字段
const resetField = (field: keyof HomeData) => {
    if (originalData.value) {
        (homeData as any)[field] = (originalData.value as any)[field]
    }
}

onMounted(() => {
    fetchHomeData()
})
</script>

<style scoped>
.page-container {
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.page-header {
    border-bottom: 1px solid #dcdfe6;
    padding-bottom: 20px;
    margin-bottom: 20px;
}

.page-title {
    font-size: 18px;
    color: #303133;
}

.form-item {
    margin-bottom: 20px;
}

.form-item label {
    display: block;
    margin-bottom: 10px;
    font-weight: bold;
}

.reset-btn {
    margin-top: 10px;
    padding: 8px 15px;
    background-color: #f56c6c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.save-btn {
    padding: 8px 15px;
    background-color: #67c23a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.image-upload-list {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.image-item {
    width: 100px;
    height: 100px;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fafafa;
}

.add-btn {
    width: 100px;
    height: 100px;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fafafa;
    font-size: 24px;
    color: #8c939d;
    cursor: pointer;
}
</style>