<template>
  <div>
    <v-toolbar color="elevation-0" class="pl-2">
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 新增USDT渠道 Button -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="teal lighten-1" class="elevation-0 ml-4 mr-2" fab dark small medium depressed v-on="on" @click="add">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('g_btn_add') }}</span>
      </v-tooltip>
    </v-toolbar>

    <v-container fluid class="pa-5">
      <!-- 表格 -->
      <v-card elevation="0" class="pa-2 rounded-lg">
        <v-card-text>
          <v-data-table
            :no-data-text="$t('g_text_noData')"
            :headers="headerArr"
            :items="listData"
            :loading="loading"
            class="elevation-0"
            :page.sync="pagination.page"
            :items-per-page.sync="pagination.itemsPerPage"
            hide-default-footer
          >
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template #item="{ item, index }">
              <tr>
                <template v-for="(col, i) in headerArr">
                  <td v-if="/actions/.test(col.value)" :key="i" class="text-left text-no-wrap">
                    <v-tooltip bottom>
                      <template #activator="{ on, attrs }">
                        <v-btn v-bind="attrs" text color="primary" small class="x-small ma-0" v-on="on" @click="edit(index)">
                          <v-icon>edit</v-icon>
                        </v-btn>
                      </template>
                      <span> {{ $t('g_btn_edit') }} </span>
                    </v-tooltip>
                    <v-tooltip bottom>
                      <template #activator="{ on, attrs }">
                        <v-btn v-bind="attrs" text color="primary" small class="x-small ma-0" v-on="on" @click="deleteItem(index)">
                          <v-icon>delete</v-icon>
                        </v-btn>
                      </template>
                      <span> {{ $t('g_btn_delete') }} </span>
                    </v-tooltip>
                  </td>
                  <td v-else-if="/^(index)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                    {{ index + 1 }}
                  </td>
                  <td v-else-if="/^(order)$/.test(col.value)" :key="i" class="text-left text-no-wrap">
                    {{ item.order }}
                  </td>
                  <td v-else :key="i" class="text-left text-no-wrap">{{ item[col.value] || '--' }}</td>
                </template>
              </tr>
            </template>
          </v-data-table>
          <v-divider></v-divider>
          <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
            <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          </div>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- 新增或編輯代理關聯彈窗-->
    <v-dialog v-model="editBox" persistent width="500px">
      <v-card>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-toolbar dark color="primary" elevation="0">
            <v-toolbar-title class="ml-2">{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon @click.native="editBox = false" v-on="on">
                  <v-icon>close</v-icon>
                </v-btn>
              </template>
            </v-menu>
          </v-toolbar>

          <v-card-text>
            <v-container grid-list-md pa-2>
              <template v-for="(field, i) in headerArr.filter(f => ['key', 'url', 'labelEN', 'labelZH', 'order', 'fallback'].includes(f.value))">
                <v-row :key="i">
                  <v-col cols="4" class="text-right">
                    {{ field.text }}
                  </v-col>
                  <v-col cols="8">
                    <v-text-field
                      v-model="editItem[field.value]"
                      dense
                      outlined
                      :rules="field.rules || []"
                      :type="field.type || 'text'"
                      :placeholder="textfilter(field.placeholder || 'g_text_field_placeholder_content', field.placeholder)"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </template>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="pa-5">
            <v-spacer></v-spacer>
            <v-btn color="primary" :disabled="!valid" class="x-small" depressed @click="save()"> {{ $t('g_btn_confirm') }}</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import { mapGetters } from 'vuex';
import { formatDate } from '@/filters/custom';
import { postConfigByCode, getConfigByCode, decodeConfigAPIValue, encodeConfigAPIValue } from '@/lib/configAPI';
export default {
  name: 'UsdtHelper',
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
          text: '#',
          value: 'index',
          static: true,
          sortable: false,
        },
        {
          text: '操作',
          value: 'actions',
        },
        {
          text: '旧版编号',
          value: 'fallback',
        },
        {
          text: '渠道名称',
          value: 'key',
        },
        {
          text: '中文显示',
          value: 'labelZH',
        },
        {
          text: '英文显示',
          value: 'labelEN',
        },
        {
          text: 'USDT 上分說明',
          value: 'url',
          placeholder: 'https://',
        },
        {
          text: '排序',
          value: 'order',
          type: 'number',
        },
        {
          text: '創建時間',
          value: 'created',
        },
        {
          text: '创建人',
          value: 'createdBy',
        },
        {
          text: '最后更新時間',
          value: 'updated',
        },
        {
          text: '最后更新人',
          value: 'updatedBy',
        },
      ],
      headerDefault: {
        sortable: false,
        class: 'text-no-wrap blue-grey lighten-5',
        align: 'center',
        show: true,
      },
      configRaw: '',
      editItem: {},
      langMap: {},
    };
  },
  computed: {
    ...mapGetters({ locale: 'i18n/locale', user: 'user' }),
    headerArr() {
      return this.headers.map(item => {
        const hDefault = _.cloneDeep(this.headerDefault);
        _.each(hDefault, (prop, key) => {
          item[key] = item[key] !== undefined ? item[key] : this.headerDefault[key];
        });
        item.text = item.lang ? this.$t(item.lang) : item.text;
        return item;
      });
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
    code() {
      return this.configRaw.Code || 'usdthelper_list_settings';
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
    locale() {
      this.setLangKeys();
    },
  },
  created() {
    this.setLangKeys();
    getConfigByCode({ code: this.code }).then(data => {
      this.configRaw = data.result;
      this.$forceUpdate();
    });
  },
  methods: {
    edit(index) {
      this.editItem = _.cloneDeep(
        this.listData.find((item, i) => {
          return i == index;
        }),
      );
      this.editItem.index = index;
      this.editItem.order = this.editItem.order || 0;
      this.editBox = true;
    },
    add() {
      this.editItem = { order: 0 };
      this.editBox = true;
    },
    save() {
      this.editItem.updatedBy = `${this.user.id}:${this.user.name}`;
      this.editItem.updated = formatDate(new Date());
      this.editItem.order = Number(this.editItem.order);
      if (this.editItem.created) {
        const item = _.cloneDeep(this.editItem);
        this.listData.splice(this.editItem.index, 1, this.editItem);
      } else {
        this.editItem.createdBy = `${this.user.id}:${this.user.name}`;
        this.editItem.created = formatDate(new Date());
        this.listData.splice(0, 0, this.editItem);
      }
      this.configRaw.Val = encodeConfigAPIValue(this.listData);
      postConfigByCode({
        code: this.code,
        used: 2,
        val: this.configRaw.Val,
        remark: 'USDT 说明',
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
            code: this.code,
            used: 2,
            val: this.configRaw.Val,
            remark: '银行列表',
          }).then(data => {
            this.loading = false;
          });
        },
      });
    },
    async setLangKeys() {
      const map = await import(`@/i18n/lang/${this.locale}.js`);
      this.langMap = map.default;
      this.$forceUpdate();
    },
    textfilter(key, alt) {
      return this.langMap[key] ? this.$t(key) : alt;
    },
  },
};
</script>
