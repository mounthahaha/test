<template>
  <div class="vip-set-records">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> assessment </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 下載 展開按鈕 -->
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
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="_export">
            <v-icon>file_download</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_export') }}</span>
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
    <div class="content-box">
      <el-form :inline="true" :model="params" v-if="searchShow">
        <el-form-item label="用户名">
          <el-input v-model="params.username" size="large" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item label="变更方式">
          <el-select v-model="params.action" placeholder="请选择">
            <el-option label="不限" value=""></el-option>
            <el-option label="系统" value="system"></el-option>
            <el-option label="手动" value="admin"></el-option>
        </el-select>
        </el-form-item>
        <el-form-item label="变更时间">
          <el-date-picker
            v-model="dateRange"
            size="normal"
            type="daterange"
            :picker-options="pickerOptions"
            range-separator="至"
            start-placeholder="开始日期"
            value-format="yyyy-MM-dd"
            end-placeholder="结束日期"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <el-table v-loading="loading" ref="table" :data="tableData" style="width: 100%" :loading="loading">
        <el-table-column prop="username" label="用户名(ID)">
          <template #default="{ row }">
            {{`${row.username}(${row.user_id})`}}
          </template>
        </el-table-column>
        <el-table-column prop="old_vip_lv" label="原VIP级别">
          <template #default="{ row }">
            {{row.old_vip_lv}}级
          </template>
        </el-table-column>
        <el-table-column prop="new_vip_lv" label="变更后VIP级别">
          <template #default="{ row }">
            {{row.new_vip_lv}}级
          </template>
        </el-table-column>
        <el-table-column prop="action" label="变更方式">
          <template #default="{ row }">
            {{ {admin: '手动', system: '系统'}[row.action] }}
          </template>
        </el-table-column>
        <el-table-column prop="updated" label="变更时间">
          <template #default="{ row }">
            {{ parseTime(new Date(row.updated+''), '{y}-{m}-{d} {h}:{i}:{s}') }}
          </template>
        </el-table-column>
        <el-table-column prop="admin_username" align="center" label="手动调整操作者"></el-table-column>
        <el-table-column prop="note" label="备注" align="center">
          <!-- <template #default="{ row }">
            <p style="text-align:left;margin-bottom:5px;">{{row.note}}</p>
            <el-input v-else type="textarea" rows="4" v-model="row.note" :readonly="row.readonly" />
            <div :style="`text-align:${row.readonly?'center':'right'};`">
              <el-button type="text" @click="editRemark(row)" :loading="row.loading">{{row.readonly?'编辑':'保存'}}</el-button>
              <el-button v-if="!row.readonly" type="text" @click="editCancel(row)">取消</el-button>
            </div>
          </template> -->
        </el-table-column>
      </el-table>
      <div v-if="total > 0" class="page-box">
        <el-pagination
          layout="prev, pager, next, total, sizes"
          background
          :total="total"
          :current-page.sync="params.page"
          :page-size.sync="params.num"
          :page-sizes="[25, 50, 100]"
          @current-change="loadData"
          @size-change="loadData"
        >
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';
import { parseTime } from '@/utils';
import _ from 'lodash';
import XLSX from 'xlsx';

export default {
  name: 'VersionRecords',
  data() {
    return {
      searchShow: true,
      params: {
        start_date: '',
        end_date: '',
        username: '',
        action: '',
        page: 1,
        num: 25,
        asc: true,
      },
      dateRange: [],
      tableData: [],
      total: 0,
      loading: false,
      pickerOptions: {
        disabledDate(time) {
          let curDate = (new Date()).getTime()
          let day = 1 * 24 * 3600 * 1000
          let dateRegion = curDate + day
          return time.getTime() > dateRegion
        }
      },
      oldRemark: ''
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    parseTime,
    resetOptions() {
      this.params = {
        start_date: '',
        end_date: '',
        uid: '',
        action: '',
        page: 1,
        num: 25,
        asc: true,
      };
      this.dateRange = [];
      this.loadData();
    },
    editRemark(row) {
      if (row.readonly) {
        this.oldRemark = row.note
        row.readonly = false
      } else {
        if (row.note === '') {
          return this.$store.commit('MsgError', '请输入备注！');
        }
        row.loading = true
        api
        .post(`/player/vip/setUpdateLogNote/${row.id}`, {note: row.note}).then(() => {
          row.loading = false
          this.loadData()
        }).catch(error => {
          row.loading = false;
          this.$store.commit('MsgError', error.error);
        });
      }
    },
    editCancel(row) {
      row.readonly = true
      row.note = this.oldRemark
      this.oldRemark = ''
    },
    loadData() {
      this.loading = true;
      const params = this.params;

      if (this.dateRange && this.dateRange.length) {
        params.start_date = this.dateRange[0];
        params.end_date = this.dateRange[1];
      } else {
        params.start_date = '';
        params.end_date = '';
      }

      api
        .get('/player/vip/updateLog', this.params)
        .then(data => {
          this.loading = false;
          this.tableData = (data.logs||[]).map(el => {
              // el.readonly = true
              // el.loading = false
              return el
          });
          this.total = data.total;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    _export() {
      if (!this.total) {
        this.$store.commit("MsgError", '无数据可导出！');
        return false
      }
      this.params.page = 1;
      this.params.num = this.total;
      const params = this.params;
      if (this.dateRange && this.dateRange.length) {
        params.start_date = this.dateRange[0];
        params.end_date = this.dateRange[1];
      } else {
        params.start_date = '';
        params.end_date = '';
      }

      api
        .get('/player/vip/updateLog', params)
        .then(data => {
          if (!data.logs.length) {
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
          data.logs.forEach(row => {
            const temp = props.map(key => {
              if (key === 'action') {
                return {admin: '手动', system: '系统'}[row.action]
              }
              if (key === 'updated') {
                return parseTime(new Date(row.updated), '{y}-{m}-{d} {h}:{i}:{s}')
              }
              return row[key]
            })
            _export.push(temp)
          })
          const ws = XLSX.utils.aoa_to_sheet(_export);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'SheetJS');
          const d = new Date().Format('yyyyMMdd');
          XLSX.writeFile(wb, `VIP升降级记录表.xlsx`);
        })
        .catch(error => {
          console.log(error)
          // this.$store.commit('MsgError', error.error);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.vip-set-records {
  .content-box {
    padding: 20px;
    margin-top: 10px;
    ::v-deep .el-date-editor {
      height: 40px;
    }
    ::v-deep .v-application ul {
      padding-left: 0;
    }
    .page-box {
      margin-top: 20px;
      text-align: center;
    }
  }
}
</style>
