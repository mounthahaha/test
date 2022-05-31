<template>
  <div class="Announcement">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> payment </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 新增 按鈕 -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="addNew">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_add') }}</span>
      </v-tooltip>
    </v-toolbar>

    <v-container fluid class="pa-5">
      <!-- 列表 -->
      <v-card elevation="2" class="pa-5 rounded-lg">
        <v-data-table
          :headers="headerArr"
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
          :items="listData"
          :loading="loading"
          class="elevation-0"
          hide-default-footer
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template #item="{ item, index }">
            <tr>
              <td class="text-center text-no-wrap">
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary" v-bind="attrs" @click="edit(index)" v-on="on">
                      <v-icon>edit</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('g_btn_edit') }}</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon color="primary" v-bind="attrs" @click="deleteItem(index)" v-on="on">
                      <v-icon>delete</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('g_btn_delete') }}</span>
                </v-tooltip>
              </td>
              <td class="text-center text-no-wrap">{{ item.order || 0 }}</td>
              <td class="text-center text-no-wrap">{{ countryList[item.locale || 'cn'].name }}</td>
              <td class="text-center text-no-wrap">{{ item.cn }}</td>
              <td class="text-center text-no-wrap">{{ item.en }}</td>
            </tr>
          </template>
        </v-data-table>
        <v-divider></v-divider>
        <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <span class="ml-5">{{ pageCounter }} / {{ pagination.totalItems }} {{ $t('g_record_text') }}</span>
          <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select
              v-model="pagination.itemsPerPage"
              class="diy-page-select"
              :items="selectItems"
            ></v-select>
          </div>
        </div>
      </v-card>
    </v-container>

    <!-- 编辑银行信息彈窗 -->
    <v-dialog v-model="editBox" persistent width="800px">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card class="rounded-lg">
          <v-toolbar dark elevation="0" color="primary">
            <v-toolbar-title class="headline ml-2"> {{ $t(`sidebar_${$route.name}`) }} </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click.native="editBox = false"> <v-icon>close</v-icon> </v-btn>
              </template>
            </v-menu>
          </v-toolbar>

          <v-container grid-list-md class="py-5 px-10">
            <v-row wrap align="baseline">
              <v-col cols="2" class="d-flex align-center justify-start">
                <v-icon small color="red" class="mr-1">golf_course</v-icon>
                <v-label> {{ $t('g_table_column_locale') }} </v-label>
              </v-col>

              <v-col cols="10">
                <v-select v-model="bank.locale" solo :items="locales"> </v-select>
              </v-col>
              <v-col cols="2" class="d-flex align-center justify-start">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label> {{ $t('player_bank_bank') }} </v-label>
              </v-col>
              <v-col cols="10">
                <v-text-field
                  v-model="bank.cn"
                  type="text"
                  :label="$t('payment_rules_text_name')"
                  :placeholder="$t('payment_rules_text_name')"
                  :rules="[v => !!v || $t('payment_rules_text_name')]"
                >
                </v-text-field>
              </v-col>
              <v-col cols="2" class="d-flex align-center justify-start">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label> {{ $t('player_bank_bankEN') }} </v-label>
              </v-col>
              <v-col cols="10">
                <v-text-field
                  v-model="bank.en"
                  type="text"
                  :label="$t('payment_rules_text_name')"
                  :placeholder="$t('payment_rules_text_name')"
                  :rules="[v => !!v || $t('payment_rules_text_name')]"
                >
                </v-text-field>
              </v-col>
              <v-col cols="2" class="d-flex align-center justify-start">
                <v-icon small color="red" class="mr-1">star</v-icon>
                <v-label> {{ $t('g_table_column_sort') }} </v-label>
              </v-col>
              <v-col cols="10">
                <v-text-field v-model.number="bank.order" type="text" :label="$t('')" :placeholder="$t('')"> </v-text-field>
              </v-col>
            </v-row>
          </v-container>

          <v-divider></v-divider>
          <v-card-actions class="pa-5">
            <v-spacer></v-spacer>
            <v-btn color="primary" depressed :disabled="!valid" @click="save()"> {{ $t('g_btn_confirm') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script>
import { postConfigByCode, getConfigByCode, decodeConfigAPIValue, encodeConfigAPIValue } from '@/lib/configAPI';
import _ from 'lodash';
export default {
  name: 'Bank',
  components: {},
  data() {
    return {
      valid: false,
      editBox: false,
      loading: false,
      selectItems: [10, 25, 50, 100],
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 25,
      },
      headers: [
        {
          lang: 'g_table_column_action',
          text: '操作',
          value: 'action',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'g_table_column_sort',
          text: '排序權重',
          value: 'order',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'g_table_column_locale',
          text: '地區',
          value: 'cn',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'player_bank_bank',
          text: '銀行名',
          value: 'cn',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'player_bank_bankEN',
          text: '銀行英文名',
          value: 'en',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
      ],
      configRaw: '',
      bank: {},
    };
  },
  computed: {
    headerArr() {
      return this.headers.map(item => {
        item.text = item.lang ? this.$t(item.lang) : item.text;
        return item;
      });
    },
    pageCounter() {
      return this.pagination.page * this.pagination.itemsPerPage < this.pagination.totalItems
        ? this.pagination.page * this.pagination.itemsPerPage
        : this.pagination.totalItems;
    },
    listData: {
      get() {
        const result = this.configRaw.Val ? decodeConfigAPIValue(this.configRaw.Val) : [];
        result.map(item => {
          return item;
        });
        return result;
      },
    },
    paginationLength() {
      return Math.ceil(this.listData.length / this.pagination.itemsPerPage);
    },
    countryList() {
      return this.$t('globalCountryList');
    },
    locales() {
      return _.filter(this.countryList, (item, index) => {
        return ['cn', 'hk', 'mo', 'my', 'sg'].includes(index);
      }).map(item => {
        return { text: item.name, value: item.alpha2 };
      });
    },
  },
  watch: {
    listData(list) {
      this.pagination.totalItems = list.length;
      this.pagination.length = this.paginationLength;
    },
    'pagination.itemsPerPage'(itemsPerPage) {
      this.pagination.length = this.paginationLength;
    },
  },
  mounted() {
    getConfigByCode({ code: 'bank_list' }).then(data => {
      this.configRaw = data.result;
      this.$forceUpdate();
    });
  },
  methods: {
    edit(index) {
      this.bank = _.cloneDeep(
        this.listData.find((item, i) => {
          return i == index;
        }),
      );
      this.bank.index = index;
      this.bank.locale = this.bank.locale ? this.bank.locale : 'cn';
      this.bank.order = this.bank.order || 0;
      this.editBox = true;
    },
    addNew() {
      this.bank = { order: 0 };
      this.editBox = true;
    },
    save() {
      if (this.bank.index) {
        const { cn, en, order } = this.bank;
        this.listData.splice(this.bank.index, 1, {
          cn,
          en,
          order,
        });
      } else {
        this.listData.splice(0, 0, this.bank);
      }
      this.configRaw.Val = encodeConfigAPIValue(this.listData);
      postConfigByCode({
        code: this.configRaw.Code,
        used: this.configRaw.Used,
        val: this.configRaw.Val,
        remark: '银行列表',
      }).then(data => {
        this.loading = false;
        this.editBox = false;
      });
    },
    deleteItem(index) {
      this.$store.commit('Confirm', {
        text: this.$t('g_dialog_confirm_deleteInfo'),
        ok: () => {
          this.loading = true;
          this.listData.splice(index, 1);
          this.configRaw.Val = encodeConfigAPIValue(this.listData);
          postConfigByCode({
            code: this.configRaw.Code,
            used: this.configRaw.Used,
            val: this.configRaw.Val,
            remark: '银行列表',
          }).then(data => {
            this.loading = false;
          });
        },
      });
    },
  },
};
</script>
