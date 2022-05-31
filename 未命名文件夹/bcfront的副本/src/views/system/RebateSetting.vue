<template>
  <div class="rebate-setting">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> mood </v-icon>
      <v-toolbar-title>
        {{ $t(`sidebar_${$route.name}`) }}
      </v-toolbar-title>
    </v-toolbar>
    <div class="content-data">
      <div v-loading="loading" class="switch-box">
        <label>系统自动派发</label>
        <el-switch v-model="status" style="margin-right: 20px;" active-color="rgba(22, 155, 213, 1)" inactive-color="#ccc" @change="changeHandle">
        </el-switch>
        <template v-if="status">
          <label>每日自动返水时间</label>
          <el-date-picker
            v-model="date"
            type="date"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOption"
            placeholder="选择日期">
          </el-date-picker>
          <el-time-picker
            v-model="time"
            :picker-options="{
              selectableRange: '00:00:00 - 23:59:59',
            }"
            placeholder="选择时间"
            value-format="HH:mm:ss"
          >
          </el-time-picker>
          <el-button type="primary" style="margin-left: 20px;" @click="setConfig">保存</el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';

export default {
  data() {
    return {
      status: false,
      oldStatus: false,
      time: '',
      loading: false,
      date: '',
      pickerOption: {
        disabledDate(date) {
          return date.getTime() < new Date().getTime() - 24 * 60 * 60 * 1000
        }
      }
    };
  },
  created() {
    this.getConfig();
  },
  methods: {
    getConfig() {
      this.loading = true;
      api
        .get('/system/rebateConfigs')
        .then(({ result }) => {
          this.loading = false;
          this.status = result[0].val === '1';
          this.oldStatus = this.status
          this.time = result[1].val;
          this.date = result[2].val
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    setConfig() {
      const data = {
        vale1: Number(this.status),
        vale2: this.time,
        vale3: this.date
      };
      this.loading = true;
      api
        .post('/system/config/updateRebateConfig', data)
        .then(res => {
          this.loading = false;
          this.getConfig()
        })
        .catch(error => {
          this.loading = false;
          this.status = this.oldStatus
          this.$store.commit('MsgError', error.error);
        });
    },
    changeHandle(val) {
      if (this.oldStatus&&!val) {
        this.setConfig();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.rebate-setting {
  .content-data {
    margin: 20px;
    padding: 20px;
    border-radius: 10px;
    background: #fff;
    .switch-box {
      display: flex;
      align-items: center;
      label {
        margin-right: 20px;
      }
      ::v-deep .el-date-editor {
        height: 38px;
      }
    }
  }
}
</style>
