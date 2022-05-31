<template>
  <div class="detail">
    <el-table :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column type="index" label="序号"></el-table-column>
      <el-table-column prop="OrderSn" label="订单号"></el-table-column>
      <el-table-column prop="Pname" label="游戏"></el-table-column>
      <el-table-column prop="ResultAmount" label="总输赢"></el-table-column>
      <el-table-column prop="BetAmount" label="总投注额" width="140"> </el-table-column>
      <el-table-column prop="EffectiveBetAmount" label="有效投注额" width="140"></el-table-column>
      <el-table-column prop="IsLines" label="是否多单"></el-table-column>
      <el-table-column prop="RebateAmount" label="返水额"></el-table-column>
      <el-table-column prop="BetTime" width="110" label="投注时间">
        <template v-slot="{row}">{{formateTime(row.BetTime)}}</template>
      </el-table-column>
      <el-table-column prop="SettleTime" width="110" label="结算时间">
        <template v-slot="{row}">{{formateTime(row.SettleTime)}}</template>
      </el-table-column>
    </el-table>
    <div
          v-if="total > 0"
          style="margin-top: 20px; text-align: right"
        >
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="params.num"
            :current-page.sync="params.page"
            @current-change="currentChange"
          ></el-pagination>
        </div>
  </div>
</template>

<script>
import api from "@/api";
import {parseTime} from '@/utils'

export default {
  props: {
    orderId: {
      type: [Number, String],
    },
  },
  data() {
    return {
      tableData: [],
      params: {
        userRebateOrderId: "",
        page: 1,
        num: 15,
      },
      total: 0,
      loading: false,
    };
  },
  created() {
    this.getTableData();
  },
  methods: {
    formateTime(date) {
      const timeStr = new Date(date).getTime()
      return parseTime(timeStr)
    },
    currentChange(val) {
      this.params.page = val
      this.getTableData()
    },
    getTableData() {
      this.loading = true;
      this.params.userRebateOrderId = this.orderId;
      const params = this.params;
      api
        .get("player/rebateMeterDayDetail", params)
        .then((data) => {
          this.loading = false;
          this.tableData = data.result.rebateMeterDayDetail;
          this.total = data.total
        })
        .catch((err) => {
          this.loading = false;
        });
    },
  },
};
</script>

<style>
</style>