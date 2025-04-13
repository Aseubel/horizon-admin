<template>
    <div class="page-container">
        <div class="page-header">
            <h1 class="page-title">当前标题页名称：设备管理</h1>
            <div class="header-actions">
                <el-select v-model="currentType" placeholder="选择设备类型" @change="fetchDevices">
                    <el-option v-for="type in deviceTypes" :key="type.typeId" :label="type.typeName" :value="type" />
                </el-select>
                <el-button type="primary" @click="openAddDialog">添加设备</el-button>
            </div>
        </div>

        <!-- 调试信息 -->
        <div class="debug-info">
            <p>当前类型名称: {{ currentType?.typeName || '未选择' }}</p>
            <p>当前类型ID: {{ currentType?.typeId || '未选择' }}</p>
            <p>设备数量: {{ devices.length }}</p>
            <p>加载状态: {{ loading ? '加载中' : '已加载' }}</p>
        </div>

        <div class="page-content" v-loading="loading">
            <!-- 设备列表 -->
            <el-empty v-if="!loading && (!devices || devices.length === 0)" description="暂无数据"></el-empty>
            <el-table v-else :data="devices" style="width: 100%">
                <el-table-column prop="image" label="图片" width="120">
                    <template #default="scope">
                        <el-image style="width: 100px; height: 60px"
                            :src="scope.row.image || 'https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png'"
                            fit="cover" :preview-src-list="scope.row.image ? [scope.row.image] : []">
                        </el-image>
                    </template>
                </el-table-column>
                <el-table-column prop="deviceName" label="设备名称" />
                <el-table-column prop="introduction" label="设备介绍" />
                <el-table-column prop="link" label="链接" width="120">
                    <template #default="scope">
                        <el-link v-if="scope.row.link" :href="scope.row.link" target="_blank"
                            type="primary">查看详情</el-link>
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

        <!-- 添加/编辑设备对话框 -->
        <el-dialog :title="dialogTitle" v-model="dialogVisible" width="50%" :before-close="handleDialogClose">
            <el-form :model="deviceForm" label-width="100px">
                <el-form-item label="设备名称">
                    <el-input v-model="deviceForm.deviceName" placeholder="请输入设备名称" />
                </el-form-item>
                <el-form-item label="类型">
                    <el-select v-model="deviceForm.typeId" placeholder="选择设备类型">
                        <el-option v-for="type in deviceTypes" :key="type.typeId" :label="type.typeName"
                            :value="type.typeId" />
                    </el-select>
                </el-form-item>
                <el-form-item label="设备介绍">
                    <el-input v-model="deviceForm.introduction" type="textarea" :rows="4" placeholder="请输入设备介绍" />
                </el-form-item>
                <el-form-item label="链接">
                    <el-input v-model="deviceForm.link" placeholder="请输入设备链接" />
                </el-form-item>
                <el-form-item label="图片">
                    <el-upload class="image-uploader" action="/api/file/upload" :show-file-list="false"
                        :on-success="handleImageSuccess" :before-upload="beforeImageUpload">
                        <img v-if="deviceForm.image" :src="deviceForm.image" class="device-image" />
                        <el-icon v-else class="image-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="cancelEdit">取消</el-button>
                    <el-button type="primary" @click="saveDevice">确定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 删除确认对话框 -->
        <el-dialog title="确认删除" v-model="deleteDialogVisible" width="30%">
            <span>确定要删除设备 "{{ deviceToDelete?.deviceName }}" 吗？</span>
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
import { Plus } from '@element-plus/icons-vue'
import axios from '../api/request'

// 接口类型定义
interface DeviceType {
    typeId: string;
    pageId: string;
    typeName: string;
}

interface Device {
    deviceId: string;
    typeId: string;
    deviceName: string;
    image: string;
    introduction: string;
    link: string;
}

// 状态变量
const loading = ref(false)
const devices = ref<Device[]>([])
const deviceTypes = ref<DeviceType[]>([])
const currentType = ref<DeviceType>()
const dialogVisible = ref(false)
const dialogTitle = ref('添加设备')
const deleteDialogVisible = ref(false)
const deviceToDelete = ref<Device | null>(null)
const isEdit = ref(false)
const originalImage = ref('')

// 表单数据
const deviceForm = reactive<Device>({
    deviceId: '',
    typeId: '',
    deviceName: '',
    image: '',
    introduction: '',
    link: ''
})

// 获取设备类型列表
const fetchDeviceTypes = async () => {
    loading.value = true
    try {
        const response = await axios.get('/api/device/type?pageId=5')

        if (response.data.code === 0 || response.data.code === 200) {
            deviceTypes.value = response.data.data || []

            if (deviceTypes.value.length > 0) {
                currentType.value = deviceTypes.value[0]
                fetchDevices()
            } else {
                loading.value = false
            }
        } else {
            console.error('获取设备类型失败:', response.data)
            ElMessage.error('获取设备类型失败')
            loading.value = false
        }
    } catch (error) {
        console.error('Error fetching device types:', error)
        ElMessage.error('获取设备类型失败')
        loading.value = false
    }
}

// 获取设备列表
const fetchDevices = async () => {
    if (!currentType?.value?.typeId) {
        console.log('当前类型ID为空，不获取设备列表')
        return
    }

    loading.value = true
    try {
        const response = await axios.get(`/api/device?typeId=${currentType?.value.typeId}`)

        if (response.data.code === 0 || response.data.code === 200) {
            devices.value = response.data.data || []
            devices.value.forEach((device) => {
                device.image = "http://127.0.0.1:611/api/file/picture?filePath=" + device.image
            })
        } else {
            console.error('获取设备列表失败:', response.data)
            ElMessage.error('获取设备列表失败')
        }
    } catch (error) {
        console.error('Error fetching devices:', error)
        ElMessage.error('获取设备列表失败')
    } finally {
        loading.value = false
    }
}

// 获取设备详情
const fetchDeviceDetail = async (deviceId: string) => {
    loading.value = true
    try {
        const response = await axios.get(`/api/device/detail?deviceId=${deviceId}`)
        if (response.data.code === 200) {
            Object.assign(deviceForm, response.data.data)
            deviceForm.image = "http://127.0.0.1:611/api/file/picture?filePath=" + deviceForm.image
        } else {
            ElMessage.error('获取设备详情失败')
        }
    } catch (error) {
        console.error('Error fetching device detail:', error)
        ElMessage.error('获取设备详情失败')
    } finally {
        loading.value = false
    }
}

// 打开添加对话框
const openAddDialog = () => {
    isEdit.value = false
    dialogTitle.value = '添加设备'
    resetForm()
    originalImage.value = '' // 清空原始图片
    dialogVisible.value = true
}

// 处理编辑
const handleEdit = async (row: Device) => {
    isEdit.value = true
    dialogTitle.value = '编辑设备'
    await fetchDeviceDetail(row.deviceId)
    originalImage.value = deviceForm.image // 保存原始图片路径
    dialogVisible.value = true
}

// 处理删除
const handleDelete = (row: Device) => {
    deviceToDelete.value = row
    deleteDialogVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
    if (!deviceToDelete.value) return

    loading.value = true
    try {
        const response = await axios.delete(`/api/device?deviceId=${deviceToDelete.value.deviceId}`)
        if (response.data.code === 200) {
            ElMessage.success('删除成功')
            fetchDevices()
        } else {
            ElMessage.error('删除失败')
        }
    } catch (error) {
        console.error('Error deleting device:', error)
        ElMessage.error('删除失败')
    } finally {
        loading.value = false
        deleteDialogVisible.value = false
    }
}

// 保存设备
const saveDevice = async () => {
    loading.value = true
    try {
        let response
        deviceForm.image = substringFrom(deviceForm.image, "autogo")
        if (isEdit.value) {
            response = await axios.put('/api/device/update', deviceForm)
            // 如果编辑时更换了图片且保存成功，删除旧图片
            if (response.data.code === 200 && originalImage.value && originalImage.value !== deviceForm.image) {
                deleteUploadedImage(originalImage.value)
            }
        } else {
            response = await axios.post('/api/device', deviceForm)
        }

        if (response.data.code === 200) {
            ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
            dialogVisible.value = false
            fetchDevices()
        } else {
            ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
            // 如果保存失败，删除新上传的图片
            if (!isEdit.value && deviceForm.image) {
                deleteUploadedImage(deviceForm.image)
            } else if (isEdit.value && deviceForm.image !== originalImage.value) {
                deleteUploadedImage(deviceForm.image)
            }
        }
    } catch (error) {
        console.error('Error saving device:', error)
        ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
    } finally {
        loading.value = false
    }
}

// 重置表单
const resetForm = () => {
    Object.assign(deviceForm, {
        deviceId: '',
        typeId: currentType?.value?.typeId,
        deviceName: '',
        image: '',
        introduction: '',
        link: ''
    })
}

// 图片上传成功回调
const handleImageSuccess = (response: any) => {
    console.log('图片上传成功:', response)
    deviceForm.image = "http://127.0.0.1:611/api/file/picture?filePath=" + response.data
}

// 图片上传前验证
const beforeImageUpload = (file: File) => {
    const isImage = file.type.startsWith('image/')
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isImage) {
        ElMessage.error('上传文件只能是图片格式!')
    }
    if (!isLt2M) {
        ElMessage.error('上传图片大小不能超过 2MB!')
    }
    return isImage && isLt2M
}

// 取消编辑，如果上传了新图片但未保存，则删除该图片
const cancelEdit = () => {
    if (!isEdit.value && deviceForm.image) {
        // 如果是新增且上传了图片，删除图片
        deleteUploadedImage(deviceForm.image)
    } else if (isEdit.value && deviceForm.image !== originalImage.value) {
        // 如果是编辑且更换了图片，删除新上传的图片
        deleteUploadedImage(deviceForm.image)
    }
    dialogVisible.value = false
}

// 对话框关闭前的钩子
const handleDialogClose = (done: () => void) => {
    cancelEdit()
    done()
}

function substringFrom(str: string, subStr: string) {
    const index = str.indexOf(subStr);
    if (index === -1) return ''; // 如果子串不存在，返回空字符串
    return str.substring(index); // 从子串位置开始截取到末尾
}

// 删除已上传但未保存的图片
const deleteUploadedImage = async (imagePath: string) => {
    if (!imagePath) return

    try {
        console.log('删除未保存的图片:', imagePath)
        await axios.delete(`/api/file/delete?filePath=${substringFrom(imagePath, "autogo")}`)
        console.log('图片删除成功')
    } catch (error) {
        console.error('删除图片失败:', error)
    }
}

// 页面加载时获取数据
onMounted(() => {
    fetchDeviceTypes()
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

.image-uploader {
    width: 300px;
    height: 180px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.image-uploader:hover {
    border-color: #409EFF;
}

.image-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 300px;
    height: 180px;
    line-height: 180px;
    text-align: center;
}

.device-image {
    width: 300px;
    height: 180px;
    display: block;
    object-fit: cover;
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