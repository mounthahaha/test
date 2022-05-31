<template>
  <el-card class="commodity">
    <div class="tag-bar">
      <span v-for="item, index in tags" :class="{ 'is-active': currentTagBarIndex === index }"
        @click="changeActiveTag(index)">{{ item }}商品</span>
    </div>
    <div class="box-header">
      <el-button type="primary" @click="openDialogAddForm">新增{{ tags[currentTagBarIndex] }}商品</el-button>
    </div>
    <div class="title"><span>共{{ totalUsers }}个{{ tags[currentTagBarIndex] }}商品</span></div>
    <el-table v-if="currentTagBarIndex !== 3" :data="listData" style="width: 100%" border stripe>
      <el-table-column prop="id" label="ID" width="50" />
      <!-- 钻石和金币独有列 -->
      <el-table-column v-if="currentTagBarIndex !== 1" :prop="currentTagBarIndex === 0 ? 'diamond' : 'gold'"
        :label="tags[currentTagBarIndex] + '数量'" width="100" />
      <!-- 游戏独有列 -->
      <el-table-column v-if="currentTagBarIndex === 1" prop="type" label="类型" width="130"
        v-slot="{ row, column, $index }">
        {{ gameType[row.type].label }}
      </el-table-column>>
      <el-table-column v-if="currentTagBarIndex === 1" prop="type" label="数量" width="70"
        v-slot="{ row, column, $index }">
        {{ row.vip }}
      </el-table-column>>
      <el-table-column prop="amount" label="金额" width="100" v-slot="{ row, column, $index }">
        {{ row.amount / 100 }}元
      </el-table-column>>

      <template v-if="currentTagBarIndex !== 1">
        <el-table-column prop="ctime" label="创建时间" width="180" v-slot="{ row, column, $index }">
          {{ dayjs(row.ctime).format('YYYY-MM-DD HH:mm:ss') }}
        </el-table-column>>
        <el-table-column prop="utime" label="更新时间" width="180" v-slot="{ row, column, $index }">
          {{ dayjs(row.utime).format('YYYY-MM-DD HH:mm:ss') }}
        </el-table-column>>
      </template>
      <template v-if="currentTagBarIndex === 1">
        <el-table-column prop="addTime" label="创建时间" width="180" v-slot="{ row, column, $index }">
          {{ dayjs(row.addTime).format('YYYY-MM-DD HH:mm:ss') }}
        </el-table-column>>
        <el-table-column prop="updateTime" label="更新时间" width="180" v-slot="{ row, column, $index }">
          {{ dayjs(row.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
        </el-table-column>>
      </template>
      <el-table-column prop="status" label="状态" v-slot="{ row, column, $index }" width="150">
        <el-switch disabled v-model="row.status" active-text="显示" inactive-text="隐藏" :active-value="1"
          :inactive-value="0" />
      </el-table-column>>
      <el-table-column prop="status" label="操作" v-slot="{ row, column, $index }" width="180">
        <el-button type="warning" round @click="openEditDialog(row)">编辑</el-button>
        <el-button type="danger" round @click="deledeItem(row)">删除</el-button>
      </el-table-column>>
    </el-table>
    <!-- 会员商品table -->
    <el-table v-else :data="listData" style="width: 100%" border stripe>
      <el-table-column fixed prop="id" label="ID" width="50" />
      <el-table-column fixed prop="title" label="标题" width="100" />
      <el-table-column prop="image" label="图片" width="300" v-slot="{ row, column, $index }">
        <el-image style="width: 100%" :src="row.image" fit="cover"  />
      </el-table-column>>
      <el-table-column prop="original" label="原价" width="100" v-slot="{ row, column, $index }">
        {{ row.original / 100 }}元
      </el-table-column>>
      <el-table-column prop="amount" label="现价" width="100" v-slot="{ row, column, $index }">
        {{ row.amount / 100 }}元
      </el-table-column>>
      <el-table-column prop="currency" label="货币单位" width="90" />
      <el-table-column prop="amount" label="增加时长" width="100" v-slot="{ row, column, $index }">
        {{ formatLetter(row.addTime) }}
      </el-table-column>>
      <el-table-column prop="describes" label="描述" width="200" />
      <el-table-column prop="status" label="状态" v-slot="{ row, column, $index }" width="150">
        <el-switch disabled v-model="row.status" active-text="显示" inactive-text="隐藏" :active-value="1"
          :inactive-value="0" />
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
    <!-- 新增 -->
    <el-dialog v-model="dialogAddFormVisible" title="新增商品">
      <el-form :model="addForm" ref="addFormRef">
        <el-form-item v-if="currentTagBarIndex === 0" :label="tags[currentTagBarIndex] + '数量'" label-width="100px">
          <el-input v-model="addForm.diamond" autocomplete="off" />
        </el-form-item>
        <template v-if="currentTagBarIndex === 1">
          <el-form-item label="类型" label-width="100px">
            <el-select v-model="addForm.type" class="m-2" placeholder="请选择">
              <el-option v-for="item in gameType" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="数量" label-width="100px">
            <el-input v-model="addForm.vip" autocomplete="off" />
          </el-form-item>
        </template>
        <el-form-item v-if="currentTagBarIndex === 2" :label="tags[currentTagBarIndex] + '数量'" label-width="100px">
          <el-input v-model="addForm.gold" autocomplete="off" />
        </el-form-item>
        <!-- only for Vip -->
        <el-form-item v-if="currentTagBarIndex !== 3" label="金额(单位分)" label-width="100px">
          <el-input v-model="addForm.amount" autocomplete="off" />
        </el-form-item>
        <template v-if="currentTagBarIndex === 3">
          <el-form-item label="标题" label-width="100px">
            <el-input v-model="addForm.title" autocomplete="off" />
          </el-form-item>
          <el-form-item label="图片地址" label-width="100px">
            <el-input v-model="addForm.image" autocomplete="off" />
          </el-form-item>
          <el-form-item label="原价(单位分)" label-width="100px">
            <el-input v-model="addForm.original" autocomplete="off" />
          </el-form-item>
          <el-form-item label="现价(单位分)" label-width="100px">
            <el-input v-model="addForm.amount" autocomplete="off" />
          </el-form-item>
          <el-form-item label="货币单位" label-width="100px">
            <el-input v-model="addForm.currency" autocomplete="off" />
          </el-form-item>
          <el-form-item label="增加时长"  label-width="100px">
            <el-input v-model="addForm.addTime" placeholder="请以字母d,m,y 结尾 分别为 天,月,年" autocomplete="off" />
          </el-form-item>
          <el-form-item label="描述" label-width="100px">
            <el-input v-model="addForm.describes" autocomplete="off" />
          </el-form-item>
        </template>
        <el-form-item label="" label-width="100px">
          <el-switch v-model="addForm.status" active-text="显示" inactive-text="隐藏" :active-value="1"
            :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogAddFormVisible = false">取消</el-button>
          <el-button type="primary" @click="onAddCommodity(currentTagBarIndex)">确认</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 编辑 -->
    <el-dialog v-model="dialogEditFormVisible" title="编辑商品">
      <el-form :model="editForm">
        <el-form-item v-if="currentTagBarIndex === 0" :label="tags[currentTagBarIndex] + '数量'" label-width="100px">
          <el-input v-model="editForm.diamond" autocomplete="off" />
        </el-form-item>
        <template v-if="currentTagBarIndex === 1">
          <el-form-item label="类型" label-width="100px">
            <el-select v-model="editForm.type" class="m-2" placeholder="请选择">
              <el-option v-for="item in gameType" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="数量" label-width="100px">
            <el-input v-model="editForm.vip" autocomplete="off" />
          </el-form-item>
        </template>
        <el-form-item v-if="currentTagBarIndex === 2" :label="tags[currentTagBarIndex] + '数量'" label-width="100px">
          <el-input v-model="editForm.gold" autocomplete="off" />
        </el-form-item>
        <el-form-item v-if="currentTagBarIndex !== 3" label="金额(单位分)" label-width="100px">
          <el-input v-model="editForm.amount" autocomplete="off" />
        </el-form-item>
        <template v-if="currentTagBarIndex === 3">
          <el-form-item label="标题" label-width="100px">
            <el-input v-model="editForm.title" autocomplete="off" />
          </el-form-item>
          <el-form-item label="图片地址" label-width="100px">
            <el-input v-model="editForm.image" autocomplete="off" />
          </el-form-item>
          <el-form-item label="原价(单位分)" label-width="100px">
            <el-input v-model="editForm.original" autocomplete="off" />
          </el-form-item>
          <el-form-item label="现价(单位分)" label-width="100px">
            <el-input v-model="editForm.amount" autocomplete="off" />
          </el-form-item>
          <el-form-item label="货币单位" label-width="100px">
            <el-input v-model="editForm.currency" autocomplete="off" />
          </el-form-item>
          <el-form-item label="增加时长" label-width="100px">
            <el-input v-model="editForm.addTime" placeholder="请以字母d,m,y结尾分别为天,月,年" autocomplete="off" />
          </el-form-item>
            <el-form-item label="描述" label-width="100px">
            <el-input v-model="editForm.describes" autocomplete="off" />
          </el-form-item>
        </template>
        <el-form-item label="" label-width="100px">
          <el-switch v-model="editForm.status" active-text="显示" inactive-text="隐藏" :active-value="1"
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
  </el-card>
</template>

<script setup lang='ts'>
import { ElMessage, ElMessageBox } from "element-plus"
import { getCommodityDiamondList, addCommodityDiamond, deleteCommodityDiamond, updateCommodityDiamond, getCommodityGameList, getCommodityGoldList, getCommodityVipList, deleteCommodityGame, deleteCommodityGold, deleteCommodityVip, updateCommodityGame, updateCommodityGold, updateCommodityVip, addCommodityGame, addCommodityGold, addCommodityVip } from '@/api/commodity';
import { ref, reactive, watchEffect } from 'vue';
import dayjs from 'dayjs'
import { formatLetter } from "@/utils/formatting-date";

const gameType = [
  {
    value: 0,
    label: 'vip会员天数',
  },
  {
    value: 1,
    label: '赠送游戏金额',
  },
  {
    value: 2,
    label: '赠送钻石数量',
  },
  {
    value: 3,
    label: '赠送金币数量',
  },
]

const tags = ['钻石', '游戏', '金币', '会员']


const currentTagBarIndex = ref<number>(0)


// 获取数据
const listData = ref(null)
const totalUsers = ref(0)
const ongetCommodityList = (index: number = 0) => {
  listData.value = null
  totalUsers.value = 0
  if (index === 0) {
    getCommodityDiamondList().then(res => {
      console.log(res);
      listData.value = res.data.list
      totalUsers.value = res.data.total
    })
  } else if (index === 1) {
    getCommodityGameList().then(res => {
      console.log(res);
      listData.value = res.data.list
      totalUsers.value = res.data.total
    })
  } else if (index === 2) {
    getCommodityGoldList().then(res => {
      console.log(res);
      listData.value = res.data.list
      totalUsers.value = res.data.total
    })
  } else {
    getCommodityVipList().then(res => {
      console.log(res);
      listData.value = res.data.list
      totalUsers.value = res.data.total
    })
  }
}
ongetCommodityList()

//changeActiveTag
const changeActiveTag = (index: number) => {
  currentTagBarIndex.value = index
  ongetCommodityList(currentTagBarIndex.value)
}

//新增逻辑     
const dialogAddFormVisible = ref(false)
let addForm = reactive({
  diamond: '',
  gold: '',
  type: '',
  vip: '',
  amount: '',
  status: 1,
  // only for Vip
  "title": '',
  "describes": "",
  "image": "",
  "currency": "¥",
  "original": '',
  "isText": 0,
  "addTime": ""
})

const openDialogAddForm = () => {
  dialogAddFormVisible.value = true
  //手动重置每次打开
  for (let key in addForm) {
    if (key === 'status') {
      addForm[key] = 1
    } else if (key === 'currency') {
      addForm[key] = '¥'
    } else if (key === 'isText') {
      addForm[key] = 0
    } else {
      addForm[key] = ''
    }
  }
}

const onAddCommodity = (index: number) => {

  if (index === 0) {
    const { diamond, amount, status } = addForm
    const data = { diamond, amount, status }
    addCommodityDiamond(data).then(() => {
      ElMessage.success('新增成功')
      ongetCommodityList(currentTagBarIndex.value)
      dialogAddFormVisible.value = false
    }).catch(() => {
      dialogAddFormVisible.value = false
    })
  } else if (index === 1) {
    const { vip, amount, status, type } = addForm
    const data = { vip, amount, status, type }
    addCommodityGame(data).then(() => {
      ElMessage.success('新增成功')
      ongetCommodityList(currentTagBarIndex.value)
      dialogAddFormVisible.value = false
    }).catch(() => {
      dialogAddFormVisible.value = false
    })
  } else if (index === 2) {
    const { gold, amount, status } = addForm
    const data = { gold, amount, status }
    addCommodityGold(data).then(() => {
      ElMessage.success('新增成功')
      ongetCommodityList(currentTagBarIndex.value)
      dialogAddFormVisible.value = false
    }).catch(() => {
      dialogAddFormVisible.value = false
    })
  } else {
    addCommodityVip(addForm).then(() => {
      ElMessage.success('新增成功')
      ongetCommodityList(currentTagBarIndex.value)
      dialogAddFormVisible.value = false
    }).catch(() => {
      dialogAddFormVisible.value = false
    })
  }
}


//编辑逻辑 
const dialogEditFormVisible = ref(false)
const editForm = reactive({
  id: '',
  diamond: '',
  type: '',
  vip: '',
  gold: '',
  amount: '',
  status: 1,
  ctime: '',
  utime: '',
  addTime: '',   //当时vip是这个代表增加时长 当游戏时代表创建时间
  updateTime: '',
  // only for Vip
  "title": '',
  "describes": "",
  "image": "",
  "currency": "¥",
  "original": '',
  "isText": 0,
})
const openEditDialog = (data) => {
  dialogEditFormVisible.value = true

  const { id, diamond, amount, status, ctime, utime, gold, addTime, updateTime, type, vip, title, describes, image,original, currency, isText } = data
  editForm.id = id
  editForm.diamond = diamond //钻石独有
  editForm.gold = gold //金币独有
  editForm.addTime = addTime //游戏独有
  editForm.updateTime = updateTime //游戏独有
  editForm.type = type //游戏独有
  editForm.vip = vip //游戏独有
  editForm.amount = amount
  editForm.status = status
  editForm.ctime = ctime
  editForm.utime = utime
  editForm.title = title
  editForm.describes = describes
  editForm.currency = currency
  editForm.original = original
  editForm.isText = isText
  editForm.image = image
  

}
const editConfirm = async () => {
  switch (currentTagBarIndex.value) {
    case 0:
      await updateCommodityDiamond(editForm)
      break;
    case 1:
      await updateCommodityGame(editForm)
      break;
    case 2:
      await updateCommodityGold(editForm)
      break;
    case 3:
      await updateCommodityVip(editForm)
      break;
    default:
      console.log('删除错误');
  }

  ElMessage.success('修改成功')
  ongetCommodityList(currentTagBarIndex.value)
  dialogEditFormVisible.value = false

}

//删除逻辑
const deledeItem = async (data) => {
  ElMessageBox.confirm(
    '是否确定删除此项',
    {
      confirmButtonText: '确认删除',
      confirmButtonClass: 'confirm-button-delele-class',
      cancelButtonText: '取消',
      center: true,
    }
  )
    .then(async () => {
      switch (currentTagBarIndex.value) {
        case 0:
          await deleteCommodityDiamond(data)
          break;
        case 1:
          await deleteCommodityGame(data)
          break;
        case 2:
          await deleteCommodityGold(data)
          break;
        case 3:
          await deleteCommodityVip(data)
          break;
        default:
          console.log('删除错误');
      }

      ongetCommodityList(currentTagBarIndex.value)
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
    })
}
</script>




<style lang='scss' scoped>
.commodity {
  min-height: 100%;

  .tag-bar {
    display: flex;
    padding-bottom: 20px;

    // border-bottom: 2px solid #409eff;
    span {
      text-align: center;
      color: #675252;
      cursor: pointer;
      padding: 10px 4px;
      margin-right: 20px;

      &:hover {
        color: #000;
        border-bottom: 2px solid #ff0000;
      }
    }

    .is-active {
      color: #000;
      border-bottom: 2px solid #ff0000;
    }

  }

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