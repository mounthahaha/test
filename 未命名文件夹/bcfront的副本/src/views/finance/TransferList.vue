<template>
  <div class="transfer-list">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> payment </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!--  搜尋 重置 展開按鈕 -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="searchHandle">
            <v-icon>search</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_search') }}</span>
      </v-tooltip>
    </v-toolbar>
    <div class="content">
      <el-form :inline="true" :model="params">
        <el-form-item label="用户ID">
          <el-input v-model="params.userId" @keyup.native="params.userId=params.userId.replace(/^(0+)|[^\d]+/g,'')" size="large" placeholder="用户ID"></el-input>
        </el-form-item>
        <el-form-item label="用户名称">
          <el-input v-model="params.userName" size="large" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item label="转账类型">
          <el-select v-model="params.tranType" placeholder="请选择">
            <el-option label="全部" value=""></el-option>
            <el-option label="转入" :value="1"></el-option>
            <el-option label="转出" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="游戏平台">
          <el-select v-model="params.platformId" placeholder="请选择">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in plateforms" :key="item.Id" :label="item.SystemCode" :value="item.Id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="params.status" placeholder="请选择">
            <el-option label="全部" value=""></el-option>
            <el-option label="未知" :value="1"></el-option>
            <el-option label="成功" :value="2"></el-option>
            <el-option label="失败" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="转账时间">
          <el-date-picker
            v-model="dateRange"
            size="normal"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            value-format="yyyy-MM-dd"
            end-placeholder="结束日期"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" ref="table" :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="记录号" />
        <el-table-column prop="username" label="用户名(ID)" width="200">
          <template #default="{ row }">
            {{`${row.userName}`}}(<span class="user-id" @click.stop="showDetail(row.userId)">{{row.userId}}</span>)
          </template>
        </el-table-column>
        <el-table-column prop="fromPidName" label="转账类型">
          <template #default="{ row }">
            {{`${row.fromPidName }至${row.toPidName}`}}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="['', 'warning', 'success', 'danger'][row.status]">{{status[row.status]}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created" label="转账时间" :formatter="(row) => parseTime(new Date(row.created), '{y}-{m}-{d} {h}:{i}:{s}')" />
        <el-table-column prop="updateName" label="操作人" />
        <el-table-column prop="updated" label="操作时间" :formatter="(row) => parseTime(new Date(row.updated), '{y}-{m}-{d} {h}:{i}:{s}')" />
        <el-table-column prop="note" label="备注" />
        <el-table-column prop="status" label="操作" align="center">
          <template #default="{ row }">
            <div style="text-align:center;">
              <template v-if="row.status===1">
                <el-button type="text" @click="createHandle(row)">处理</el-button>
              </template>
              <template v-else>-</template>
            </div>
          </template>
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
          @current-change="fetchHandle"
          @size-change="fetchHandle"
        >
        </el-pagination>
      </div>
    </div>

    <!-- 处理操作弹窗 -->
    <el-dialog :title="dialogTitle" append-to-body :visible.sync="showCreateDialog" width="400px" @close="handleClose">
      <el-form label-width="80px" :model="createData">
        <el-form-item label="状态">
          <el-select v-model="createData.status" placeholder="选择状态">
            <el-option label="成功" :value="2"></el-option>
            <el-option label="失败" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="createData.note" rows="4" type="textarea" placeholder="填写备注" maxlength="100"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showCreateDialog = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api';
import { parseTime } from '@/utils';

const status = {
  1: '未知',
  2: '成功',
  3: '失败'
}

export default {
  name: 'TransferList',
  data() {
    return {
      status,
      plateforms: [],
      params: {
        userId: '',
        userName: '',
        tranType: '',
        platformId: '',
        status: '',
        page: 1,
        num: 25
      },
      total: 0,
      dateRange: [],
      tableData: [],
      loading: false,
      showCreateDialog: false,
      createData: {
        status: '',
        note: ''
      },
      submitLoading: false,
      currentData: {}
    }
  },
  computed: {
    dialogTitle() {
      return `操作 - 记录号：${this.currentData.id}`
    }
  },
  created() {
    this.fetchPlatforms()
    this.fetchHandle()
  },
  methods: {
    parseTime,
    searchHandle() {
      this.params.page = 1;
      this.fetchHandle()
    },
    showDetail(id) {      
      // 指定顯示個人信息
      this.$store.commit("PLAYERDETAILACTIVE", 0);
      this.$nextTick(() => {
        this.$store.commit("PLAYER", id);
      });
    },
    fetchPlatforms() {
      api
        .get('/games/platforms')
        .then((res) => {
          this.plateforms = res.result||[]
        })
    },
    fetchHandle() {
      this.loading = true;
      const params = this.params;

      if (this.dateRange && this.dateRange.length) {
        params.startTime = this.dateRange[0] + ' 00:00:00';
        params.endTime = this.dateRange[1] + ' 23:59:59';
      } else {
        params.startTime = '';
        params.endTime = '';
      }

      api
        .get('/report/platform/transfer/log', this.params)
        .then(({result}) => {
          this.loading = false;
          this.tableData = result.list
          this.total = result.total;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    createHandle(row) {
      this.currentData = row
      this.showCreateDialog = true
    },
    handleClose() {
      this.createData = {
        status: '',
        note: ''
      }
      this.currentData = {}
    },
    submit() {
      if (!this.createData.status) {
        return this.$message.error('请选择状态！');
      }
      if (!this.createData.note) {
        return this.$message.error('请填写备注！');
      }
      this.submitLoading = true
      api
        .post(`/report/platform/transfer/log/${this.currentData.id}`, this.createData)
        .then(({result}) => {
          this.submitLoading = false;
          this.$message.success('处理成功');
          this.showCreateDialog = false;
          this.fetchHandle()
        })
        .catch(error => {
          this.submitLoading = false;
          this.$message.error(error.error);
        });
    }
  }
}
</script>

<style scoped lang="scss"> 
.content {
  margin: 20px;
  padding: 20px;
  background: #fff;
  .page-box {
    margin-top: 20px;
    text-align: center;
  }
  .user-id {
    color: #37a8de;
    cursor: pointer;
  }
}
</style>