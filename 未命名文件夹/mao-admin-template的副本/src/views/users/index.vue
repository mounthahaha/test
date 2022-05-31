<template>
  <el-card class="users" v-loading="loading">
    <div class="box-header">
      <el-input v-model="input" placeholder="请输入ID或昵称或手机号" />
      <el-button type="primary" @click="searchUser">查询用户</el-button>
      <el-button type="warning" @click="clearSearch">清空搜索条件</el-button>
    </div>
    <div class="title"><span>共{{ totalUsers }}个用户</span></div>
    <el-table :data="listData" style="width: 100%" border stripe>
      <el-table-column fixed prop="id" label="ID" width="50" />
      <el-table-column fixed prop="nickname" label="昵称" width="150" />
      <el-table-column prop="balance" label="余额" width="100" v-slot="{ row, column, $index }">
        {{ row.balance }}元
      </el-table-column>>
      <el-table-column prop="phone" label="号码" width="150" v-slot="{ row, column, $index }">
        {{ row.phone ? row.phone : '未填写' }}
      </el-table-column>>
      <el-table-column prop="gold" label="金币" width="80" />
      <el-table-column prop="diamond" label="钻石" width="80" />
      <el-table-column prop="superior" label="上级" width="80" />
      <el-table-column prop="share" label="下级" width="80" />
      <el-table-column prop="status" label="状态" v-slot="{ row, column, $index }" width="150">
        <el-switch disabled v-model="row.status" active-text="正常" inactive-text="禁用" :active-value="1"
          :inactive-value="0" />
      </el-table-column>>
      <el-table-column prop="status" label="操作" v-slot="{ row, column, $index }" width="280">
        <el-button type="warning" round @click="openEditDialog(row)">编辑</el-button>
        <el-button type="info" round @click="checkShares(row)">查询下级</el-button>
        <el-button type="danger" round @click="deledeItem(row)">删除</el-button>
      </el-table-column>>
      <el-table-column prop="birthday" label="生日" width="120" v-slot="{ row, column, $index }">
        {{ row.birthday ? dayjs(row.birthday).format('YYYY-MM-DD') : '未填写' }}
      </el-table-column>>
      <el-table-column prop="ctime" label="创建时间" width="180" v-slot="{ row, column, $index }">
        {{ dayjs(row.ctime).format('YYYY-MM-DD HH:mm:ss') }}
      </el-table-column>>
      <el-table-column prop="utime" label="更新时间" width="180" v-slot="{ row, column, $index }">
        {{ dayjs(row.utime).format('YYYY-MM-DD HH:mm:ss') }}
      </el-table-column>
    </el-table>
    <!-- 编辑 -->
    <el-dialog v-model="dialogEditFormVisible" title="编辑用户">
      <el-form :model="editForm">
        <el-form-item label="昵称" label-width="100px">
          <el-input v-model="editForm.nickname" autocomplete="off" />
        </el-form-item>
        <el-form-item label="余额(单位元)" label-width="100px">
          <el-input v-model="editForm.balance" autocomplete="off" />
        </el-form-item>
        <el-form-item label="号码" label-width="100px">
          <el-input v-model="editForm.phone" autocomplete="off" />
        </el-form-item>
        <el-form-item label="上级" label-width="100px">
          <el-input v-model="editForm.superior" autocomplete="off" />
        </el-form-item>
        <el-form-item label="签名" label-width="100px">
          <el-input v-model="editForm.signature" autocomplete="off" />
        </el-form-item>
        <el-form-item label="理由" label-width="100px">
          <el-input v-model="editForm.reason" autocomplete="off" />
        </el-form-item>
        <el-form-item label="" label-width="100px">
          <el-switch v-model="editForm.status" active-text="正常" inactive-text="禁用" :active-value="1"
            :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogEditFormVisible = false">取消</el-button>
          <el-button type="primary" @click="editConfirm">确认</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 查看下级 -->
    <el-dialog v-model="dialogCheckFormVisible" title="查看下级 ">
      <el-table :data="shareData" style="width: 100%" border stripe>
        <el-table-column fixed prop="id" label="ID" width="50" />
        <el-table-column fixed prop="nickname" label="昵称" width="150" />
        <el-table-column prop="share" label="下级" width="80" />
        <el-table-column prop="phone" label="号码" width="150" v-slot="{ row, column, $index }">
          {{ row.phone ? row.phone : '未填写' }}
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="dialogCheckFormVisible = false">确认</el-button>
        </span>
      </template>
    </el-dialog>
    <el-pagination v-model:currentPage="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
      background layout="total, sizes, prev, pager, next, jumper" :total="totalUsers" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" @next-click='handleCurrentChange' @prev-click='handleCurrentChange' />
  </el-card>
</template>

<script setup lang='ts'>
import { getUsersList, deleteAllUsers, deleteUser, updataUser, checkUserShare, checkUserSuperior } from '@/api/users';
import dayjs from 'dayjs'
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus';


const loading = ref(true)
const input = ref('')

//获取数据
const listData = ref(null)
const totalUsers = ref(0)
const ongetUsersList = () => {
  listData.value = null
  // totalUsers.value = 0   不能改变这个值不然会触发分页重新起算页数
  loading.value = true
  getUsersList({
    page: currentPage.value, limit: pageSize.value, title: input.value
  }).then(res => {
    console.log(res);
    listData.value = res.data.list
    totalUsers.value = res.data.total
    loading.value = false
  })
}
//搜索 
const searchUser = () => {
  ongetUsersList()
}
const clearSearch = () => {
  input.value = ''
  ongetUsersList()
}
//分页
const currentPage = ref(1)
const pageSize = ref(10)

const handleSizeChange = (val: number) => {
  ongetUsersList()
}
const handleCurrentChange = (val: number) => {
  ongetUsersList()
}


ongetUsersList()

//编辑逻辑 
const dialogEditFormVisible = ref(false)
const editForm = reactive({
  "birthday": 0,
  "identifier": "",
  "bk_image": null,
  "utime": 0,
  "sex": 0,
  "avatar": null,
  "experience": 0,
  "expireds": 0,
  "gold": 0,
  "uid": "",
  "diamond": 0,
  "superior": "",
  "balance": "",
  "phone": null,
  "nickname": "",
  "follws": 0,
  "ctime": 0,
  "share": 0,
  "id": 0,
  "invite": null,
  "status": 0,
  signature:'',
  reason:''
})
const openEditDialog = (data) => {
  dialogEditFormVisible.value = true
  for (let key in data) {
    if (key === 'superior' && data[key] === '无') {
      data[key] =0
    } else {
      editForm[key] = data[key]
    }
  }
}
const editConfirm = async () => {
  try {
    await updataUser(editForm)
    ElMessage.success('修改成功')
    ongetUsersList()
    dialogEditFormVisible.value = false
  } catch (error) {
    dialogEditFormVisible.value = false
  }

}


//查询下级 
const dialogCheckFormVisible = ref(false)
const shareData = ref(null)
const checkShares = async (userData) => {
  shareData.value = null
  dialogCheckFormVisible.value = true
  const { data } = await checkUserShare(userData.id)
  shareData.value = data.list
}


//删除逻辑
const deledeItem = async (data) => {
  ElMessageBox.confirm(
    `是否确定删除${data.nickname}`,
    {
      confirmButtonText: '确认删除',
      confirmButtonClass: 'confirm-button-delele-class',
      cancelButtonText: '取消',
      center: true,
    }
  )
    .then(async () => {
      deleteUser(data).then(() => {
        ongetUsersList()
        ElMessage({
          type: 'success',
          message: '删除成功'
        })
      })
    })
}

</script>




<style lang='scss' scoped>
.users {
  min-height: 100%;

  .box-header {
    display: flex;
    padding-bottom: 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid #cccccc;

    .el-input {
      margin-right: 1px;
      width: auto;
    }
  }

  .title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 20px;
  }

}
</style>