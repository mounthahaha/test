<template>
  <el-card v-loading="loading" class="pay-config">
    <div class="box-header">
      <el-input v-model="input" placeholder="请输入ID或手机号" />
      <el-button type="primary" @click="searchUser">查询</el-button>
      <el-button type="warning" @click="clearSearch">清空搜索条件</el-button>
      <el-button style="margin-left:50px;" type="success" @click="openDialogAddForm">新增</el-button>
    </div>
    <div class="title"><span>共{{ totals }}个条记录</span></div>
    <el-table :data="listData" style="width: 100%" border stripe>
      <el-table-column prop="id" label="ID" width="50" />
      <el-table-column prop="title" label="标题" width="120" />
      <el-table-column prop="secretKey" label="秘钥" width="120" />
      <el-table-column prop="mchId" label="商户ID" width="120" />
      <el-table-column prop="domain" label="域名" width="120" />
      <el-table-column prop="notifyUrl" label="同步通知地址" width="120" />
      <el-table-column prop="callbackUrl" label="异步通知地址" width="120" />
      <el-table-column prop="errorUrl" label="错误返回地址" width="120" />
      <el-table-column prop="status" label="状态" v-slot="{ row, column, $index }" width="150">
        <el-switch disabled v-model="row.status" active-text="显示" inactive-text="禁用" :active-value="1"
          :inactive-value="0" active-color="#13ce66" inactive-color="#ff4949" />
      </el-table-column>>
      <el-table-column prop="status" label="操作" v-slot="{ row, column, $index }" width="180">
        <el-button type="warning" round @click="openEditDialog(row)">编辑</el-button>
        <el-button type="danger" round @click="deledeItem(row)">删除</el-button>
      </el-table-column>>
      <el-table-column prop="ctime" label="创建时间" width="180" v-slot="{ row, column, $index }">
        {{ dayjs(row.ctime).format('YYYY-MM-DD HH:mm:ss') }}
      </el-table-column>>
      <el-table-column prop="utime" label="更新时间" width="180" v-slot="{ row, column, $index }">
        {{ dayjs(row.utime).format('YYYY-MM-DD HH:mm:ss') }}
      </el-table-column>>
    </el-table>
    <el-pagination v-model:currentPage="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
      background layout="total, sizes, prev, pager, next, jumper" :total="totals" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" @next-click='handleCurrentChange' @prev-click='handleCurrentChange' />
    <!-- 新增 -->
    <el-dialog v-model="dialogAddFormVisible" title="新增支付方式">
      <el-form :model="addForm">
        <el-form-item label="标题" label-width="100px">
          <el-input v-model="addForm.title" autocomplete="off" />
        </el-form-item>
        <el-form-item label="秘钥" label-width="100px">
          <el-input v-model="addForm.secretKey" autocomplete="off" />
        </el-form-item>
        <el-form-item label="商户ID" label-width="100px">
          <el-input v-model="addForm.mchId" autocomplete="off" />
        </el-form-item>
        <el-form-item label="域名" label-width="100px">
          <el-input v-model="addForm.domain" autocomplete="off" />
        </el-form-item>
        <el-form-item label="同步通知地址" label-width="100px">
          <el-input v-model="addForm.notifyUrl" autocomplete="off" />
        </el-form-item>
         <el-form-item label="异步通知地址" label-width="100px">
          <el-input v-model="addForm.callbackUrl" autocomplete="off" />
        </el-form-item>
         <el-form-item label="错误通知地址" label-width="100px">
          <el-input v-model="addForm.errorUrl" autocomplete="off" />
        </el-form-item>
        <el-form-item label="" label-width="100px">
          <el-switch v-model="addForm.status" active-text="显示" inactive-text="隐藏" :active-value="1" :inactive-value="0"
            active-color="#13ce66" inactive-color="#ff4949" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogAddFormVisible = false">取消</el-button>
          <el-button type="primary" @click="onaddConfigPay">确认</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog v-model="dialogEditFormVisible" title="编辑用户">
      <el-form :model="editForm">
         <el-form-item label="标题" label-width="100px">
          <el-input v-model="editForm.title" autocomplete="off" />
        </el-form-item>
        <el-form-item label="秘钥" label-width="100px">
          <el-input v-model="editForm.secretKey" autocomplete="off" />
        </el-form-item>
        <el-form-item label="商户ID" label-width="100px">
          <el-input v-model="editForm.mchId" autocomplete="off" />
        </el-form-item>
        <el-form-item label="域名" label-width="100px">
          <el-input v-model="editForm.domain" autocomplete="off" />
        </el-form-item>
        <el-form-item label="同步通知地址" label-width="100px">
          <el-input v-model="editForm.notifyUrl" autocomplete="off" />
        </el-form-item>
         <el-form-item label="异步通知地址" label-width="100px">
          <el-input v-model="editForm.callbackUrl" autocomplete="off" />
        </el-form-item>
         <el-form-item label="错误通知地址" label-width="100px">
          <el-input v-model="editForm.errorUrl" autocomplete="off" />
        </el-form-item>
        <el-form-item label="" label-width="100px">
          <el-switch v-model="editForm.status" active-text="显示" inactive-text="隐藏" :active-value="1" :inactive-value="0"
            active-color="#13ce66" inactive-color="#ff4949" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogEditFormVisible = false">取消</el-button>
          <el-button type="primary" @click="editConfirm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang='ts'>
import { getConfigPayList, addConfigPay, deleteConfigPay, updateConfigPay } from '@/api/pay-center';
import dayjs from 'dayjs'
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus';


const input = ref('')
const loading = ref(true)
//搜索 
const searchUser = () => {
  ongetConfigPayList()
}
const clearSearch = () => {
  input.value = ''
  ongetConfigPayList()
}
//分页
const currentPage = ref(1)
const pageSize = ref(10)

const handleSizeChange = (val: number) => {
  ongetConfigPayList()
}
const handleCurrentChange = (val: number) => {
  ongetConfigPayList()
}

//请求数据
const listData = ref(null)
const totals = ref(0)
const ongetConfigPayList = () => {
  listData.value = null
  loading.value = true
  getConfigPayList({
    page: currentPage.value, limit: pageSize.value, title: input.value
  }).then(res => {
    console.log(res);
    listData.value = res.data.list
    totals.value = res.data.total
    loading.value = false
  })
}

ongetConfigPayList()


//新增逻辑     
const dialogAddFormVisible = ref(false)
let addForm = reactive({
  callbackUrl: '',
  domain: '',
  errorUrl: '',
  mchId: '',
  notifyUrl: '',
  secretKey: '',
  status: 1,
  title: '',

})

const openDialogAddForm = () => {
  dialogAddFormVisible.value = true
  //手动重置每次打开
  for (let key in addForm) {
    if (key === 'status') {
      addForm[key] = 1
    } else {
      addForm[key] = ''
    }
  }
}

const onaddConfigPay = () => {
  addConfigPay(addForm).then(() => {
    ElMessage.success('新增成功')
    ongetConfigPayList()
    dialogAddFormVisible.value = false
  }).catch(() => {
    dialogAddFormVisible.value = false
  })
}


//编辑逻辑 
const dialogEditFormVisible = ref(false)
const editForm = reactive({
  id: '',
  callbackUrl: '',
  domain: '',
  errorUrl: '',
  mchId: '',
  notifyUrl: '',
  secretKey: '',
  status: 0,
  title: '',
})
const openEditDialog = (data) => {
  for (let key in data) {
    editForm[key] = data[key]
  }
  dialogEditFormVisible.value = true
}
const editConfirm = async () => {
  try {
    await updateConfigPay(editForm)
    ElMessage.success('修改成功')
    ongetConfigPayList()
    dialogEditFormVisible.value = false
  } catch (error) {
    dialogEditFormVisible.value = false
  }
}


//删除逻辑
const deledeItem = async (data) => {
  ElMessageBox.confirm(
    `是否确定删除${data.title}`,
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      center: true,
    }
  )
    .then(async () => {
      deleteConfigPay(data).then(() => {
        ongetConfigPayList()
        ElMessage({
          type: 'success',
          message: '删除成功'
        })
      })
    })
}
</script>




<style lang='scss' scoped>
.pay-config {
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