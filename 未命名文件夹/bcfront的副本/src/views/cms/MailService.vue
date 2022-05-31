<template>
  <div class="MailService">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> menu_book </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 搜尋 重置 新增站內信 展開按鈕 -->
      <div class="pr-3">{{ registerEmailconfigName }}</div>
      <v-switch v-model="enableRegisterEmail" hide-details @change="postRegisterEmailConfig"></v-switch>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="loadData(1, true)">
            <v-icon>search</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_search') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="initSelector">
            <v-icon>find_replace</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_reset') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="insertOrEditClick({})">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('cms_email_add_mail') }}</span>
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

    <v-container fluid class="pa-5">
      <!-- 搜尋 -->
      <v-card v-if="searchShow" elevation="0" class="pa-3 mb-3 rounded-lg" color="blue-grey lighten-4">
        <v-row dense class="d-flex align-center justify-space-between">
          <v-col>
            <v-select
              v-model="searchModel.type"
              :items="selectorOption.type"
              item-value="value"
              :item-text="'text'"
              hide-details
              solo
              persistent-hint
              :label="$t('cms_email_column_letter_type')"
              @keydown.enter="loadData(1, true)"
            ></v-select>
          </v-col>
          <v-col>
            <v-select
              v-model="searchModel.send_group_type"
              :items="selectorOption.send_group_type"
              item-value="value"
              :item-text="'text'"
              :label="$t('cms_email_column_transmission_type')"
              hide-details
              solo
              persistent-hint
            ></v-select>
          </v-col>
          <v-col>
            <v-menu ref="menu" v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="290px">
              <template #activator="{ on }">
                <v-text-field
                  v-model="searchModel.send_time"
                  :label="$t('cms_email_column_send_time')"
                  readonly
                  hide-details
                  solo
                  persistent-hint
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-if="menu"
                v-model="searchModel.send_time"
                color="primary"
                @change="$refs.menu.save(searchModel.send_time)"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col>
            <v-select
              v-model="searchModel.is_send"
              hide-details
              solo
              persistent-hint
              :items="selectorOption.is_send"
              item-value="value"
              :item-text="'text'"
              :label="$t('cms_email_column_sending_status')"
            ></v-select>
          </v-col>
          <v-col>
            <v-select
              v-model="selectedCreators"
              :items="creators"
              item-value="value"
              item-text="text"
              :label="$t('cms_email_choose_operator')"
              multiple
              clearable
              hide-details
              solo
              persistent-hint
              ><template #prepend-item>
                <v-list-item ripple @click="toggleSelectAllCreator">
                  <v-list-item-action>
                    <v-icon :color="creators.length > 0 ? 'indigo darken-4' : ''">{{ selectCreatorIcon }}</v-icon>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title>{{ $t('g_selector_default_optionAll') }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-divider class="mt-1"></v-divider> </template
            ></v-select>
          </v-col>
        </v-row>
      </v-card>

      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          ref="dataTable"
          :headers="headerComputed"
          :items="dataList"
          :loading="loading"
          :disable-sort="loading"
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
          :sort-desc.sync="pagination.sortDesc"
          :sort-by.sync="pagination.sortBy"
          class="elevation-0"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item }">
            <tr>
              <td class="text-left text-no-wrap">{{ item.id }}</td>
              <td class="text-left text-no-wrap">
                <v-chip label outlined small color="blue">{{ item.typeText }}</v-chip>
              </td>
              <td class="text-left text-no-wrap">
                <a class="text-decoration-none clamp-line" href="javascript:void(0)" @click="insertOrEditClick(item, true)">{{ item.title }}</a>
              </td>
              <!-- <td class="text-left text-no-wrap">{{ item.content }}</td> -->
              <td class="text-left text-no-wrap">
                <v-chip label outlined small color="blue">{{ item.sendGroupType }}</v-chip>
              </td>
              <td class="text-left text-no-wrap">
                <a class="text-decoration-none clamp-line" href="javascript:void(0)" @click="tips(item, 'all')">
                  {{ item.usersText | emptyToBeDash }}
                </a>
              </td>
              <td class="text-left text-no-wrap">{{ item.total_count }}</td>
              <td class="text-center text-no-wrap">
                <a class="text-decoration-none" href="javascript:void(0)" @click="tips(item, 'total_send_count')">{{ item.total_send_count }}</a>
              </td>
              <td class="text-center text-no-wrap">
                <a class="text-decoration-none" href="javascript:void(0)" @click="tips(item, 'total_read_count')">{{ item.total_read_count }}</a>
              </td>
              <td class="text-center text-no-wrap">
                <a class="text-decoration-none" href="javascript:void(0)" @click="tips(item, 'total_unread_count')">{{ item.total_unread_count }}</a>
              </td>
              <td class="text-center">
                <a class="text-decoration-none" href="javascript:void(0)" @click="tips(item, 'total_received_count')">
                  {{ item.total_received_count | emptyToBeDash }}
                </a>
              </td>
              <td class="text-center text-no-wrap">
                <v-chip label outlined small :color="item.isSend.color">{{ item.isSend.text }}</v-chip>
              </td>
              <td class="text-left text-no-wrap">{{ item.send_time | formatDate }}</td>
              <td class="text-left text-no-wrap">{{ item.event_end_time | formatDate | emptyToBeDash }}</td>
              <td class="text-left text-no-wrap">{{ item.created | formatDate }}</td>
              <td class="text-left text-no-wrap">{{ item.creator }}</td>
              <td class="text-left text-no-wrap">
                <v-btn v-if="!item.is_send" class="my-1" small depressed color="primary" @click="insertOrEditClick(item)">
                  {{ $t('g_btn_edit') }}
                </v-btn>
                <template v-else-if="item.type === 1">
                  <v-btn
                    v-if="item.total_count > item.total_received_count && item.is_revoked === true"
                    class="my-1"
                    small
                    depressed
                    color="grey darken-2 white--text"
                    @click="revokeList(item)"
                  >
                    {{ $t('cms_email_btn_take_back_list') }}
                  </v-btn>
                  <v-btn
                    v-if="item.total_count > item.total_received_count && item.is_revoked === false"
                    class="my-1"
                    small
                    depressed
                    color="red accent-4 white--text"
                    @click="revoke(item.id)"
                  >
                    {{ $t('cms_email_btn_revoke') }}
                  </v-btn>
                  <v-btn
                    v-if="item.total_count > item.total_send_count"
                    class="my-1"
                    small
                    depressed
                    color="orange accent-3 white--text"
                    @click="reSend(1)"
                  >
                    {{ $t('cms_email_btn_reissue') }}
                  </v-btn>
                </template>
              </td>
            </tr>
          </template>
        </v-data-table>

        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
          </div>
        </div>
      </v-card>
    </v-container>

    <!-- 新增站內信彈窗 -->
    <MailboxDialog
      v-if="mailboxDialog"
      v-model="mailboxDialog"
      :disabled="mailboxEditIsDisabled"
      :item="logDetail"
      :options="selectorOption"
      @close="logDetail = {}"
      @update="mailboxDialogUpdate"
    ></MailboxDialog>
    <RevokeListDialog v-model="revokeListDialog" :item="revokeItem"></RevokeListDialog>
    <PlayerListTipDialog v-model="playerListTipDialog" :item="tipItem"></PlayerListTipDialog>
  </div>
</template>

<script>
import api from '@/api';
import MailboxDialog from './components//mailService/MailboxDialog';
import RevokeListDialog from './components//mailService/RevokeListDialog';
import PlayerListTipDialog from './components//mailService/PlayerListTipDialog';
import { GET_STATION_LETTER_LIST, GET_PLAYER_VIP_LIST, POST_STATION_RESEND, POST_STATION_REVOKE } from '@/api/Uri';
import { getConfigByCode, postConfigByCode } from '../../lib/configAPI';
export default {
  name: 'MailService',
  components: {
    MailboxDialog,
    RevokeListDialog,
    PlayerListTipDialog,
  },
  data() {
    return {
      // register email
      registerEmailconfigKey: 'enable_email',
      registerEmailconfigUsed: 2,
      registerEmailconfigName: '注册时是否寄站内信',
      enableRegisterEmail: true,
      value1: null,
      mailboxDialog: false,
      revokeListDialog: false,
      playerListTipDialog: false,
      mailboxEditIsDisabled: false,
      menu: false,
      selectItem: 25,
      selectItems: [10, 25, 50, 100],
      valid: true,
      searchShow: true,
      loading: false,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
        sortBy: [],
        sortDesc: [],
        descending: true,
        totalItems: 0,
      },
      headers: [
        {
          lang: 'g_table_column_sn',
          text: 'SN',
          value: 'id',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_email_column_letter_type',
          text: '信件类型',
          value: 'type',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_email_column_letter_title',
          text: '信件标题',
          value: 'title',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        // {
        //   lang: '信件內容',
        //   text: '信件內容',
        //   value: 'content',
        //   sortable: false,
        //   class: 'text-no-wrap blue-grey lighten-5',
        //   align: 'left',
        // },
        {
          lang: 'cms_email_column_transmission_type',
          text: '发送类型',
          value: 'send_group_type',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_email_column_recipient',
          text: '收件人',
          value: 'users',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_email_column_total',
          text: '总数',
          value: 'total_count',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_email_column_sent',
          text: '已发数',
          value: 'total_send_count',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'cms_email_column_read',
          text: '已读数',
          value: 'total_read_count',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'cms_email_column_unread',
          text: '未读数',
          value: 'total_unread_count',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'cms_email_column_number_of_received',
          text: '已领取数',
          value: 'total_received_count',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'cms_email_column_sending_status',
          text: '发送状态',
          value: 'is_send',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'cms_email_column_send_time',
          text: '发送时间',
          value: 'send_time',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_email_column_deadline_for_collection',
          text: '领取截止',
          value: 'event_end_time',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_created',
          text: '创建时间',
          value: 'created',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'cms_email_column_operator',
          text: '操作者',
          value: 'creator',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_action',
          text: '操作',
          value: 'action',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
      ],
      logs: [],
      logDetail: {},
      tipItem: {},
      revokeItem: {},
      selectorOption: {
        type: [
          // { lang: () => this.$t('cms_email_options_general'), text: '一般', value: 0 },
          // { lang: () => this.$t('cms_email_options_activity_money'), text: '活动金', value: 1 },
        ], // 信件類型
        send_group_type: [
          // { lang: () => this.$t('cms_email_options_customize'), text: '自定义', value: 0 },
          // { lang: () => this.$t('cms_email_options_VIP_group'), text: 'VIP群組', value: 1 },
        ], // 收件人類型
        is_send: [
          // { lang: () => this.$t('cms_email_options_unsent'), text: '未发送', value: 0 },
          // { lang: () => this.$t('cms_email_options_has_been_sent'), text: '已发送', value: 1 },
          // { lang: () => this.$t('cms_email_options_sending'), text: '发送中', value: 2 },
        ],
        pt_list: {}, // 禮金類別 api 取得
        vipGroupList: [], // vip 列表 form api
      },
      searchModel: {
        type: null, // 信件类型 (0:一般, 1:活动金)
        send_group_type: null, // 发送类型 (0:自定義, 1:群發用戶)
        send_time: null, // 發送時間
        is_send: null, // 發送狀態 (0:未發送, 1:已發送)
        page: 1,
        num: 10,
        creator: '',
      },
      Status: true,
      selectedCreators: [],
      creators: [],
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    dataList() {
      return this.logs;
    },
    uploadHeader() {
      return {
        Authorization: `token ${this.$store.getters.token}`,
      };
    },
    selectAllCreator() {
      return this.creators.length === this.selectedCreators.length;
    },
    selectSomeCreator() {
      return this.selectedCreators.length > 0 && !this.selectAllCreator;
    },
    selectCreatorIcon() {
      if (this.selectAllCreator) {
        return 'mdi-close-box';
      } else if (this.selectSomeCreator) {
        return 'mdi-minus-box';
      } else {
        return 'mdi-checkbox-blank-outline';
      }
    },
    headerComputed() {
      return this.headers.map(item => {
        item.text = this.$t(item.lang);
        return item;
      });
    },
  },
  watch: {
    'pagination.page'(n) {
      this.loadData(n);
    },
    'pagination.sortDesc'(desc) {
      if (desc != null) {
        this.pagination.page = 1;
        this.loadData(this.pagination.page);
      }
    },
    'pagination.sortBy'(by) {
      if (by != null) {
        this.pagination.page = 1;
        this.loadData(this.pagination.page);
      }
    },
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.pagination.page = 1;
      // this.pagination.length = parseInt((this.pagination?.totalItems ?? 1) / newVal) + 1;
      this.loadData(this.pagination.page);
    },
  },
  created() {
    // 載入vip資料
    this.$store.dispatch('VIP_CONFIG');
    this.getRegisterEmailConfig();
  },
  mounted() {
    this.getVip();
    this.loadData(1);
  },
  methods: {
    getRegisterEmailConfig() {
      // this.loading = true;
      getConfigByCode({ code: this.registerEmailconfigKey, used: this.registerEmailconfigUsed })
        .then(data => {
          const { result = {} } = data;
          this.enableRegisterEmail = result.Val === '1';
        })
        .catch(error => {
          console.error(error);
        })
        .finally(() => {
          // this.loading = false;
        });
    },
    postRegisterEmailConfig() {
      this.loading = true;
      const val = this.enableRegisterEmail ? '1' : '0';
      postConfigByCode({ code: this.registerEmailconfigKey, used: this.registerEmailconfigUsed, remark: this.registerEmailconfigName, val })
        .then(() => {})
        .catch(error => {
          console.error(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    initSelector() {
      ['type', 'send_group_type', 'send_time', 'is_send'].forEach(key => (this.searchModel[key] = null));
      this.selectedCreators = [];
    },
    loadData(page) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      this.searchModel.creator = this.selectedCreators.join(',');
      api
        .get(GET_STATION_LETTER_LIST, {
          ...this.searchModel,
          page,
          page_num: this.pagination.itemsPerPage,
        })
        .then(data => {
          this.selectorOption.pt_list = data.result.pt_list;
          // _.forEach(data.result.slt_list, (text, value) => this.selectorOption.type.push({ text, value: Number(value) })); // 信件類型
          // _.forEach(data.result.sgt_list, (text, value) => this.selectorOption.send_group_type.push({ text, value: Number(value) })); // 发送类型
          // _.forEach(data.result.ss_list, (text, value) => this.selectorOption.is_send.push({ text, value: Number(value) })); // 發送狀態
          this.selectorOption.type = _.map(data.result.slt_list, (text, value) => {
            return { text, value: Number(value) };
          });
          this.selectorOption.send_group_type = _.map(data.result.sgt_list, (text, value) => {
            return { text, value: Number(value) };
          });
          this.selectorOption.is_send = _.map(data.result.ss_list, (text, value) => {
            return { text, value: Number(value) };
          });

          _.map(data.result.list, item => {
            item.isSend = { text: data.result.ss_list[item.is_send], color: item.is_send === 1 ? 'light-green--text text--darken-1' : 'grey--text' };
            item.typeText = _.find(this.selectorOption.type, x => x.value === item.type).text;
            item.sendGroupType = _.find(this.selectorOption.send_group_type, x => x.value === item.send_group_type).text;
            let userTrans = Array.from(item?.users?.split(',') ?? '', x => x.split('|')[0]).join(',');
            if (item.send_group_type === 1) {
              userTrans = Array.from(item?.users?.split(',') ?? '', x => {
                return _.find(this.selectorOption.vipGroupList, item => item.vip_lv === Number(x))?.vip_lv_desc;
              })
                .filter(y => !!y)
                .join(',');
            }
            item.usersText = userTrans;
            return item;
          });
          this.logs = data.result.list == null ? [] : data.result.list;
          this.creators = data.result.creator_list;
          this.pagination.length = Math.ceil(data.result.count / this.pagination.itemsPerPage);
          this.pagination.totalItems = data.result.count;
          this.pagination.page = data.result.page;
          this.loading = false;
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
          this.loading = false;
        });
    },
    insertOrEditClick(item, disabled = false) {
      this.logDetail = item;
      this.mailboxDialog = true;
      this.mailboxEditIsDisabled = disabled;
    },
    mailboxDialogUpdate(event) {
      !event.refresh || this.loadData(this.pagination.page);
      this.logDetail = {};
    },
    revoke(id) {
      this.$store.commit('Confirm', {
        text: this.$t('cms_email_confirm_reissue_revoke'),
        ok: () => {
          this.loading = true;
          api
            .post(POST_STATION_REVOKE, { id })
            .then(() => {
              this.$store.commit('MsgOk', this.$t('cms_email_has_been_revoke'));
              this.loading = false;
              this.loadData(this.pagination.page);
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
              this.loading = false;
            });
        },
      });
    },
    reSend(id) {
      this.$store.commit('Confirm', {
        text: this.$t('cms_email_confirm_reissue'),
        ok: () => {
          this.loading = true;
          api
            .post(POST_STATION_RESEND, { id })
            .then(() => {
              this.$store.commit('MsgOk', this.$t('cms_email_reissued'));
              this.loading = false;
              this.loadData(this.pagination.page);
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
              this.loading = false;
            });
        },
      });
    },
    revokeList(item) {
      this.revokeItem = item;
      this.revokeListDialog = true;
    },
    tips(item, key) {
      const dictionary = {
        total_send_count: { value: 0, text: this.$t('cms_email_sent_list') }, // 已发送清单
        total_read_count: { value: 1, text: this.$t('cms_email_read_list') }, // 已读清单
        total_unread_count: { value: 2, text: this.$t('cms_email_unread_list') }, // 未读清单
        total_received_count: { value: 3, text: this.$t('cms_email_received_list') }, // 已领取清单
        all: { value: 0, text: this.$t('cms_email_recipient_list') }, // 收件人清单
      };
      this.tipItem = {
        title: dictionary[key].text,
        id: item.id,
        type: dictionary[key].value,
      };
      this.playerListTipDialog = true;
    },
    getVip() {
      this.selectorOption.vipGroupList = this.$store.state.sys.vip;
    },
    toggleSelectAllCreator() {
      this.$nextTick(() => {
        if (this.selectAllCreator) {
          this.selectedCreators = [];
        } else {
          this.selectedCreators = this.creators.slice();
        }
      });
    },
  },
};
</script>
