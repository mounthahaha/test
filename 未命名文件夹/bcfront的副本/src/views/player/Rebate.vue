<template>
  <div class="rebate">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> mood </v-icon>
      <v-toolbar-title>
        {{ $t(`sidebar_${$route.name}`) }}
        <span style="color: #02a7f0">({{ today }})</span>
        <el-tooltip placement="top">
          <div slot="content">
            统计内容为前一天所有<span style="color: #f00">能确定订单结果</span
            >的用户数据
          </div>
          <i class="el-icon-question"></i>
        </el-tooltip>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 匯出 展開按鈕 -->
      <el-button
        :type="selected.length > 1 ? 'primary' : 'info'"
        :disabled="selected.length < 2"
        @click="mutipleAccept"
      >
        批量通过
      </el-button>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            color="primary"
            class="mx-2"
            depressed
            fab
            dark
            small
            v-on="on"
            @click="loadData(1)"
          >
            <v-icon>search</v-icon>
          </v-btn>
        </template>
        <span>{{ $t("g_btn_search") }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            color="primary"
            class="mx-2"
            depressed
            fab
            dark
            small
            v-on="on"
            @click="resetOptions()"
          >
            <v-icon>find_replace</v-icon>
          </v-btn>
        </template>
        <span>{{ $t("g_btn_reset") }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            color="primary"
            class="mx-2"
            depressed
            fab
            dark
            small
            v-on="on"
            @click="_export"
          >
            <v-icon>file_download</v-icon>
          </v-btn>
        </template>
        <span>{{ $t("g_export") }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            v-if="searchShow"
            v-bind="attrs"
            color="primary"
            class="mx-2"
            depressed
            fab
            dark
            small
            v-on="on"
            @click="searchShow = !searchShow"
          >
            <v-icon>expand_less</v-icon>
          </v-btn>
          <v-btn
            v-else
            v-bind="attrs"
            color="primary"
            class="mx-2"
            depressed
            fab
            dark
            small
            v-on="on"
            @click="searchShow = !searchShow"
          >
            <v-icon>expand_more</v-icon>
          </v-btn>
        </template>
        <span v-if="searchShow">{{ $t("g_btn_searchHide") }}</span>
        <span v-else>{{ $t("g_btn_searchExpand") }}</span>
      </v-tooltip>
    </v-toolbar>
    <v-container fluid class="pa-5">
      <!-- 搜尋 -->
      <v-card
        v-if="searchShow"
        elevation="0"
        class="pa-3 mb-3 rounded-lg"
        color="blue-grey lighten-4"
      >
        <v-row dense class="align-center">
          <v-col cols="4">
            <v-text-field
              v-model="userName"
              solo
              clearable
              hide-details
              persistent-hint
              :label="$t('player_rebate_username_ID')"
              :placeholder="$t('player_rebate_username_ID')"
              @keydown.enter="loadData(1)"
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="selectedTags"
              multiple
              solo
              clearable
              hide-details
              persistent-hint
              single-line
              :items="tags"
              :label="$t('player_rebate_select_tag')"
            ></v-select>
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="selectedState"
              solo
              clearable
              hide-details
              persistent-hint
              single-line
              :items="state"
              :label="$t('player_rebate_select_status')"
            ></v-select>
          </v-col>
          <v-col cols="4">
            <datetime-range
              label="返水导入时间"
              v-model="dateRange"
              range-separator="player_balance_to"
              start-placeholder="player_balance_startDate"
              end-placeholder="player_balance_endStart"
            />
          </v-col>
        </v-row>
      </v-card>
      <div class="rebate-count">
        <div class="pending-rebate">
          <div>
            <i class="el-icon-user"></i>待返水
            <span>{{ summaryData.waiting }}</span>
          </div>
          <i class="el-icon-refresh" @click="refresh('0')"></i>
        </div>
        <div class="rebated">
          <div>
            <i class="el-icon-user"></i>已返水
            <span>{{ summaryData.successful }}</span>
          </div>
          <i class="el-icon-refresh" @click="refresh('1')"></i>
        </div>
        <div class="refused">
          <div>
            <i class="el-icon-user"></i>已拒绝
            <span>{{ summaryData.refused }}</span>
          </div>
          <i class="el-icon-refresh" @click="refresh('2')"></i>
        </div>
      </div>
      <div v-loading="loading" class="table-data">
        <el-table
          :data="tableData"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          ref="table"
        >
          <el-table-column
            type="selection"
            width="55"
            :selectable="selectable"
          ></el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="{ row }">
              <div class="opreate">
                <i
                  v-if="row.state === '0'"
                  class="el-icon-circle-check"
                  @click="showMark(row, 1)"
                ></i>
                <i
                  v-if="row.state === '0'"
                  class="el-icon-circle-close"
                  @click="showMark(row, 2)"
                ></i>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="user_id" label="用户名（ID）" width="150">
            <span slot-scope="{ row }"
              >{{ row.user_name }}(<span
                class="userId"
                @click.stop="showDetail(row.user_id)"
                >{{ row.user_id }}</span
              >)</span>
          </el-table-column>
          <el-table-column prop="vip_title" label="VIP级别"> </el-table-column>
          <el-table-column
            prop="parent_username"
            label="上级代理"
          ></el-table-column>
          <el-table-column prop="create_time" label="反水导入时间" width="104">
            <template v-slot="{ row }">{{
              formateTime(row.create_time)
            }}</template>
          </el-table-column>
          <el-table-column
            prop="bet_amount_total"
            label="总投注额"
            width="140"
          >
            <template v-slot="{ row }">{{
              Number(row.bet_amount_total).toFixed(2) - 0
            }}</template>
          </el-table-column>
          <el-table-column
            prop="effective_bet_amount_total"
            label="有效投注额（新）"
            width="140"
          >
            <template v-slot="{ row }">{{
              Number(row.effective_bet_amount_total).toFixed(2) - 0
            }}</template>
          </el-table-column>
          <el-table-column prop="rebate_rate" label="返水比例">
            <template v-slot="{ row }">{{
              Number(row.rebate_rate).toFixed(4) - 0
            }}</template>
          </el-table-column>
          <el-table-column prop="rebate_amount" label="总返水额">
            <template v-slot="{ row }">{{
              Number(row.rebate_amount).toFixed(2) - 0
            }}</template>
          </el-table-column>
          <el-table-column prop="state" label="处理状态">
            <template slot-scope="{ row }">
              <el-tag
                v-if="row.state === '1'"
                effect="plain"
                type="success"
                size="mini"
                >已返水</el-tag
              >
              <el-tag
                v-if="row.state === '2'"
                effect="plain"
                type="danger"
                size="mini"
                >已拒绝</el-tag
              >
              <el-tag
                v-if="row.state === '0'"
                effect="plain"
                type="warning"
                size="mini"
                >待返水</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="user_state" label="状态">
            <template slot-scope="{ row }">
              <el-tag
                v-if="row.user_state === '0'"
                effect="plain"
                type="success"
                size="mini"
                >启用</el-tag
              >
              <el-tag
                v-if="row.user_state === '1'"
                effect="plain"
                type="danger"
                size="mini"
                >停用</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column label="玩家标签" prop="tags" width="120">
            <template slot-scope="{ row }">
              <el-tag
                v-for="el in userTagsText(row.tags)"
                :key="el"
                size="mini"
                type="danger"
                >{{ el }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column label="详情">
            <template v-slot="{ row }">
              <el-button size="mini" type="text" @click="showDetails(row)"
                >查看</el-button
              >
            </template>
          </el-table-column>
          <el-table-column prop="operate_mark" label="备注"> </el-table-column>
          <el-table-column prop="operate_user_name" label="处理人">
          </el-table-column>
        </el-table>
        <div
          v-if="pagination.total > 0"
          style="margin-top: 20px; text-align: right"
        >
          <el-pagination
            background
            layout="prev, pager, next"
            :total="pagination.total"
            :page-size="pagination.itemsPerPage"
            :current-page.sync="pagination.pageNums"
            @current-change="loadData"
          ></el-pagination>
        </div>
      </div>
      <div class="tips">
        <p>有效投注额：</p>
        <p>1、会员赢钱时，若盈利金额＞下注金额，则有效投注额 = 下注本金</p>
        <p>2、会员赢钱时，若盈利金额≤下注金额，则有效投注额 = |盈利金额|</p>
        <p>3、会员输钱时，有效投注额 = |亏损金额|</p>
        <p>4、走水、取消注单时，有效投注额 = 0 （不记录进表单）</p>
        <p>
          5、串关、跳车玩法适用上述规则，二次结算只统计第一次注单结果的有效投注额
        </p>
      </div>
    </v-container>
    <el-dialog
      title="提示信息"
      :visible.sync="showMarkDialog"
      size="mini"
      width="350px"
      append-to-body
      :before-close="handleClose"
    >
      <div style="font-size: 16px; margin-bottom: 10px">
        您确定要{{ typeStr === 1 ? "通过" : "拒绝" }}用户<span
          style="color: #02a7f0"
          >[{{ currentItem.user_id }}]</span
        >的返水派发么？
      </div>
      <el-input v-model="markContent" type="textarea" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="showMarkDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitMarkHandle">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="detailDialogTitle"
      :visible.sync="showDetailDialog"
      size="mini"
      width="950px"
      append-to-body
      :before-close="handleClose"
    >
      <detail v-if="showDetailDialog" :order-id="currentId" />
    </el-dialog>
  </div>
</template>

<script>
import api from "@/api";
import { parseTime } from "@/utils";
import detail from "./components/rebate/detail.vue";
import XLSX from 'xlsx';

export default {
  name: "rebateDaily",
  components: {
    detail,
  },
  data() {
    return {
      today: "",
      searchOption: {},
      searchShow: true,
      dateRange: ["", ""],
      pagination: {
        pageNums: 1,
        itemsPerPage: 25,
        total: 0,
      },
      userName: "",
      tags: [],
      tagsOriginData: [],
      selectedTags: [],
      state: [
        {
          text: "待返水",
          value: "0",
        },
        {
          text: "已返水",
          value: "1",
        },
        {
          text: "已拒绝",
          value: "2",
        },
      ],
      selectedState: "",
      selected: [],
      tableData: [],
      summaryData: {
        waiting: 0,
        successful: 0,
        refused: 0,
      },
      loading: false,
      showMarkDialog: false,
      markContent: "",
      typeStr: "",
      currentId: "",
      currentItem: {},
      showDetailDialog: false,
      currentUser: {},
    };
  },
  created() {
    this.loadData(1);
    this.getTags();
    const date = new Date();
    this.today = this.formateTime(date);
  },
  computed: {
    detailDialogTitle() {
      return `详情  ${this.currentUser.user_name}  ${this.currentUser.vip_title} `;
    },
  },
  methods: {
    formateTime(date) {
      const timeStr = new Date(date).getTime();
      return parseTime(timeStr, "{y}{m}{d}");
    },
    showDetail(id) {
      // 指定顯示個人信息
      this.$store.commit("PLAYERDETAILACTIVE", 0);
      this.$nextTick(() => {
        this.$store.commit("PLAYER", id);
      });
    },
    showDetails(item) {
      this.showDetailDialog = true;
      this.currentId = item.id;
      this.currentUser = item;
    },
    selectable(row) {
      return row.state === "0";
    },
    resetOptions() {
      this.userName = "";
      this.selectedTags = [];
      this.selectedState = "";
    },
    _export() {
      if (!this.pagination.total) {
        this.$store.commit("MsgError", '无数据可导出！');
        return false
      }
      this.searchOption.num = this.pagination.itemsPerPage;
      const dateRange = this.dateRange || ["", ""];
      const params = {
        user_name: this.userName,
        state: this.selectedState,
        tags: this.selectedTags.join(","),
        page: this.pagination.pageNums,
        num: this.pagination.total,
        startTime: dateRange[0],
        endTime: dateRange[1],
      };
      
      api
        .get("/player/RebateMeterDay", params)
        .then((data) => {
          if (!data.result.RebateMeterDayList.length) {
            this.$store.commit("MsgError", this.$t("g_export_nodata"));
            return false
          }
          const _export = [];
          const cols = []
          const props = []
          const tableChildren = this.$refs.table.$children
          const refs = tableChildren.slice(2, tableChildren.length)
          refs.forEach(el => {
            if (el.prop) {
              cols.push(el.label)
              props.push(el.prop)
            }
          })
          _export.push(cols)
          data.result.RebateMeterDayList.forEach(row => {
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
          XLSX.writeFile(wb, `返水每日(${+d})派发.xlsx`);
        })
        .catch((error) => {
          this.$store.commit("MsgError", error.error);
        });
    },
    handleSelectionChange(val) {
      this.selected = val.filter((el) => el.state === "0").map((el) => el.id);
    },
    showMark(row, type) {
      this.showMarkDialog = true;
      this.currentItem = row;
      this.currentId = row.id;
      this.typeStr = type;
    },
    handleClose() {
      this.showMarkDialog = false;
      this.showDetailDialog = false;
      this.currentId = "";
      this.markContent = "";
      this.currentUser = {};
    },
    refresh(status) {
      this.selectedState = status;
      this.loadData(1);
    },
    submitMarkHandle() {
      this.opreateRebateHandle(this.currentId, this.typeStr, this.markContent);
      //   this.showMarkDialog = false;
    },
    getTags() {
      api.get("/player/tagkv").then((res) => {
        this.tagsOriginData = res;
        for (const key in res) {
          const obj = {
            text: res[key].name,
            value: key,
          };
          this.tags.push(obj);
        }
        // this.tags = [...res];
      });
    },
    loadData(p) {
      console.log(p);
      if (this.loading) {
        return;
      }
      this.loading = true;
      this.searchOption.page = p;
      this.searchOption.num = this.pagination.itemsPerPage;
      const dateRange = this.dateRange || ["", ""];
      const params = {
        user_name: this.userName,
        state: this.selectedState,
        tags: this.selectedTags.join(","),
        page: p,
        num: this.pagination.itemsPerPage,
        startTime: dateRange[0],
        endTime: dateRange[1],
      };
      api
        .get("/player/RebateMeterDay", params)
        .then((data) => {
          this.loading = false;
          this.tableData = data.result.RebateMeterDayList;
          this.summaryData = data.sum;
          this.pagination.total = data.total;
        })
        .catch((error) => {
          this.loading = false;
          this.$store.commit("MsgError", error.error);
        });
    },
    userTagsText(str) {
      if (!str) {
        return [];
      }
      const tags = str.split(",");
      const tagText = [];
      tags.forEach((el) => {
        if (this.tagsOriginData[el]) {
          tagText.push(this.tagsOriginData[el].name);
        }
      });
      return tagText;
    },
    confirmHandle(tips, title, id, type) {
      this.$confirm(tips, title, {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.opreateRebateHandle(id, type);
        })
        .catch();
    },
    mutipleAccept() {
      this.confirmHandle(
        `您确定要批量通过 ${this.selected.length} 条返水记录么？`,
        "通过",
        this.selected,
        1
      );
    },
    // 操作返水
    opreateRebateHandle(id, type, mark) {
      const ids = id instanceof Array ? id.join(",") : `${id}`;
      const data = {
        data: ids,
        typeStr: type,
        operateMark: mark || "",
      };
      api
        .post("/player/RebateMeterDaySend", data)
        .then((res) => {
          this.showMarkDialog = false;
          if (id instanceof Array) {
            const tips = `操作成功：${res.successOrder}，失败：${res.failOrder}`
            this.$alert(tips, '提示', {
              confirmButtonText: "确定",
              type: "warning",
            }).then(() => {
              this.loadData(this.pagination.page);
            });
            return;
          }
          this.loadData(this.pagination.page);
          this.$store.commit("MsgOk", this.$t("g_msgSaved"));
        })
        .catch((error) => {
          console.log(error)
          this.loading = false;
          this.$store.commit("MsgError", error.error);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.rebate {
  .userId {
    color: #02a7f0;
    cursor: pointer;
  }
  .rebate-count {
    height: 40px;
    display: flex;
    justify-content: space-between;
    & > div {
      width: 32%;
      padding: 10px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #fff;
      div {
        width: 150px;
        font-size: 18px;
        i {
          margin-right: 10px;
          color: #333;
        }
      }
      i {
        font-size: 22px;
        &.el-icon-refresh {
          cursor: pointer;
        }
      }
    }
    .pending-rebate {
      background: rgba(255, 152, 0, 1);
    }
    .rebated {
      background: rgba(75, 175, 80, 1);
    }
    .refused {
      background: rgba(244, 67, 53, 1);
    }
  }
  .table-data {
    margin-top: 20px;
    padding: 20px;
    border-radius: 10px;
    background: #fff;
    .opreate {
      font-size: 24px;
      color: #02a7f0;
      i {
        margin: 0 2px;
        cursor: pointer;
      }
    }
  }
  .tips {
    margin-top: 20px;
    color: #f00;
    line-height: 14px;
  }
}
</style>
