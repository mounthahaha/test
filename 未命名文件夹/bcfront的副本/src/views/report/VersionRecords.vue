<template>
  <div class="version-records">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> assessment </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 下載 展開按鈕 -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="edit">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_add') }}</span>
      </v-tooltip>

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
      <el-form :inline="true" :model="params">
        <el-form-item label="版本号">
          <el-input v-model="params.ver" size="large" placeholder="版本号"></el-input>
        </el-form-item>
        <el-form-item label="日期">
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
      <el-table v-loading="loading" :data="tableData" style="width: 100%" :loading="loading">
        <el-table-column prop="version_number" label="版本">
          <template #default="{ row }">
            {{ platform[row.platform ]+ ' ' + row.version_number }}
          </template>
        </el-table-column>
        <el-table-column prop="app_size" label="更新包大小(MB)">
          <template #default="{ row }">
            {{row.app_size}}
          </template>
        </el-table-column>
        <el-table-column prop="is_strong" label="更新方式">
          <template #default="{ row }">
            {{ ['可选更新', '强制更新'][row.is_strong] }}
          </template>
        </el-table-column>
        <el-table-column prop="links" label="下载页地址" width="300px">
          <template #default="{ row }">
            <div v-html="linksHTML(row.links)"></div>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="发布日期">
          <template #default="{ row }">
            {{ parseTime(row.create_time, '{y}-{m}-{d}') }}
          </template>
        </el-table-column>
        <el-table-column prop="update_time" label="修改日期">
          <template #default="{ row }">
            {{ parseTime(row.update_time, '{y}-{m}-{d}') }}
          </template>
        </el-table-column>
        <el-table-column label="修改" width="100px" align="center">
          <template #default="{ row }">
            <el-button type="text" @click="edit('edit', row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="total > 0" class="page-box">
        <el-pagination
          layout="prev, pager, next, total, sizes"
          background
          :total="total"
          :current-page.sync="params.page"
          :page-size.sync="params.page_size"
          :page-sizes="[25, 50, 100]"
          @current-change="loadData"
          @size-change="loadData"
        >
        </el-pagination>
      </div>
      <!-- 新增、编辑弹窗 -->
      <el-dialog :title="dialogTitle" append-to-body :visible.sync="showEditDialog" width="600" @close="handleClose">
        <el-form label-width="100px" :model="sourceData">
          <el-form-item label="APP端口">
            <el-select v-model="sourceData.platform" placeholder="APP端口">
              <el-option label="iOS" value="ios"></el-option>
              <el-option label="安卓" value="android"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="版本号">
            <div style="display:flex;">
              <el-input style="width:100px" @keyup.native="verNum1 = verNum1.replace(/[^0-9]/g,'')" v-model="verNum1" />
              <span style="font-size:20px;font-weight:bold;margin:0 10px;">.</span> 
              <el-input style="width:100px" @keyup.native="verNum2 = verNum2.replace(/[^0-9]/g,'')" v-model="verNum2" />
              <span style="font-size:20px;font-weight:bold;margin:0 10px;">.</span> 
              <el-input style="width:100px" @keyup.native="verNum3 = verNum3.replace(/[^0-9]/g,'')" v-model="verNum3" />
            </div>
          </el-form-item>
          <el-form-item label="更新方式">
            <el-radio-group v-model="sourceData.is_strong">
              <el-radio :label="1">强制更新</el-radio>
              <el-radio :label="0">可选更</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="更新包大小">
            <el-input v-model.number="sourceData.app_size"></el-input>(单位：MB)
          </el-form-item>
          <el-form-item label="下载地址">
            <template v-if="sourceData.platform === 'android'">
              <el-input v-model="sourceData.links[0]" style="margin-bottom: 10px;"></el-input>
              <el-input v-model="sourceData.links[1]" style="margin-bottom: 10px;"></el-input>
              <el-input v-model="sourceData.links[2]"></el-input>
            </template>
            <el-input v-else v-model="sourceData.links[0]"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showEditDialog = false">取 消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submit">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import api from '@/api';
import { parseTime } from '@/utils';
import _ from 'lodash';

export default {
  name: 'VersionRecords',
  data() {
    return {
      searchShow: false,
      params: {
        start_date: '',
        end_date: '',
        ver: '',
        page: 1,
        page_size: 25,
        asc: true,
      },
      dateRange: [],
      tableData: [],
      total: 0,
      loading: false,
      submitLoading: false,
      showEditDialog: false,
      mode: 'add',
      sourceData: {
        platform: '', // 版本所属平台，只能是 ios 或者 android
        version_number: '', // 客户端版本号
        app_size: '', // 包体大小
        is_strong: 1, // 是否强制更新: 1-强制更新 0-可选更新
        links: ['', '', ''],
      },
      verNum1: '',
      verNum2: '',
      verNum3: '',
      pickerOptions: {
        disabledDate(time) {
          let curDate = (new Date()).getTime()
          let day = 1 * 24 * 3600 * 1000
          let dateRegion = curDate + day
          return time.getTime() > dateRegion
        }
      },
      platform: {
        android: '安卓',
        ios: 'iOS'
      }
    };
  },
  computed: {
    dialogTitle() {
      return {
        edit: '编辑',
        add: '新增',
      }[this.mode];
    },
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
        ver: '',
        page: 1,
        page_size: 25,
        asc: true,
      };
      this.dateRange = [];
      this.loadData();
    },
    edit(mode = 'add', data) {
      this.mode = mode;
      this.showEditDialog = true;
      if (mode === 'edit') {
        this.sourceData = _.cloneDeep(data);
        this.sourceData.is_strong = Number(this.sourceData.is_strong)
        if (this.sourceData.platform === 'android'&&this.sourceData.links.length <3) {
          const num = 3 - this.sourceData.links.length
          for (let i = 0; i < num; i++) {
            this.sourceData.links.push('')
          }
        }
        const verNumArr = this.sourceData.version_number.split('.')
        this.verNum1 = verNumArr[0]
        this.verNum2 = verNumArr[1]
        this.verNum3 = verNumArr[2]
      }
    },
    handleClose() {
      this.showEditDialog = false;
      this.sourceData = {
        platform: '', // 版本所属平台，只能是 ios 或者 android
        version_number: '', // 客户端版本号
        app_size: '', // 包体大小
        is_strong: 1, // 是否强制更新: 1-强制更新 0-可选更新
        links: ['', '', ''],
      };
      this.verNum1 = ''
      this.verNum2 = ''
      this.verNum3 = ''
    },
    linksHTML(data) {
      const html = data.map(el => {
        return `<div>${el}</div>`;
      });
      return html.join('');
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
        .get('/system/client_version_settings', this.params)
        .then(data => {
          this.loading = false;
          this.tableData = data.list
          this.total = data.total;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    submit() {
      this.sourceData.version_number = `${this.verNum1}.${this.verNum2}.${this.verNum3}`
      const { platform, version_number, app_size, is_strong, links, id } = this.sourceData;
      if (!platform) {
        return this.$store.commit('MsgError', '请选择平台！');
      }
      const hasVer = this.verNum1 && this.verNum2 && this.verNum3
      if (!hasVer) {
        return this.$store.commit('MsgError', '版本号内容必填！');
      }
      if (!app_size) {
        return this.$store.commit('MsgError', '请输入包大小！');
      }
      this.submitLoading = true;
      const params = { platform, version_number, app_size:Number(app_size), is_strong: Number(is_strong), links };
      let url = '/system/client_version_setting';
      let msg = '添加成功';

      if (this.mode === 'edit') {
        url = `${url}/${this.sourceData.id}`;
        msg = '修改成功';
      }

      api
        .post(url, params)
        .then(() => {
          this.submitLoading = false;
          this.showEditDialog = false;
          this.loadData();
          this.$store.commit('MsgOk', msg);
        })
        .catch(error => {
          this.submitLoading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.version-records {
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
