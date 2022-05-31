<template>
  <div class="log-detail">
    <el-table
      :data="logData"
      style="width: 100%">
      <el-table-column
        prop="PlatformAccountId"
        label="我平台用户ID">
      </el-table-column>
      <el-table-column
        prop="RuleType"
        label="下单类型">
      </el-table-column>
      <el-table-column
        prop="round_no"
        label="期数">
      </el-table-column>
      <el-table-column
        prop="BetAmount"
        label="投注金额">
      </el-table-column>
      <el-table-column
        prop="BetTime"
        label="投注">
      </el-table-column>
      <el-table-column
        prop="EndTime"
        label="派彩时间">
      </el-table-column>
      <el-table-column
        prop="WinLose"
        label="输赢">
      </el-table-column>
      <el-table-column
        prop="Numbers"
        label="开奖号码">
      </el-table-column>
      <el-table-column
        prop="Cmd"
        label="下单翻译指令">
      </el-table-column>
      <el-table-column
        prop="PlayValue"
        label="所选号码">
      </el-table-column>
      <el-table-column
        prop="LottoName"
        label="游戏名称">
      </el-table-column>
      <el-table-column
        prop="PlayType"
        label="游戏玩法">
      </el-table-column>
      <el-table-column
        prop="round_id"
        label="轮次">
      </el-table-column>
      <el-table-column
        prop="SRate"
        label="状态">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
    props: {
        sourceData: {
            type: Object,
            default: () => ({
                details: ''
            })
        }
    },
    computed: {
        logData() {
            return [JSON.parse(this.sourceData.details)]
        }
    }
}
</script>

<style>

</style>