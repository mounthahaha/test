<template>
    <el-card v-loading="loading" class="withdraw-center">
        <div class="box-header">
            <el-input v-model="input" placeholder="请输入ID或手机号" />
            <el-button type="primary" @click="searchUser">查询</el-button>
            <el-button type="warning" @click="clearSearch">清空搜索条件</el-button>
        </div>
        <div class="title"><span>共{{ totals }}个条记录</span></div>
        <el-table :data="listData" style="width: 100%" border stripe>
            <el-table-column prop="id" label="ID" width="50" />
            <el-table-column prop="orderNo" label="订单号" width="100" />
            <el-table-column prop="amount" label="金额" width="100" v-slot="{ row, column, $index }">
                {{ row.amount/100 }}元
            </el-table-column>>
            <el-table-column prop="status" label="状态" v-slot="{ row, column, $index }" width="100">
                <span v-if="row.status === 2" style="border: 1px solid green;color: green;padding: 2px;">出款成功</span>
                <span v-else-if="row.status === 1" style="border: 1px solid green;color: green;padding: 2px;">审核中</span>
                <span v-else-if="row.status === 0" style="border: 1px solid #909399;color: #909399;padding: 2px;">未处理</span>
                <span v-else-if="row.status === -1" style="border: 1px solid red;color: red;padding: 2px;">取消提现</span>
                <span v-else-if="row.status === -2" style="border: 1px solid red;color: red;padding: 2px;">退款成功</span>
   
            </el-table-column>>
            <el-table-column prop="status" label="关联用户" v-slot="{ row, column, $index }" width="150">
                <div v-for="val, key in row.user">
                <div v-if="(key as any)=='nickname'">{{val }}</div>
                </div>
            </el-table-column>>
            <el-table-column prop="reason" label="理由" width="150" />
            <el-table-column prop="status" label="操作" v-slot="{ row, column, $index }" width="100">
                <template v-if="row.status === 2  || row.status === -2">
                 <el-button type="danger" round @click="deledeItem(row)">删除</el-button>
                </template>
                <template v-else-if="row.status === 0">
                <el-button type="warning" round @click="onShenhe(row)">审核</el-button>
                </template>
                 <template v-else-if="row.status === 1">
                <el-button type="warning" round @click="openEditDialog(row)">查看卡号</el-button>
                </template>
            </el-table-column>>
            <el-table-column prop="addTime" label="创建时间" width="180" v-slot="{ row, column, $index }">
                {{ dayjs(row.addTime).format('YYYY-MM-DD HH:mm:ss') }}
            </el-table-column>>
            <el-table-column prop="updateTime" label="更新时间" width="180" v-slot="{ row, column, $index }">
                {{ dayjs(row.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
            </el-table-column>>
        </el-table>
        <el-pagination v-model:currentPage="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
            background layout="total, sizes, prev, pager, next, jumper" :total="totals" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" @next-click='handleCurrentChange' @prev-click='handleCurrentChange' />

        <!-- opencheckCardDialog -->
        <el-dialog v-model="dialogEditFormVisible" title="查看订单">
            <el-form :model="editForm">
                <el-form-item label="关联用户ID" label-width="100px">
                    <el-input disabled v-model="editForm.user.id" autocomplete="off" />
                </el-form-item>
                <el-form-item disabled label="关联用户" label-width="100px">
                    <el-input disabled v-model="editForm.user.nickname" autocomplete="off" />
                </el-form-item>
                <el-form-item disabled label="订单号" label-width="100px">
                    <el-input disabled v-model="editForm.orderNo" autocomplete="off" />
                </el-form-item>
                <el-form-item disabled label="卡号ID" label-width="100px">
                    <el-input disabled v-model="editForm.cid" autocomplete="off" />
                </el-form-item>
                <el-form-item disabled label="卡号" label-width="100px">
                    <el-input disabled v-model="editForm.card" autocomplete="off" />
                </el-form-item>
                <el-form-item label="金额(单位分)" label-width="100px">
                    <el-input disabled v-model="editForm.amount" autocomplete="off" />
                </el-form-item>
                <el-form-item label="理由" label-width="100px">
                    <el-input v-model="editForm.reason" autocomplete="off" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="danger" @click="editConfirm(0) ">退回</el-button>
                    <el-button type="success" @click="editConfirm(2)">出款成功</el-button>
                </span>
            </template>
        </el-dialog>
    </el-card>
</template>

<script setup lang='ts'>
import { getList, handleShenHe, update, del } from '@/api/withdraw-center';
import dayjs from 'dayjs'
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus';




const input = ref('')
const loading = ref(true)
//搜索 
const searchUser = () => {
    ongetList()
}
const clearSearch = () => {
    input.value = ''
    ongetList()
}
//分页
const currentPage = ref(1)
const pageSize = ref(10)

const handleSizeChange = (val: number) => {
    ongetList()
}
const handleCurrentChange = (val: number) => {
    ongetList()
}

//请求数据
const listData = ref(null)
const totals = ref(0)
const ongetList = () => {
    listData.value = null
    loading.value = true
    getList({
        page: currentPage.value, limit: pageSize.value, title: input.value
    }).then(res => {
        console.log(res);
        listData.value = res.data.list
        totals.value = res.data.total
        loading.value = false
    })
}

ongetList()

//审核逻辑 
const onShenhe = (data)=>{
    handleShenHe(data.id).then(()=>{
         ongetList()
                ElMessage({
                    type: 'success',
                    message: '审核成功'
                })
    })
}


//编辑逻辑
const dialogEditFormVisible = ref(false)
const editForm = reactive({
    id: '',
    amount: '' as any,
    reason: '',
    status: 0,
    user: {
        id: 0,
        nickname: ''
    },
    updateTime: 0,
    addTime: 0,
    card:0,
    cid:0,
     orderNo:'',

})
const openEditDialog = (data) => {
    for (let key in data) {
        if(key=== 'amount') {
            editForm[key] = data[key] /100 + '元'
        } else {
            editForm[key] = data[key]
        }
    }
    dialogEditFormVisible.value = true
}
const editConfirm = async (status) => {
    editForm.status= status
    editForm.amount= parseFloat(editForm.amount)
    try {
        await update(editForm)
        ElMessage.success('修改成功')
        ongetList()
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
            del(data.id).then(() => {
                ongetList()
                ElMessage({
                    type: 'success',
                    message: '删除成功'
                })
            })
        })
}

</script>




<style lang='scss' scoped>
.withdraw-center {
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