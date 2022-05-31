<template>
  <div class="dashboard" v-loading="loading">
    <el-card v-for="item, index in allStatistics">
      <template #header>
        <div class="card-header">
          <span>{{ titles[index] }}</span>
        </div>
      </template>
      <template #default v-if="index !== 6">
        <div class="box-card-body">
          <div
            :style="{ 'background-image': index % 2 == 0 ? 'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)' : 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)' }">
            <div class="title-card-body">今日{{ titles[index] }}总额</div>
            <div class="count-card-body">{{ item.data.t }} <span class="yuan">元</span></div>
            <SvgIcon name="wallte" className="svg-class"></SvgIcon>
          </div>
          <div
            :style="{ 'background-image': index % 2 == 0 ? 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)' : 'linear-gradient(to right, #fa709a 0%, #fee140 100%)' }">
            <div class="title-card-body">昨日{{ titles[index] }}总额</div>
            <div class="count-card-body">{{ item.data.y }} <span class="yuan">元</span></div>
            <SvgIcon name="wallte" className="svg-class"></SvgIcon>
          </div>
          <div
            :style="{ 'background-image': index % 2 == 0 ? ' linear-gradient(to right, #fa709a 0%, #fee140 100%)' : ' linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)' }">
            <div class="title-card-body">{{ titles[index] }}总额</div>
            <div class="count-card-body">{{ item.data.all }} <span class="yuan">元</span></div>
            <SvgIcon name="wallte" className="svg-class"></SvgIcon>
          </div>
          <div v-if="index === 5"
            :style="{ 'background-image': index % 2 == 0 ? 'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)' : 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)' }">
           <div class="title-card-body">申请总额</div>
            <div class="count-card-body">{{ item.data.sq }} <span class="yuan">元</span></div>
            <SvgIcon name="wallte" className="svg-class"></SvgIcon>
          </div>
        </div>
      </template>
       <template #default v-else>
        <div class="box-card-body">
          <div
            :style="{ 'background-image': index % 2 == 0 ? 'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)' : 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)' }">
            <div class="title-card-body">已登录</div>
            <div class="count-card-body">{{ item.data.l }} <span class="yuan">人</span></div>
            <SvgIcon name="wallte" className="svg-class"></SvgIcon>
          </div>
          <div
            :style="{ 'background-image': index % 2 == 0 ? 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)' : 'linear-gradient(to right, #fa709a 0%, #fee140 100%)' }">
            <div class="title-card-body">实时在线</div>
            <div class="count-card-body">{{ item.data.o }} <span class="yuan">人</span></div>
            <SvgIcon name="wallte" className="svg-class"></SvgIcon>
          </div>
          <div
            :style="{ 'background-image': index % 2 == 0 ? ' linear-gradient(to right, #fa709a 0%, #fee140 100%)' : ' linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)' }">
            <div class="title-card-body">所有视频</div>
            <div class="count-card-body">{{ item.data.v }} <span class="yuan">个</span></div>
            <SvgIcon name="wallte" className="svg-class"></SvgIcon>
          </div>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang='ts'>
import { ref, reactive } from 'vue'
import axios from 'axios'
import { deductionData, diamondData, gameData, usersData, vipData, withdrawalData, otherData } from '@/api/statistics';
enum titles { 扣量, 钻石, 游戏, 用户, 会员, 提现, 其他 }

const loading = ref(true)

// 所有的统计信息
let allStatistics = ref<any[]>([])

axios.all([deductionData(), diamondData(), gameData(), usersData(), vipData(), withdrawalData(), otherData()]).then(res => {
  allStatistics.value = res
  loading.value = false
}).catch(res => {
  loading.value = false
})
</script>




<style lang='scss' scoped>
.dashboard {
  min-height: 100%;

  .el-card {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0px;
    }

    :deep(.el-card__header) {
      padding: 10px;
    }
  }

  .box-card-body {
    display: flex;
    padding: 0 30px;

    &>* {
       position: relative;
      width: 22%;
      height: 80px;
      margin-right: 35px;
      border-radius: 10px;
      color: #fff;
      padding: 15px 20px;

      .title-card-body {
        margin-bottom: 10px;
      }

      .count-card-body {
        font-size: 20px;

        .yuan {
          font-size: 16px;
        }
      }

      &:last-child {
        margin-right: 0px;
      }

    }
  }
}

.svg-class {
  position: absolute;
  font-size: 40px;
  right: 26px;
  top: 50%;
  transform: translate(-13px,-50%);
}
</style>