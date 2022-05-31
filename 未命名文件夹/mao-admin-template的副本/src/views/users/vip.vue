<template>
  <el-card class="users" v-loading="loading">
    <div class="box-header">
      <el-input v-model="input" placeholder="请输入ID或昵称或手机号" />
      <el-button type="primary" @click="searchUser">查询</el-button>
      <el-button type="warning" @click="clearSearch">清空搜索条件</el-button>
      <el-button style="margin-left:50px;" type="success" @click="openDialogAddForm">添加会员</el-button>
    </div>
    <div class="title"><span>共{{ totals }}个会员</span></div>
    <el-table :data="listData" style="width: 100%" border stripe>
      <el-table-column fixed prop="id" label="ID" width="50" />
      <el-table-column fixed prop="nickname" label="昵称" width="150" />
      <el-table-column prop="expireds" label="过期时间" width="180" v-slot="{ row, column, $index }">
        {{ dayjs(row.expireds).format('YYYY-MM-DD HH:mm:ss') }}
      </el-table-column>>
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
      <!-- <el-table-column prop="status" label="操作" v-slot="{ row, column, $index }" width="280">
        <el-button type="danger" round @click="deledeItem(row)">删除</el-button>
      </el-table-column>> -->
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
    <el-pagination v-model:currentPage="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
      background layout="total, sizes, prev, pager, next, jumper" :total="totals" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" @next-click='handleCurrentChange' @prev-click='handleCurrentChange' />
    <!-- 新增 -->
    <el-dialog v-model="dialogAddFormVisible" title="添加会员">
      <el-form>
        <el-form-item label="会员ID" label-width="100px">
          <el-input v-model="addForm.id" autocomplete="off" />
        </el-form-item>
        <el-form-item label="到期时间" label-width="100px">
          <el-date-picker v-model="addForm.date" type="date" format="YYYY/MM/DD" value-format="YYYY-MM-DD"
            placeholder="请选择" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogAddFormVisible = false">取消</el-button>
          <el-button type="primary" @click="onAddVip()">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang='ts'>
import { getVipList, cleanVip, vipAdd } from '@/api/users';
import dayjs from 'dayjs'
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus';
const input = ref('')
const loading = ref(true)
//搜索 
const searchUser = () => {
  ongetSmsRecordsList()
}
const clearSearch = () => {
  input.value = ''
  ongetSmsRecordsList()
}
//分页
const currentPage = ref(1)
const pageSize = ref(10)

const handleSizeChange = (val: number) => {
  ongetSmsRecordsList()
}
const handleCurrentChange = (val: number) => {
  ongetSmsRecordsList()
}

//请求数据
const listData = ref(null)
const totals = ref(0)
const ongetSmsRecordsList = () => {
  loading.value = true
  listData.value = null
  getVipList({
    page: currentPage.value, limit: pageSize.value, title: input.value
  }).then(res => {
    loading.value = false
    console.log(res);
    listData.value = res.data.list
    totals.value = res.data.total
  })
}

ongetSmsRecordsList()

//新增逻辑     
const dialogAddFormVisible = ref(false)
let addForm = reactive({
  id: '',
  date: ''
})

const openDialogAddForm = () => {
  dialogAddFormVisible.value = true
  //手动重置每次打开
  addForm.id = '',
    addForm.date = ''
}

const onAddVip = () => {
  vipAdd(addForm).then(() => {
    ElMessage.success('新增成功')
    ongetSmsRecordsList()
    dialogAddFormVisible.value = false
  }).catch(() => {
    dialogAddFormVisible.value = false
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