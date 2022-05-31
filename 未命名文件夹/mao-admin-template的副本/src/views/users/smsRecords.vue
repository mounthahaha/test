<template>
  <el-card class="sms-records">
    <div class="box-header">
      <el-input v-model="input" placeholder="请输入ID或手机号" />
      <el-button type="primary" @click="searchUser">查询</el-button>
      <el-button type="warning" @click="clearSearch">清空搜索条件</el-button>
    </div>
    <div class="title"><span>共{{ totals }}个条记录</span></div>
    <el-table :data="listData" style="width: 100%" border stripe>
      <el-table-column prop="id" label="ID" width="50" />
      <el-table-column prop="number" label="手机号码" width="180" />
      <el-table-column prop="ctime" label="创建时间" width="180" v-slot="{ row, column, $index }">
        {{ dayjs(row.ctime).format('YYYY-MM-DD HH:mm:ss') }}
      </el-table-column>>
      <el-table-column prop="data" label="详情" width="250" />
      <el-table-column prop="status" label="状态" v-slot="{ row, column, $index }" width="150">
        <el-result v-if="row.status == 1" icon="success" style="--el-result-icon-font-size:32px;padding:0">
        </el-result>
        <el-result v-else icon="error" style="--el-result-icon-font-size:32px;padding:0">
        </el-result>
      </el-table-column>>
    </el-table>
    <el-pagination v-model:currentPage="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
      background layout="total, sizes, prev, pager, next, jumper" :total="totals" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" @next-click='handleCurrentChange' @prev-click='handleCurrentChange' />
  </el-card>
</template>

<script setup lang='ts'>
import dayjs from 'dayjs'
import { getSmsRecordsList } from '@/api/users';
import { ref } from 'vue'

const input = ref('')

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
  listData.value = null
  getSmsRecordsList({
    page: currentPage.value, limit: pageSize.value, title: input.value
  }).then(res => {
    console.log(res);
    listData.value = res.data.list
    totals.value = res.data.total
  })
}

 ongetSmsRecordsList()

</script>




<style lang='scss' scoped>
.sms-records {
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