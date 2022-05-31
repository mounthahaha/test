<template>
  <el-card v-loading="loading" class="balance-center">
    <div class="box-header">
      <el-input v-model="input" placeholder="请输入ID或手机号" />
      <el-button type="primary" @click="searchUser">查询</el-button>
      <el-button type="warning" @click="clearSearch">清空搜索条件</el-button>
      <el-button style="margin-left:50px;" type="success" @click="openDialogAddForm">新增</el-button>
    </div>
    <div class="title"><span>共{{ totals }}个条记录</span></div>
    <el-table :data="listData" style="width: 100%" border stripe>
      <el-table-column prop="id" label="ID" width="50" />
      <el-table-column prop="amount" label="金额" width="120" v-slot="{ row, column, $index }">
        {{ row.amount }}元
      </el-table-column>>
      <el-table-column prop="status" label="状态" v-slot="{ row, column, $index }" width="80">
        <span v-if="row.status === 1" style="border: 1px solid green;color: green;padding: 2px;">有效</span>
        <span v-else style="border: 1px solid red;color: red;padding: 2px;">无效</span>
      </el-table-column>>
       <el-table-column prop="status" label="关联用户" v-slot="{ row, column, $index }" width="200">
        <div v-for="val,key in row.user">{{key + ':' +val }}</div>
      </el-table-column>>
      <el-table-column prop="reason" label="理由" width="150" />
      <el-table-column prop="status" label="操作" v-slot="{ row, column, $index }" width="180">
        <el-button type="warning" round @click="openEditDialog(row)">编辑</el-button>
        <el-button type="danger" round @click="deledeItem(row)">删除</el-button>
      </el-table-column>>
      <el-table-column prop="add_time" label="创建时间" width="180" v-slot="{ row, column, $index }">
        {{ dayjs(row.add_time).format('YYYY-MM-DD HH:mm:ss') }}
      </el-table-column>>
      <el-table-column prop="update_time" label="更新时间" width="180" v-slot="{ row, column, $index }">
        {{ dayjs(row.update_time).format('YYYY-MM-DD HH:mm:ss') }}
      </el-table-column>>
    </el-table>
    <el-pagination v-model:currentPage="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
      background layout="total, sizes, prev, pager, next, jumper" :total="totals" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" @next-click='handleCurrentChange' @prev-click='handleCurrentChange' />
    <!-- 新增 -->
    <el-dialog v-model="dialogAddFormVisible" title="新增余额订单">
      <el-form :model="addForm">
        <el-form-item label="用户ID" label-width="100px">
          <el-input v-model="addForm.uid" autocomplete="off" />
        </el-form-item>
        <el-form-item label="金额(单位元)" label-width="100px">
          <el-input v-model="addForm.amount" autocomplete="off" />
        </el-form-item>
        <el-form-item label="理由" label-width="100px">
          <el-input v-model="addForm.reason" autocomplete="off" />
        </el-form-item>
        <el-form-item label="状态" label-width="100px">
          <el-switch v-model="addForm.status" active-text="有效" inactive-text="无效" :active-value="1" :inactive-value="0"
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
       <el-form-item  label="关联用户ID" label-width="100px">
          <el-input disabled v-model="editForm.user.id" autocomplete="off" />
        </el-form-item>
       <el-form-item disabled label="关联用户" label-width="100px">
          <el-input disabled v-model="editForm.user.nickname" autocomplete="off" />
        </el-form-item>
        <el-form-item label="金额(单位元)" label-width="100px">
          <el-input v-model="editForm.amount" autocomplete="off" />
        </el-form-item>
        <el-form-item label="理由" label-width="100px">
          <el-input v-model="editForm.reason" autocomplete="off" />
        </el-form-item>
        <el-form-item label="状态" label-width="100px">
          <el-switch v-model="editForm.status" active-text="有效" inactive-text="无效" :active-value="1" :inactive-value="0"
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
import { getBalanceList, addBalance, deleteBalance, updateBalance } from '@/api/balance-center';
import dayjs from 'dayjs'
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus';


const input = ref('')
const loading = ref(true)
//搜索 
const searchUser = () => {
  ongetBalanceList()
}
const clearSearch = () => {
  input.value = ''
  ongetBalanceList()
}
//分页
const currentPage = ref(1)
const pageSize = ref(10)

const handleSizeChange = (val: number) => {
  ongetBalanceList()
}
const handleCurrentChange = (val: number) => {
  ongetBalanceList()
}

//请求数据
const listData = ref(null)
const totals = ref(0)
const ongetBalanceList = () => {
  listData.value = null
  loading.value = true
  getBalanceList({
    page: currentPage.value, limit: pageSize.value, title: input.value
  }).then(res => {
    console.log(res);
    listData.value = res.data.list
    totals.value = res.data.total
    loading.value = false
  })
}

ongetBalanceList()


//新增逻辑     
const dialogAddFormVisible = ref(false)
let addForm = reactive({
  amount: '',
  reason: '',
  status: 1,
  uid: '',
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
  addBalance(addForm).then(() => {
    ElMessage.success('新增成功')
    ongetBalanceList()
    dialogAddFormVisible.value = false
  }).catch(() => {
    dialogAddFormVisible.value = false
  })
}


//编辑逻辑 
const dialogEditFormVisible = ref(false)
const editForm = reactive({
  id: '',
   amount: '',
  reason: '',
  status: 1,
  user: {
    id:0,
    nickname:''
  },
  update_time:0,
  add_time:0,
})
const openEditDialog = (data) => {
  for (let key in data) {
    editForm[key] = data[key]
  }
  dialogEditFormVisible.value = true
}
const editConfirm = async () => {
  try {
    await updateBalance(editForm)
    ElMessage.success('修改成功')
    ongetBalanceList()
    dialogEditFormVisible.value = false
  } catch (error) {
    dialogEditFormVisible.value = false
  }
}


//删除逻辑
const deledeItem = async (data) => {
  ElMessageBox.confirm(
    `是否确定删除${data.id}`,
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      center: true,
    }
  )
    .then(async () => {
      deleteBalance(data).then(() => {
        ongetBalanceList()
        ElMessage({
          type: 'success',
          message: '删除成功'
        })
      })
    })
}

</script>




<style lang='scss' scoped>
.balance-center {
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