<template>
  <div class="game-type-setting">
    <div class="content">
      <h2 class="title">前台游戏分类设置</h2>
      <el-table v-loading="loading" ref="table" :data="tableData" style="width: 100%">
        <el-table-column prop="sort" label="排序" />
        <el-table-column prop="menu_name" label="类别名称" />
        <el-table-column prop="branch" label="游戏类型" />
        <el-table-column prop="id" label="入口开关(Caption)">
          <template #default="{row}">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              active-color="#13ce66"
              inactive-color="#ccc"
              @change="(val) => statusChange(val, row)">>
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{row}">
            <i class="el-icon-s-tools" style="font-size:20px;cursor: pointer;" @click="editHandle(row)"></i>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 游戏编辑/新增 -->
    <el-dialog append-to-body :visible.sync="showDialog" width="800px" @close="handleClose">
      <template #title>{{title}} - 分類管理</template>
      <el-form label-width="110px" :model="currentData">
        <el-form-item label="游戏名称">
          <el-input v-model="currentData.menu_name"  placeholder="游戏名称"></el-input>
        </el-form-item>
        <el-form-item label="排序">
          <el-input v-model.number="currentData.sort" placeholder="排序"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDialog = false">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'GameTypeSetting',
  data() {
    return {
      tableData: [],
      loading: false,
      showDialog: false,
      submitLoading: false,
      currentData: {
          menu_name: '',
          sort: ''
      },
      currentTypeId: '',
    }
  },
  computed: {
    title() {
        return this.currentData.menu_name
    }
  },
  created() {
    this.fetchHandle()
  },
  methods: {
    fetchHandle() {
      this.loading = true;
      api
        .get('/games/gamemenu')
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
    editHandle(row) {
      this.currentTypeId = row.id
      const {menu_name, sort} = row
      this.currentData = {menu_name, sort}
      this.showDialog = true
    },
    handleClose() {
      this.currentData = {
          menu_name: '',
          sort: ''
      }
      this.currentTypeId = ''
    },
    statusChange(val, row) {
      const msg = val ? '开启' : '关闭'
      this.$confirm(`您是否要${msg}入口？`, '温馨提示', {type: 'warning'}).then(() => {
        api
        .put(`/games//gamemenu/status/${row.id}`)
        .then(({result}) => {
          this.$message.success('更新成功');
        })
        .catch(error => {
          row.status = val ? 0 : 1
          this.submitLoading = false;
          this.$message.error(error.err_msg);
        });
      }).catch(() => {
        row.status = val ? 0 : 1         
      });
    },
    submit() {
      let url = `/games/gamemenu/${this.currentTypeId}`
      this.submitLoading = true
      api
        .put(url, this.currentData)
        .then(({result}) => {
          this.submitLoading = false;
          this.$message.success('更新成功');
          this.showDialog = false;
          this.fetchHandle()
        })
        .catch(error => {
          this.submitLoading = false;
          this.$message.error(error.err_msg);
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
  .title {
    font-size: 16px;
    padding: 10px 0;
    font-weight: bold;
  }
}
</style>
