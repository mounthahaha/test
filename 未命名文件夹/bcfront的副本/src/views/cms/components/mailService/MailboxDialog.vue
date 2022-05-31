<template>
  <v-dialog v-model="model" persistent width="800px" :retain-focus="false" eager>
    <v-overlay absolute :value="loading"></v-overlay>
    <v-toolbar dark color="primary">
      <v-toolbar-title class="headline">{{ isInsert ? $t('cms_email_add_mail') : $t('cms_email_edit_mail') }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-chip class="pa-1" color="transparent" @click.native="closeDialog">
        <v-icon>close</v-icon>
      </v-chip>
    </v-toolbar>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-card style="overflow: scroll" :loading="fetchLoading || loading" height="750px" tile>
        <v-card-text v-if="!fetchLoading" class="pa-8">
          <!--收件人：-->
          <v-row no-gutters>
            <v-col class="pt-2" cols="2" align-self-start>
              <span class="red--text">*</span>
              <span>{{ $t('cms_email_span_recipient') }}</span>
            </v-col>
            <v-col cols="10">
              <v-row dense>
                <v-col cols="12">
                  <v-btn-toggle v-model="inputPost.send_group_type" class="blue-btn-group" tile mandatory>
                    <v-btn
                      v-for="(item, index) in inputSetting.send_group_type"
                      :key="`inputSetting.send_group_type_${item.value}_${index}`"
                      :value="item.value"
                      tile
                      small
                      height="38px"
                    >
                      <span class="px-4">{{ item.text }}</span>
                    </v-btn>
                  </v-btn-toggle>
                </v-col>
                <!--user 單一收件人-->
                <template v-if="inputPost.send_group_type === 0">
                  <v-col cols="8" class="pt-4">
                    <v-autocomplete
                      ref="autocomplete"
                      v-model="inputSetting.recipientChipsModel"
                      :rules="[() => inputSetting.recipientChipsModel.length > 0 || $t('cms_email_recipient_required')]"
                      :disabled="isUpdating || disabled"
                      :items.sync="inputPost.recipientChipsObject"
                      filled
                      chips
                      clearable
                      color="blue-grey lighten-2"
                      :label="$t('cms_email_search_recipient')"
                      multiple
                      item-text="name"
                      item-value="name"
                      solo
                      dense
                      small-chips
                      @update:search-input="autoWordToApi"
                    >
                      <template slot="selection" slot-scope="data">
                        <v-chip dark close @click:close="removeChip(data.item)">{{ data.item.name }}</v-chip>
                      </template>
                      <template slot="item" slot-scope="data">
                        {{ data.item.name }}
                      </template>
                      <template slot="no-data">
                        <span class="pl-3">{{ $t('g_text_noData') }} － {{ $t('cms_email_recipient_no_data_tips') }}</span>
                      </template>
                    </v-autocomplete>
                  </v-col>
                  <v-col cols="4" class="pt-4 text-right">
                    <a
                      class="v-btn v-btn--contained theme--light v-size--default primary ma-1 text-capitalize"
                      :loading="loading"
                      download
                      href="/template.csv"
                    >
                      {{ $t('cms_email_download_import_template') }}
                    </a>
                    <v-btn color="primary ma-1 text-capitalize" depressed :loading="loading" @click="$refs.uploader.click()">
                      {{ $t('cms_email_import_csv') }}
                    </v-btn>
                    <input ref="uploader" class="d-none" type="file" accept=".csv" @change="onFileChanged" />
                  </v-col>
                </template>
                <!--send_group_type ＶＩＰ群組-->
                <template v-else>
                  <v-col cols="12" class="pt-3 pb-3">
                    <v-btn-toggle v-model="inputPost.vipListModel" class="blue-btn-group" tile multiple mandatory>
                      <v-row no-gutters>
                        <v-col v-for="item in inputSetting.vipGroupList" :key="`vipGroupList_${item.id}`" cols="3">
                          <v-btn class="my-2" width="100px" :value="item.vipLv" tile small depressed height="38px">
                            <span class="mx-4">{{ item.vipLvDesc }}</span>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-btn-toggle>
                  </v-col>
                </template>
              </v-row>
            </v-col>
          </v-row>
          <!--信件类型-->
          <v-row no-gutters>
            <v-col class="pt-2" cols="2" align-self-start>
              <span class="red--text">*</span>
              <span>{{ $t('cms_email_span_letter_type') }}</span>
            </v-col>
            <v-col cols="10">
              <v-btn-toggle v-model="inputPost.type" class="blue-btn-group" style="width: 100%" tile mandatory>
                <v-row no-gutters>
                  <v-col v-for="(item, index) in inputSetting.type" :key="`inputSetting.type_${item.value}_${index}`" cols="6">
                    <v-btn block :value="item.value" tile small depressed height="38px">
                      <span class="px-4">{{ item.text }}</span>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-btn-toggle>
            </v-col>
          </v-row>
          <!--活动區塊-->
          <template v-if="inputPost.type === 1">
            <!-- 活動金 -->
            <v-row class="mt-5" no-gutters>
              <v-col class="pt-2" cols="2" align-self-start>
                <span class="red--text">*</span>
                <span>{{ $t('cms_email_activity_fund') }}：</span>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  ref="money"
                  v-model.number="inputPost.money"
                  :rules="[rules.emptyCheck, rules.positiveInteger]"
                  min-width="500"
                  :label="$t('cms_email_placeholder_activity_money')"
                  :placeholder="$t('cms_email_placeholder_activity_money')"
                  solo
                  dense
                  :disabled="disabled"
                  clearable
                ></v-text-field>
              </v-col>
              <v-col class="pt-2" cols="2" align-self-start>
                <span class="red--text">*</span>
                <span>{{ $t('cms_email_activity_fund_bet') }}</span>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  ref="bet_multiple"
                  v-model.number="inputPost.bet_multiple"
                  :rules="[rules.emptyCheck, rules.positiveInteger]"
                  min-width="400"
                  append-outer-icon="mdi-percent"
                  :label="$t('cms_email_placeholder_activity_fund_bet')"
                  :placeholder="$t('cms_email_placeholder_activity_fund_bet')"
                  solo
                  dense
                  :disabled="disabled"
                  clearable
                ></v-text-field>
              </v-col>
            </v-row>
            <!-- 領取時限 -->
            <v-row class="mt-5" no-gutters>
              <v-col class="pt-2 pl-2" cols="2" align-self-start>
                <span class="red--text">*</span>
                <span>{{ $t('cms_email_deadline') }}：</span>
              </v-col>
              <v-col cols="4">
                <el-date-picker
                  v-model="inputPost.event_end_time"
                  class="el-date-editor-vuetify-text-field small"
                  type="datetime"
                  :placeholder="$t('g_selector_time')"
                  :clearable="false"
                  :disabled="disabled"
                  :picker-options="eventPickerOptions"
                  default-time="08:00:00"
                  value-format="yyyy-MM-dd HH:mm:ss"
                >
                </el-date-picker>
                <span v-if="errorMessages.event_end_time.active" class="error--text overline">{{ errorMessages.event_end_time.text }}</span>
              </v-col>
            </v-row>
            <!-- 禮金類別 -->
            <v-row class="mt-5" no-gutters>
              <v-col class="pt-2" cols="2" align-self-start>
                <span class="red--text">*</span>
                <span>{{ $t('cms_email_span_gift_category') }}：</span>
              </v-col>
              <v-col cols="4">
                <v-select
                  ref="promotions"
                  v-model="inputPost.promotion_type"
                  :items="inputSetting.pt"
                  :disabled="disabled"
                  :rules="[rules.required]"
                  item-value="value"
                  item-text="text"
                  :label="$t('cms_email_letter_type')"
                  clearable
                  dense
                  solo
                ></v-select>
              </v-col>
            </v-row>
          </template>
          <!--信件标题-->
          <v-row :class="{ 'mt-4': inputPost.type === 0 }" no-gutters>
            <v-col class="pt-2" cols="2" align-self-start>
              <span class="red--text">*</span>
              <span>{{ $t('cms_email_span_letter_title') }}</span>
            </v-col>
            <v-col cols="10">
              <v-text-field
                ref="title"
                v-model="inputPost.title"
                :disabled="disabled"
                :rules="[rules.emptyCheck]"
                min-width="500"
                :label="$t('cms_email_placeholder_letter_title')"
                :placeholder="$t('cms_email_placeholder_letter_title')"
                solo
                dense
                clearable
              ></v-text-field>
            </v-col>
          </v-row>
          <!--公告內容-->
          <v-row no-gutters>
            <v-col class="pt-2" cols="2" align-self-start>
              <span class="red--text">*</span>
              <span>{{ $t('cms_email_span_announcement_content') }}</span>
            </v-col>
            <v-col cols="10">
              <keep-alive>
                <editor
                  id="tiny-edit"
                  v-model="inputPost.content"
                  :api-key="$store.getters.tinymceKey"
                  :init="initTinyMceSetting"
                  :disabled="disabled"
                ></editor>
              </keep-alive>
              <span v-if="errorMessages.content.active" class="error--text overline">{{ errorMessages.content.text }}</span>
            </v-col>
          </v-row>
          <!--发送时间-->
          <v-row class="mt-3" no-gutters>
            <v-col class="pt-2" cols="2" align-self-start>
              <span>{{ $t('cms_email_span_send_time') }}</span>
            </v-col>
            <v-col cols="4" align-self-center>
              <el-date-picker
                v-model="inputPost.send_time"
                type="datetime"
                :placeholder="$t('g_selector_time')"
                class="el-date-editor-vuetify-text-field small"
                :disabled="disabled"
                :clearable="false"
                :picker-options="sendPickerOptions"
                value-format="yyyy-MM-dd HH:mm:ss"
                default-time="08:00:00"
                @change="inputPost.event_end_time = null"
              >
              </el-date-picker>
              <!--                  <span v-if="errorMessages.send_time.active" class="error&#45;&#45;text overline">{{ errorMessages.send_time.text }}</span>-->
            </v-col>
            <v-col align-self="center">
              <span class="error--text pl-3">{{ $t('cms_email_miss_tips') }}</span>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <v-card tile>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="red lighten-1" color="error" depressed :loading="loading" @click="closeDialog">
            {{ !disabled ? $t('g_btn_cancel') : $t('g_btn_exit') }}
          </v-btn>
          <v-btn v-if="!disabled" color="primary" depressed :loading="loading" @click="submit">{{ $t('g_btn_confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import api from '@/api';

import Editor from '@tinymce/tinymce-vue';
import { formatDate } from '@/filters/custom';
import dialog from '@/components/mixins/dialog.js';
import { POST_STATION_LETTER_LIST, PUT_STATION_LETTER_LIST, GET_GLOBAL_USER_SEARCH, POST_GLOBAL_UPLOAD_CSV } from '@/api/Uri';

export default {
  name: 'MailboxDialog',
  components: { editor: Editor },
  mixins: [dialog],
  data() {
    return {
      tempAutoSearch: '', // 避免重複查找
      isUpdating: false, // 搜尋收件人loading
      valid: false,
      inputSetting: {
        recipientChipsModel: [], // 收件人 chips 儲存區
        vipGroupList: [], // vip 列表 form api
        type: [], // 信件類型
        send_group_type: [], // 收件人類型
        pt: [], // 禮金類別
        send_time_menu: false,
        event_end_time_menu: false,
      },
      inputPost: {
        send_group_type: 0,
        promotion_type: 0,
        title: '',
        type: 0,
        money: null,
        bet_multiple: 100,
        send_time: null,
        event_end_time: null,
        vipListModel: [],
        recipientChipsObject: [],
        content: '',
      },
      errorMessages: {
        // send_time: { text: '必填栏位', active: false, key: 'send_time' },
        event_end_time: { text: '必填栏位', active: false, key: 'event_end_time' },
        content: { text: '必填栏位', active: false, key: 'content' },
      },
      initTinyMceSetting: {
        selector: 'textarea#tiny-edit',
        height: 350,
        menubar: false,
        language: 'zh_CN',
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste imagetools wordcount',
        ],
        file_picker_types: 'file image media',
        fontsize_formats: '8px 10px 12px 14px 18px 24px 36px',
        toolbar:
          'undo redo | link image | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent ',
      },
      sendPickerOptions: {
        disabledDate: time => {
          return time.getTime() < Date.now();
        },
      },
      eventPickerOptions: {
        disabledDate: time => {
          const endTime = this.checkDBIsDate(this.inputPost.send_time) ? new Date(this.inputPost.send_time) : Date.now();
          return time.getTime() < endTime;
        },
      },
    };
  },
  watch: {
    // @todo isUpdating
    isUpdating(val) {
      if (val) {
        setTimeout(() => {
          this.isUpdating = false;
          this.$refs.autocomplete.$refs.input.focus();
        }, 1000);
      }
      this.$refs.autocomplete.$refs.input.focus();
    },
    'inputSetting.recipientChipsModel'() {
      this.moveChipsToTrueGroup();
    },
  },
  created() {
    this.fetchLoading = true;
    this.init();
    this.isInsert || this.initEdit();
    setTimeout(() => {
      this.fetchLoading = false;
    }, 1000);
  },
  methods: {
    init() {
      this.inputSetting = _.assignIn(this.inputSetting, this.options);
      _.forEach(this.options.pt_list, (item, key) => this.inputSetting.pt.push({ text: item, value: Number(key) }));
    },
    initEdit() {
      const field = _.cloneDeep(this.item);
      this.inputPost.send_group_type = Number(field.send_group_type);
      this.inputPost.promotion_type = Number(field.promotion_type);
      this.inputPost.title = field.title;
      this.inputPost.type = Number(field.type);
      this.inputPost.money = field.money;
      this.inputPost.bet_multiple = field.bet_multiple ? field.bet_multiple : 100;
      this.inputPost.content = field.content;
      this.inputPost.send_time = this.checkDBIsDate(field.send_time) ? new Date(field.send_time) : this.inputPost.send_time;
      this.inputPost.event_end_time = this.checkDBIsDate(field.event_end_time) ? new Date(field.event_end_time) : this.inputPost.event_end_time;
      switch (Number(field.send_group_type)) {
        case 0:
          // eslint-disable-next-line no-case-declarations
          const isSearch = [];
          _.forEach(field?.users?.split(',') ?? [], x => {
            const tempSplit = x.split('|');
            // 清除重複使用者 //怕ＤＢ錯誤
            if (!_.find(isSearch, item => item.id === tempSplit[1])) {
              isSearch.push({ name: `${tempSplit[0]}(${tempSplit[1]})`, id: tempSplit[1], group: 'isSearch' });
            }
          });
          // 選取設置
          isSearch.forEach(item => this.inputSetting.recipientChipsModel.push(item.name));
          // 可選項目設置
          this.classification([], isSearch);
          break;
        case 1:
          this.inputPost.vipListModel = Array.from(field?.users?.split(',') ?? [], num => Number(num));
          break;
        default:
      }
    },
    submit() {
      let flag = true;
      ['autocomplete', 'title', 'money', 'promotions', 'bet_multiple'].forEach(item => {
        if (this.$refs[item] && Object.keys(this.$refs[item]).length !== 0) {
          // console.log('item', item, this.$refs[item].validate(true));
          if (!this.$refs[item].validate(true)) {
            flag = false;
          }
        }
      });
      // 必填栏位;
      _.map(this.errorMessages, item => {
        if (this.inputPost.type === 0 && item.key === 'event_end_time') {
          return item;
        }
        item.active = !this.inputPost[item.key];
        if (item.active) {
          flag = false;
        }
        // console.log(`${item.key}=${this.inputPost[item.key]}`, this.inputPost.type);
        return item;
      });
      const post = {
        send_group_type: this.inputPost.send_group_type,
        promotion_type: this.inputPost.promotion_type,
        users: '',
        type: this.inputPost.type,
        title: this.inputPost.title,
        content: this.inputPost.content,
        money: this.inputPost.type === 0 ? null : this.inputPost.money || null,
        bet_multiple: this.inputPost.type === 0 ? null : this.inputPost.bet_multiple || null,
        send_time: this.checkDBIsDate(this.inputPost.send_time) ? formatDate(this.inputPost.send_time) : null,
        event_end_time:
          this.checkDBIsDate(this.inputPost.event_end_time) && this.inputPost.type !== 0 ? formatDate(this.inputPost.event_end_time) : null,
      };
      if (!this.isInsert) {
        post.id = this.item.id;
      }
      const temp = [];
      switch (post.send_group_type) {
        case 0:
          this.inputPost.recipientChipsObject.forEach(item => item.group !== 'isSearch' || temp.push(item.id));
          post.users = temp.join(',');
          break;
        case 1:
          post.users = this.inputPost.vipListModel.join(',');
          break;
        default:
          break;
      }
      // console.log('submit post 資料', flag, post);
      // console.log('submit inputPost', this.inputPost);
      // flag = false;
      if (flag) {
        this.loading = true;
        this.$emit('change', post);
        api
          .post(this.isInsert ? POST_STATION_LETTER_LIST : PUT_STATION_LETTER_LIST, post)
          .then(() => {
            this.$store.commit('MsgOk', this.isInsert ? this.$t('g_msgInsert') : '编辑成功');
            // this.$emit('change', post);
            this.updateDialog(true);
            this.model = false;
            this.loading = false;
          })
          .catch(error => {
            this.loading = false;
            this.$store.commit('MsgError', error.error);
          });
      }
    },
    // 收件人 選單資料異动時 改變狀態
    moveChipsToTrueGroup() {
      const search = [];
      const isSearch = [];
      _.forEach(this.inputPost.recipientChipsObject, obj => {
        if (this.inputSetting.recipientChipsModel.includes(obj.name)) {
          obj.group = 'isSearch';
          isSearch.push(obj);
        } else if (obj.group) {
          obj.group = 'Search';
          search.push(obj);
        }
      });
      this.classification(search, isSearch);
      // this.inputPost.recipientChipsObject = [{ header: 'Search' }, ...search, { divider: true }, { header: 'isSearch' }, ...isSearch];
    },
    // 建立搜尋列表並分類
    classification(search, isSearch) {
      this.inputPost.recipientChipsObject = [];
      this.inputPost.recipientChipsObject.push({ header: 'Search' });
      if (search.length > 0) {
        this.inputPost.recipientChipsObject.push(...search);
      }
      if (isSearch.length > 0) {
        this.inputPost.recipientChipsObject.push({ divider: true }, { header: 'isSearch' });
        this.inputPost.recipientChipsObject.push(...isSearch);
      }
    },
    // 移除收件人
    removeChip(item) {
      const index = this.inputSetting.recipientChipsModel.indexOf(item.name);
      if (index >= 0 && !item.model) {
        this.inputSetting.recipientChipsModel.splice(index, 1);
      }
    },
    // 收件人 搜尋 3個字以上才開始查找 tempAutoSearch 避免重複查找
    autoWordToApi(keyIn) {
      if (keyIn && keyIn.length > 2 && keyIn !== this.tempAutoSearch) {
        this.tempAutoSearch = keyIn;
        this.getUser(keyIn);
      }
    },
    onFileChanged(val) {
      this.loading = true;
      const post = new FormData();
      post.append('file', val.target.files[0]);
      api
        .postFile(POST_GLOBAL_UPLOAD_CSV, post)
        .then(data => {
          const nowIsSearch = _.filter(this.inputPost.recipientChipsObject, item => item.group === 'isSearch');
          const isSearch = [];
          _.forEach(data.result, user => {
            if (!_.find(nowIsSearch, old => old.id === user.id)) {
              user.group = 'isSearch';
              user.name = `${user.name}(${user.id})`;
              isSearch.push(user);
              this.inputSetting.recipientChipsModel.push(user.name);
            }
          });
          nowIsSearch.push(...isSearch);
          this.classification([], nowIsSearch);
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          // console.log(error.error);
          // this.$store.commit('MsgError', error.result);
          this.$store.commit('MsgError', '名单汇入失败，请确认格式是否有误');
        });
    },
    async getUser(username) {
      this.isUpdating = true;
      await api
        .get(GET_GLOBAL_USER_SEARCH, { username })
        .then(data => {
          // 新的搜尋選項
          const search = Array.from(data.result, item => {
            return { name: `${item.name}(${item.id})`, id: item.id, group: 'search' };
          });
          // 已選取的人
          const isSearch = [];
          _.forEach(this.inputSetting.recipientChipsModel, name => {
            const ok = _.find(this.inputPost.recipientChipsObject, item => item.name === name);
            if (ok) {
              isSearch.push(ok);
            }
          });
          this.classification(search, isSearch);
          this.isUpdating = false;
        })
        .catch(error => {
          this.isUpdating = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    checkDBIsDate(date) {
      return !!date && date !== '0001-01-01T00:00:00Z' && _.isDate(new Date(date));
    },
    downloadTemplate() {
      // window.open(`/import-template.csv`);
    },
  },
};
</script>
