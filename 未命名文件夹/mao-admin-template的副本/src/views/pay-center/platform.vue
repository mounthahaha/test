<template>
  <el-card v-loading="loading" class="pay-center">
    <div class="box-header">
      <el-input v-model="input" placeholder="请输入ID或手机号" />
      <el-button type="primary" @click="searchUser">查询</el-button>
      <el-button type="warning" @click="clearSearch">清空搜索条件</el-button>
    </div>
    <div class="title"><span>共{{ totals }}个条记录</span></div>
    <el-table :data="listData" style="width: 100%" border stripe>
      <el-table-column prop="id" label="ID" width="50" />
      <el-table-column prop="uid" label="用户ID" width="80" />
      <el-table-column prop="orderId" label="订单ID" width="150" />
      <el-table-column prop="orderNo" label="订单号码" width="150" />
      <el-table-column prop="type" label="支付类型" width="100" v-slot="{ row, column, $index }">
        {{ computedOrderType(row.type) }}
      </el-table-column>>
 <el-table-column prop="pid" label="支付方式" width="100" v-slot="{ row, column, $index }">
        {{ computedOrderPid(row.id) }}
      </el-table-column>>
      <el-table-column prop="amount" label="金额" width="100" v-slot="{ row, column, $index }">
        {{ row.amount / 100 }}元
      </el-table-column>>
      <el-table-column prop="status" label="支付状态" v-slot="{ row, column, $index }" width="100">
        <span v-if="row.status === 1" style="border: 1px solid green;color: green;padding: 2px;">成功</span>
        <span v-else-if="row.status === 0" style="border: 1px solid #a0a0a0;color: #a0a0a0;padding: 2px;">未支付</span>
        <span v-else style="border: 1px solid red;color: red;padding: 2px;">失败</span>
      </el-table-column>>
      <el-table-column prop="status" label="切换订单状态" v-slot="{ row, column, $index }" width="180">
        <el-button  type="success" round @click="changeSwitchStatus(1, row.id, $index)">成功</el-button>
         <el-button  type="danger" round @click="changeSwitchStatus(0, row.id, $index)">失败</el-button>
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
  </el-card>
</template>

<script setup lang='ts'>
import { getOnlinePayOrderList, OnlinePayOrderFail, OnlinePayOrderSuccess, getPidList } from '@/api/pay-center';
import dayjs from 'dayjs'
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus';


const pidDate = ref(null)
//获取支付pid字段对照
 getPidList().then(res=>{
  console.log('获取支付pid字段对照',res);
  pidDate.value = res.data.list
})
//处理PID字段  
const computedOrderPid = (ID: number) => {
  const item =  pidDate.value.find(item=>{
    return item.id = ID
  })
  return item.title
}
const input = ref('')
const loading = ref(true)
//搜索 
const searchUser = () => {
  ongetOnlinePayOrderList()
}
const clearSearch = () => {
  input.value = ''
  ongetOnlinePayOrderList()
}
//分页
const currentPage = ref(1)
const pageSize = ref(10)

const handleSizeChange = (val: number) => {
  ongetOnlinePayOrderList()
}
const handleCurrentChange = (val: number) => {
  ongetOnlinePayOrderList()
}

//请求数据
const listData = ref(null)
const totals = ref(0)
const ongetOnlinePayOrderList = () => {
  listData.value = null
  loading.value = true
  getOnlinePayOrderList({
    page: currentPage.value, limit: pageSize.value, title: input.value
  }).then(res => {
    console.log(res);
    listData.value = res.data.list
    totals.value = res.data.total
    loading.value = false
  })
}

ongetOnlinePayOrderList()

//处理订单类型
const computedOrderType = (type: number) => {
  switch (type) {

    case 100:
      return '开通VIP';
    case 101:
      return '充值金币'
    case 102:
      return '充值钻石'
    case 103:
      return '充值游戏'
  }
}




//改变订单状态
const changeSwitchStatus = (val: number, id: number, index: number) => {
  if (val === 1) {
    OnlinePayOrderSuccess(id).then(() => {
      ElMessage.success('修改成功')
       listData.value[index].status = 1
    })
  } else {
    OnlinePayOrderFail(id).then(() => {
      ElMessage.success('修改成功')
      listData.value[index].status = 2
    })
  }
}
</script>




<style lang='scss' scoped>
.pay-center {
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