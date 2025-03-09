<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">当前标题页名称：团队管理</h1>
      <div class="header-actions">
        <el-select v-model="currentType" placeholder="选择成员类型" @change="fetchMembers">
          <el-option v-for="type in memberTypes" :key="type.typeId" :label="type.typeName" :value="type" />
        </el-select>
        <el-button type="primary" @click="openAddDialog">添加成员</el-button>
      </div>
    </div>

    <!-- 选择框不显示内容，故添加调试信息 -->
    <div class="debug-info">
      <p>当前类型名称: {{ currentType?.typeName || '未选择' }}</p>
      <p>当前类型ID: {{ currentType?.typeId || '未选择' }}</p>
      <p>成员数量: {{ members.length }}</p>
      <p>加载状态: {{ loading ? '加载中' : '已加载' }}</p>
    </div>

    <div class="page-content" v-loading="loading">
      <!-- 成员列表 -->
      <el-empty v-if="!loading && (!members || members.length === 0)" description="暂无数据"></el-empty>
      <el-table v-else :data="members" style="width: 100%">
        <el-table-column prop="image" label="照片" width="100">
          <template #default="scope">
            <el-avatar :size="60"
              :src="scope.row.image || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
          </template>
        </el-table-column>
        <el-table-column prop="memberName" label="姓名" width="120" />
        <el-table-column prop="major" label="专业方向" />
        <el-table-column prop="grade" label="年级" width="100" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑成员对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="50%" :before-close="handleDialogClose">
      <el-form :model="memberForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="memberForm.memberName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="memberForm.typeId" placeholder="选择成员类型">
            <el-option v-for="type in memberTypes" :key="type.typeId" :label="type.typeName" :value="type.typeId" />
          </el-select>
        </el-form-item>
        <el-form-item label="专业方向">
          <el-input v-model="memberForm.major" placeholder="请输入专业方向" />
        </el-form-item>
        <el-form-item label="年级">
          <el-input v-model="memberForm.grade" placeholder="请输入年级" />
        </el-form-item>
        <el-form-item label="个人经历">
          <el-input v-model="memberForm.experience" type="textarea" :rows="4" placeholder="请输入个人经历" />
        </el-form-item>
        <el-form-item label="照片">
          <el-upload class="avatar-uploader" action="/api/file/upload" :show-file-list="false"
            :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
            <img v-if="memberForm.image" :src="memberForm.image" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="GitHub">
          <el-input v-model="memberForm.github" placeholder="请输入GitHub链接" />
        </el-form-item>
        <el-form-item label="个人博客">
          <el-input v-model="memberForm.blog" placeholder="请输入个人博客链接" />
        </el-form-item>
        <el-form-item label="哔哩哔哩">
          <el-input v-model="memberForm.bilibili" placeholder="请输入哔哩哔哩链接" />
        </el-form-item>
        <el-form-item label="CSDN">
          <el-input v-model="memberForm.csdn" placeholder="请输入CSDN链接" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="saveMember">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog title="确认删除" v-model="deleteDialogVisible" width="30%">
      <span>确定要删除成员 {{ memberToDelete?.memberName }} 吗？</span>
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
import { ElMessage, ElEmpty } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import axios from '../api/request'

// 接口类型定义
interface MemberType {
  typeId: string;
  pageId: string;
  typeName: string;
}

interface Member {
  memberId: string;
  typeId: string;
  memberName: string;
  grade: string | number;
  major: string;
  experience: string;
  entryTime: string;
  image: string;
  github: string;
  blog: string;
  bilibili: string;
  csdn: string;
}

// 状态变量
const loading = ref(false)
const members = ref<Member[]>([])
const memberTypes = ref<MemberType[]>([])
const currentType = ref<MemberType>()
const dialogVisible = ref(false)
const dialogTitle = ref('添加成员')
const deleteDialogVisible = ref(false)
const memberToDelete = ref<Member | null>(null)
const isEdit = ref(false)
const originalImage = ref('')

// 表单数据
const memberForm = reactive<Member>({
  memberId: '',
  typeId: '',
  memberName: '',
  grade: '',
  major: '',
  experience: '',
  entryTime: '',
  image: '',
  github: '',
  blog: '',
  bilibili: '',
  csdn: ''
})

// 获取成员类型列表
const fetchMemberTypes = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/member/type?pageId=2')

    if (response.data.code === 0 || response.data.code === 200) {
      memberTypes.value = response.data.data || []

      if (memberTypes.value.length > 0) {
        currentType.value = memberTypes.value[0]
        fetchMembers()
      } else {
        loading.value = false
      }
    } else {
      console.error('获取成员类型失败:', response.data)
      ElMessage.error('获取成员类型失败')
      loading.value = false
    }
  } catch (error) {
    console.error('Error fetching member types:', error)
    ElMessage.error('获取成员类型失败')
    loading.value = false
  }
}

// 获取成员列表
const fetchMembers = async () => {
  if (!currentType?.value?.typeId) {
    console.log('当前类型ID为空，不获取成员列表')
    return
  }

  loading.value = true
  try {
    const response = await axios.get(`/api/member/?typeId=${currentType?.value.typeId}`)

    if (response.data.code === 0 || response.data.code === 200) {
      members.value = response.data.data || []
    } else {
      console.error('获取成员列表失败:', response.data)
      ElMessage.error('获取成员列表失败')
    }
  } catch (error) {
    console.error('Error fetching members:', error)
    ElMessage.error('获取成员列表失败')
  } finally {
    loading.value = false
  }
}

// 获取成员详情
const fetchMemberDetail = async (memberId: string) => {
  loading.value = true
  try {
    const response = await axios.get(`/api/member/detail?memberId=${memberId}`)
    if (response.data.code === 200) {
      Object.assign(memberForm, response.data.data)
    } else {
      ElMessage.error('获取成员详情失败')
    }
  } catch (error) {
    console.error('Error fetching member detail:', error)
    ElMessage.error('获取成员详情失败')
  } finally {
    loading.value = false
  }
}

// 打开添加对话框
const openAddDialog = () => {
  isEdit.value = false
  dialogTitle.value = '添加成员'
  resetForm()
  originalImage.value = '' // 清空原始图片
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = async (row: Member) => {
  isEdit.value = true
  dialogTitle.value = '编辑成员'
  await fetchMemberDetail(row.memberId)
  originalImage.value = memberForm.image // 保存原始图片路径
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row: Member) => {
  memberToDelete.value = row
  deleteDialogVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!memberToDelete.value) return

  loading.value = true
  try {
    const response = await axios.delete(`/api/member/?memberId=${memberToDelete.value.memberId}`)
    if (response.data.code === 200) {
      ElMessage.success('删除成功')
      fetchMembers()
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    console.error('Error deleting member:', error)
    ElMessage.error('删除失败')
  } finally {
    loading.value = false
    deleteDialogVisible.value = false
  }
}

// 保存成员
const saveMember = async () => {
  loading.value = true
  try {
    let response
    if (isEdit.value) {
      response = await axios.put('/api/member/update', memberForm)
      // 如果编辑时更换了图片且保存成功，删除旧图片
      if (response.data.code === 200 && originalImage.value && originalImage.value !== memberForm.image) {
        deleteUploadedImage(originalImage.value)
      }
    } else {
      response = await axios.post('/api/member/', memberForm)
    }

    if (response.data.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
      dialogVisible.value = false
      fetchMembers()
    } else {
      ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
      // 如果保存失败，删除新上传的图片
      if (!isEdit.value && memberForm.image) {
        deleteUploadedImage(memberForm.image)
      } else if (isEdit.value && memberForm.image !== originalImage.value) {
        deleteUploadedImage(memberForm.image)
      }
    }
  } catch (error) {
    console.error('Error saving member:', error)
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(memberForm, {
    memberId: '',
    typeId: currentType?.value?.typeId,
    memberName: '',
    grade: '',
    major: '',
    experience: '',
    entryTime: '',
    image: '',
    github: '',
    blog: '',
    bilibili: '',
    csdn: ''
  })
}

// 头像上传成功回调
const handleAvatarSuccess = (response: any) => {
  console.log('头像上传成功:', response)
  memberForm.image = response.data
}

// 头像上传前验证
const beforeAvatarUpload = (file: File) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('上传头像图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 取消编辑，如果上传了新图片但未保存，则删除该图片
const cancelEdit = () => {
  if (!isEdit.value && memberForm.image) {
    // 如果是新增且上传了图片，删除图片
    deleteUploadedImage(memberForm.image)
  } else if (isEdit.value && memberForm.image !== originalImage.value) {
    // 如果是编辑且更换了图片，删除新上传的图片
    deleteUploadedImage(memberForm.image)
  }
  dialogVisible.value = false
}

// 对话框关闭前的钩子
const handleDialogClose = (done: () => void) => {
  cancelEdit()
  done()
}

// 删除已上传但未保存的图片
const deleteUploadedImage = async (imagePath: string) => {
  if (!imagePath) return

  try {
    console.log('删除未保存的图片:', imagePath)
    await axios.delete(`/api/file/delete?filePath=${encodeURIComponent(imagePath)}`)
    console.log('图片删除成功')
  } catch (error) {
    console.error('删除图片失败:', error)
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchMemberTypes()
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

.avatar-uploader {
  width: 178px;
  height: 178px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

/* 添加调试信息样式 */
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