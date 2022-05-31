<template>
  <div class="rebate-records">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> mood </v-icon>
      <v-toolbar-title>
        {{ $t(`sidebar_${$route.name}`) }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 匯出 展開按鈕 -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="loadData(1)">
            <v-icon>search</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_search') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="resetOptions()">
            <v-icon>find_replace</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_reset') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="_export">
            <v-icon>file_download</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_export') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-if="searchShow" v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="searchShow = !searchShow">
            <v-icon>expand_less</v-icon>
          </v-btn>
          <v-btn v-else v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="searchShow = !searchShow">
            <v-icon>expand_more</v-icon>
          </v-btn>
        </template>
        <span v-if="searchShow">{{ $t('g_btn_searchHide') }}</span>
        <span v-else>{{ $t('g_btn_searchExpand') }}</span>
      </v-tooltip>
    </v-toolbar>
    <!-- 搜尋 -->
    <v-card v-if="searchShow" elevation="0" class="pa-3 mb-3 rounded-lg" color="blue-grey lighten-4">
      <v-row dense class="align-center">
        <v-col cols="4">
          <v-text-field
            v-model="searchOption.user_name"
            solo
            clearable
            hide-details
            persistent-hint
            :label="$t('player_rebate_username_ID')"
            :placeholder="$t('player_rebate_username_ID_input')"
            @keydown.enter="loadData(1)"
          ></v-text-field>
        </v-col>
        <v-col cols="4">
          <datetime-range
            v-model="importTime"
            range-separator="player_balance_to"
            start-placeholder="report_rebate_export_time_start"
            end-placeholder="player_balance_endStart"
          />
        </v-col>
        <v-col cols="4">
          <datetime-range
            v-model="resolveTime"
            range-separator="player_balance_to"
            start-placeholder="report_rebate_resolve_time_start"
            end-placeholder="report_rebate_resolve_time_end"
          />
        </v-col>
        <v-col cols="4">
          <v-text-field
            v-model="searchOption.operate_user_name"
            solo
            clearable
            hide-details
            persistent-hint
            :label="$t('report_rebate_resolve_people')"
            @keydown.enter="loadData(1)"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card>
    <div class="table-data">
      <el-table v-loading="loading" ref="table" :data="tableData" style="width: 100%">
        <el-table-column prop="user_id" label="用户名（ID）" width="160">
          <span slot-scope="{ row }">{{ row.user_name }}(<span
                class="userId"
                @click.stop="showDetail(row.user_id)"
                >{{ row.user_id }}</span
              >)</span>
        </el-table-column>
        <el-table-column prop="vip_title" label="VIP级别" width="120"> </el-table-column>
        <el-table-column prop="parent_username" label="上级代理" width="120"> </el-table-column>
        <el-table-column prop="bet_amount_total" label="总投注额" width="140">
          <template v-slot="{row}">
            {{Number(row.bet_amount_total).toFixed(2) - 0}}
          </template>
        </el-table-column>
        <el-table-column prop="effective_bet_amount_total" label="有效投注额（新）" width="140">
          <template v-slot="{row}">
            {{Number(row.effective_bet_amount_total).toFixed(2) - 0}}
          </template>
        </el-table-column>
        <el-table-column prop="rebate_rate" label="返水比例" width="120">
          <template v-slot="{row}">
            {{Number(row.rebate_rate).toFixed(4) - 0}}
          </template>
        </el-table-column>
        <el-table-column prop="rebate_amount" label="总返水额" width="120">
          <template v-slot="{row}">
            {{Number(row.rebate_amount).toFixed(2) - 0}}
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="返水导入时间" width="160">
          <template v-slot="{row}">{{formateTime(row.create_time)}}</template>
        </el-table-column>
        <el-table-column prop="rebate_time" label="返水处理时间" width="160">
          <template v-slot="{row}">{{formateTime(row.rebate_time)}}</template>
        </el-table-column>
        <el-table-column label="处理状态" prop="state" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.state === '1'" effect="plain" type="success" size="mini">已返水</el-tag>
            <el-tag v-if="row.state === '2'" effect="plain" type="danger" size="mini">已拒绝</el-tag>
            <el-tag v-if="row.state === '0'" effect="plain" type="warning" size="mini">待返水</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operate_user_name" label="处理人" width="120"></el-table-column>
        <el-table-column prop="operate_mark" label="备注"> </el-table-column>
      </el-table>
      <div v-if="pagination.total > 0" style="margin-top:20px;text-align: right;">
        <el-pagination background layout="prev, pager, next" :total="pagination.total" @current-change="loadData" :current-page.sync="pagination.page" :page-size="pagination.itemsPerPage"> </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';
import {parseTime} from '@/utils'
import XLSX from 'xlsx';

export default {
  name: 'rebateReport',
  data() {
    return {
      searchOption: {},
      searchShow: true,
      tableData: [],
      pagination: {
        pageNums: 1,
        itemsPerPage: 25,
        total:0,
      },
      importTime: [],
      resolveTime: [],
      loading: false,
    };
  },
  created() {
    this.loadData(1);
  },
  methods: {
    formateTime(date) {
      const timeStr = new Date(date).getTime()
      return parseTime(timeStr)
    },
    showDetail(id) {      
      // 指定顯示個人信息
      this.$store.commit("PLAYERDETAILACTIVE", 0);
      this.$nextTick(() => {
        this.$store.commit("PLAYER", id);
      });
    },
    _export() {
      if (!this.pagination.total) {
        this.$store.commit("MsgError", '无数据可导出！');
        return false
      }
      this.searchOption.page = 1;
      this.searchOption.num = this.pagination.total;
      const resolveTime = this.resolveTime||['', ''];
      const importTime = this.importTime||['', ''];
      if (resolveTime && resolveTime.length > 0) {
        this.searchOption.startTime = resolveTime[0];
        this.searchOption.endTime = resolveTime[1];
      }
      if (importTime && importTime.length > 0) {
        this.searchOption.createTime = importTime[0];
        this.searchOption.createEndTime = importTime[1];
      }
      const params = { ...this.searchOption };

      api
        .get('/report/rebateMeter', params)
        .then(data => {
          if (!data.result.rebateMeterList.length) {
            this.$store.commit("MsgError", this.$t("g_export_nodata"));
            return false
          }
          const _export = [];
          const cols = []
          const props = []
          const tableChildren = this.$refs.table.$children
          tableChildren.forEach(el => {
            if (el.prop) {
              cols.push(el.label)
              props.push(el.prop)
            }
          })
          _export.push(cols)
          data.result.rebateMeterList.forEach(row => {
            const temp = props.map(key => {
              if (key === 'user_id') {
                return `${row.user_name}(${row.user_id})`
              }
              if (key === 'state') {
                return ['待返水', '已返水', '已拒绝'][row.state]
              }
              if (key === 'user_state') {
                return ['启用', '停用'][row.user_state]
              }
              if (key === 'tags') {
                return this.userTagsText(row.tags).join(',')
              }
              if (key === 'create_time') {
                return this.formateTime(row.create_time)
              }
              if (key === 'rebate_time') {
                return this.formateTime(row.rebate_time)
              }
              if (key === 'rebate_rate') {
                return Number(row.rebate_rate).toFixed(4) - 0
              }
              if (key === 'rebate_amount') {
                return Number(row.rebate_amount).toFixed(2) - 0
              }
              if(key === 'effective_bet_amount_total') {
                return Number(row.effective_bet_amount_total).toFixed(2) - 0
              }
              if(key === 'bet_amount_total') {
                return Number(row.bet_amount_total).toFixed(2) - 0
              }
              return row[key]
            })
            _export.push(temp)
          })
          console.log(_export)
          const ws = XLSX.utils.aoa_to_sheet(_export);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');
          const d = new Date().Format('yyyyMMdd');
          XLSX.writeFile(wb, `返水报表.xlsx`);
        })
        .catch(error => {
          console.log(error)
          // this.$store.commit('MsgError', error.error);
        });
    },
    loadData(p) {
      if (this.loading) {
        return;
      }

      this.loading = true;
      this.searchOption.page = p;
      this.searchOption.num = this.pagination.itemsPerPage;
      const resolveTime = this.resolveTime||['', ''];
      const importTime = this.importTime||['', ''];
      if (resolveTime && resolveTime.length > 0) {
        this.searchOption.startTime = resolveTime[0];
        this.searchOption.endTime = resolveTime[1];
      }
      if (importTime && importTime.length > 0) {
        this.searchOption.createTime = importTime[0];
        this.searchOption.createEndTime = importTime[1];
      }
      const params = { ...this.searchOption };

      api
        .get('/report/rebateMeter', params)
        .then(data => {
          this.loading = false;
          this.tableData = data.result.rebateMeterList
          // this.pagination.pageNums = data.pageNums;
          this.pagination.total = data.total;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.rebate-records {
  .table-data {
    margin-top: 20px;
    padding: 20px;
    border-radius: 10px;
    background: #fff;
  }
  .userId {
    color: #37a8de;
    cursor: pointer;
  }
}
</style>
