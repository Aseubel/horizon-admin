<template>
    <div class="page-container">
        <div class="page-header">
            <h1 class="page-title">当前标题页名称：论文管理</h1>
            <div class="header-actions">
                <el-select v-model="currentType" placeholder="选择论文类型" @change="fetchTreatises">
                    <el-option v-for="type in treatiseTypes" :key="type.typeId" :label="type.typeName" :value="type" />
                </el-select>
                <el-button type="primary" @click="openAddDialog">添加论文</el-button>
            </div>
        </div>

        <!-- 调试信息 -->
        <div class="debug-info">
            <p>当前类型名称: {{ currentType?.typeName || '未选择' }}</p>
            <p>当前类型ID: {{ currentType?.typeId || '未选择' }}</p>
            <p>论文数量: {{ treatises.length }}</p>
            <p>加载状态: {{ loading ? '加载中' : '已加载' }}</p>
        </div>

        <div class="page-content" v-loading="loading">
            <!-- 论文列表 -->
            <el-empty v-if="!loading && (!treatises || treatises.length === 0)" description="暂无数据"></el-empty>
            <el-table v-else :data="treatises" style="width: 100%">
                <el-table-column prop="title" label="标题" />
                <el-table-column prop="author" label="作者" width="150" />
                <el-table-column prop="publish" label="发表期刊" width="200" />
                <el-table-column prop="link" label="链接" width="120">
                    <template #default="scope">
                        <el-link v-if="scope.row.link" :href="scope.row.link" target="_blank"
                            type="primary">查看论文</el-link>
                        <span v-else>暂无链接</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                    <template #default="scope">
                        <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 添加/编辑论文对话框 -->
        <el-dialog :title="dialogTitle" v-model="dialogVisible" width="50%" :before-close="handleDialogClose">
            <el-form :model="treatiseForm" label-width="100px">
                <el-form-item label="标题">
                    <el-input v-model="treatiseForm.title" placeholder="请输入论文标题" />
                </el-form-item>
                <el-form-item label="类型">
                    <el-select v-model="treatiseForm.typeId" placeholder="选择论文类型">
                        <el-option v-for="type in treatiseTypes" :key="type.typeId" :label="type.typeName"
                            :value="type.typeId" />
                    </el-select>
                </el-form-item>
                <el-form-item label="作者">
                    <el-input v-model="treatiseForm.author" placeholder="请输入作者" />
                </el-form-item>
                <el-form-item label="发表期刊">
                    <el-input v-model="treatiseForm.publish" placeholder="请输入发表期刊" />
                </el-form-item>
                <el-form-item label="链接">
                    <el-input v-model="treatiseForm.link" placeholder="请输入论文链接" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="cancelEdit">取消</el-button>
                    <el-button type="primary" @click="saveTreatise">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 删除确认对话框 -->
        <el-dialog title="确认删除" v-model="deleteDialogVisible" width="30%">
            <span>确定要删除论文 "{{ treatiseToDelete?.title }}" 吗？</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="deleteDialogVisible = false">取消</el-button>
                    <el-button type="danger" @click="confirmDelete">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from '../api/request'

// 接口类型定义
interface TreatiseType {
    typeId: string;
    pageId: string;
    typeName: string;
}

interface Treatise {
    treatiseId: string;
    typeId: string;
    title: string;
    author: string;
    publish: string;
    link: string;
}

// 状态变量
const loading = ref(false)
const treatises = ref<Treatise[]>([])
const treatiseTypes = ref<TreatiseType[]>([])
const currentType = ref<TreatiseType>()
const dialogVisible = ref(false)
const dialogTitle = ref('添加论文')
const deleteDialogVisible = ref(false)
const treatiseToDelete = ref<Treatise | null>(null)
const isEdit = ref(false)

// 表单数据
const treatiseForm = reactive<Treatise>({
    treatiseId: '',
    typeId: '',
    title: '',
    author: '',
    publish: '',
    link: ''
})

// 获取论文类型列表
const fetchTreatiseTypes = async () => {
    loading.value = true
    try {
        const response = await axios.get('/api/treatise/type?pageId=4')

        if (response.data.code === 0 || response.data.code === 200) {
            treatiseTypes.value = response.data.data || []

            if (treatiseTypes.value.length > 0) {
                currentType.value = treatiseTypes.value[0]
                fetchTreatises()
            } else {
                loading.value = false
            }
        } else {
            console.error('获取论文类型失败:', response.data)
            ElMessage.error('获取论文类型失败')
            loading.value = false
        }
    } catch (error) {
        console.error('Error fetching treatise types:', error)
        ElMessage.error('获取论文类型失败')
        loading.value = false
    }
}

// 获取论文列表
const fetchTreatises = async () => {
    if (!currentType?.value?.typeId) {
        console.log('当前类型ID为空，不获取论文列表')
        return
    }

    loading.value = true
    try {
        const response = await axios.get(`/api/treatise?typeId=${currentType?.value.typeId}`)

        if (response.data.code === 0 || response.data.code === 200) {
            treatises.value = response.data.data || []
        } else {
            console.error('获取论文列表失败:', response.data)
            ElMessage.error('获取论文列表失败')
        }
    } catch (error) {
        console.error('Error fetching treatises:', error)
        ElMessage.error('获取论文列表失败')
    } finally {
        loading.value = false
    }
}

// 获取论文详情
const fetchTreatiseDetail = async (treatiseId: string) => {
    loading.value = true
    try {
        const response = await axios.get(`/api/treatise/detail?treatiseId=${treatiseId}`)
        if (response.data.code === 200) {
            Object.assign(treatiseForm, response.data.data)
        } else {
            ElMessage.error('获取论文详情失败')
        }
    } catch (error) {
        console.error('Error fetching treatise detail:', error)
        ElMessage.error('获取论文详情失败')
    } finally {
        loading.value = false
    }
}

// 打开添加对话框
const openAddDialog = () => {
    isEdit.value = false
    dialogTitle.value = '添加论文'
    resetForm()
    dialogVisible.value = true
}

// 处理编辑
const handleEdit = async (row: Treatise) => {
    isEdit.value = true
    dialogTitle.value = '编辑论文'
    await fetchTreatiseDetail(row.treatiseId)
    dialogVisible.value = true
}

// 处理删除
const handleDelete = (row: Treatise) => {
    treatiseToDelete.value = row
    deleteDialogVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
    if (!treatiseToDelete.value) return

    loading.value = true
    try {
        const response = await axios.delete(`/api/treatise?treatiseId=${treatiseToDelete.value.treatiseId}`)
        if (response.data.code === 200) {
            ElMessage.success('删除成功')
            fetchTreatises()
        } else {
            ElMessage.error('删除失败')
        }
    } catch (error) {
        console.error('Error deleting treatise:', error)
        ElMessage.error('删除失败')
    } finally {
        loading.value = false
        deleteDialogVisible.value = false
    }
}

// 保存论文
const saveTreatise = async () => {
    loading.value = true
    try {
        let response
        if (isEdit.value) {
            response = await axios.put('/api/treatise/update', treatiseForm)
        } else {
            response = await axios.post('/api/treatise', treatiseForm)
        }

        if (response.data.code === 200) {
            ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
            dialogVisible.value = false
            fetchTreatises()
        } else {
            ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
        }
    } catch (error) {
        console.error('Error saving treatise:', error)
        ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
    } finally {
        loading.value = false
    }
}

// 重置表单
const resetForm = () => {
    Object.assign(treatiseForm, {
        treatiseId: '',
        typeId: currentType?.value?.typeId,
        title: '',
        author: '',
        publish: '',
        link: ''
    })
}

// 取消编辑
const cancelEdit = () => {
    dialogVisible.value = false
}

// 对话框关闭前的钩子
const handleDialogClose = (done: () => void) => {
    cancelEdit()
    done()
}

// 页面加载时获取数据
onMounted(() => {
    fetchTreatiseTypes()
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
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.page-title {
    font-size: 18px;
    color: #303133;
    margin: 0;
}

.header-actions {
    display: flex;
    gap: 10px;
}

/* 调试信息样式 */
.debug-info {
    margin: 10px 0;
    padding: 10px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
}

.debug-info p {
    margin: 5px 0;
    font-family: monospace;
}

/* 确保表格可见 */
.el-table {
    margin-top: 20px;
    width: 100% !important;
}

/* 确保内容区域有足够的高度 */
.page-content {
    min-height: 300px;
}
</style>