<template>
  <div>
    <v-layout row wrap align-center>
      <v-flex v-if="tab == 0" xs2>
        <v-text-field v-model="searchOption.ip" hide-details solo clearable label="IP" :placeholder="$t('system_blacklist_enterIp')"></v-text-field>
      </v-flex>
      <v-flex v-if="tab == 1" xs2>
        <v-select v-model="searchOption.region" solo hide-details :items="provinces" item-value="text" label="限制地区">
          <template #item="{ item }">{{ `${item.text}` }}</template>
        </v-select>
      </v-flex>
      <v-flex v-if="tab == 1" xs2>
        <v-select v-model="searchOption.city" solo hide-details item-text="CityName" item-value="CityName" :items="cities" label="限制地区">
          <template #item="{ item }">{{ `${item.CityName}` }}</template>
        </v-select>
      </v-flex>

      <v-flex xs2>
        <v-select
          v-model="searchOption.platform"
          :items="[
            { text: $t('system_blacklist_options_all'), value: 0 },
            { text: $t('system_blacklist_options_FE'), value: 2 },
            { text: $t('system_blacklist_options_BE'), value: 1 },
            { text: $t('system_blacklist_options_FEAndBE'), value: 3 },
          ]"
          hide-details
          solo
          clearable
          :label="$t('system_blacklist_limitEndPoint')"
          :placeholder="$t('system_blacklist_limitEndPoint')"
        ></v-select>
      </v-flex>
      <v-flex xs4>
        <v-btn :loading="loading" class="ma-1" color="primary" @click="loadData(1)">{{ $t('g_btn_search2') }}</v-btn>
        <v-btn class="ma-1" color="error" @click="resetOptions()">{{ $t('g_btn_reset') }}</v-btn>
      </v-flex>
    </v-layout>
    <v-card>
      <v-toolbar elevation="1" class="pl-2">
        <v-icon class="mr-2"> settings </v-icon>
        <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      </v-toolbar>
      <v-tabs v-model="tab">
        <v-tab>{{ $t('system_blacklist_tab_ip') }}</v-tab>
        <v-tab>{{ $t('system_blacklist_tab_area') }}</v-tab>
      </v-tabs>
      <v-card-text class="px-0 py-2">
        <v-btn :disabled="loading" class="ml-0" color="primary" @click="addBlacklist">{{ $t('system_blacklist_addBlackList') }}</v-btn>
        <v-btn v-if="tab == 0" :disabled="loading" class="ml-2" @click="_export"> <v-icon>vertical_align_bottom</v-icon>{{ $t('g_export') }}</v-btn>
        <v-btn :disabled="loading" class="ml-2" @click="massDelete"> <v-icon>close</v-icon>{{ $t('system_blacklist_batchDelete') }}</v-btn>
      </v-card-text>
      <v-card-text class="pa-0">
        <v-data-table
          v-model="selected"
          :headers="headerComputed"
          :items="blacklist"
          :loading="loading"
          class="elevation-1"
          :page.sync="pagination.page"
          :items-per-page.sync="pagination.itemsPerPage"
          hide-default-footer
          show-select
        >
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data">
            {{ $t('g_text_noData') }}
          </template>
          <template #item="{ item, isSelected, select }">
            <tr>
              <td><v-checkbox :value="isSelected" @change="select"></v-checkbox></td>
              <td class="text-center">
                {{ item.id }}
              </td>
              <td v-if="tab == 0" class="text-center">
                {{ item.ip }}
              </td>
              <td v-if="tab == 1" class="text-center">{{ item.region }}, {{ item.city }}</td>
              <td class="text-center">
                {{
                  item.wsystem != 0 && item.bcadmin != 0
                    ? $t('system_blacklist_options_FEAndBE')
                    : item.wsystem != 0
                    ? $t('system_blacklist_options_FE')
                    : item.bcadmin != 0
                    ? $t('system_blacklist_options_BE')
                    : `--`
                }}
              </td>
              <td class="text-center">
                {{ item.comment }}
              </td>
              <td class="text-center">
                <v-btn v-if="tab == 0" class="primary" @click="updateItem(item)">{{ $t('g_btn_modify') }}</v-btn>
                <v-btn class="ml-2 error" @click="deleteItem(item)">{{ $t('g_btn_delete') }}</v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
        <div class="text-center py-2 diy-page-wrap">
          <v-pagination v-model="pagination.page" :length="pagination.length" :total-visible="15" :disabled="loading"></v-pagination>
          <div class="diy-page">
            {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <v-dialog v-model="infoBox" persistent width="650px">
      <v-card>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-toolbar dark color="primary">
            <v-toolbar-title class="headline">
              {{ current.id ? $t('system_blacklist_editBlackList') : $t('system_blacklist_addBlackList') }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon @click.native="resetInfoBox()" v-on="on">
                  <v-icon>close</v-icon>
                </v-btn>
              </template>
            </v-menu>
          </v-toolbar>
          <v-card-text>
            <v-tabs v-model="infoTab">
              <v-tab href="#tab-1">{{ current.id ? $t('system_blacklist_editBlackList') : $t('system_blacklist_addBlackList') }}</v-tab>
              <v-tab v-if="tab == 0" href="#tab-2">{{ $t('system_blacklist_addBlackListBatches') }}</v-tab>
              <v-tab-item value="tab-1">
                <v-container grid-list-md pa-2>
                  <v-layout wrap align-center>
                    <v-flex xs4>
                      {{ $t('system_blacklist_limitEndPoint') }}
                    </v-flex>
                    <v-flex xs8 d-flex>
                      <v-flex xs4>
                        <v-checkbox v-model="current.wsystem" :label="$t('system_blacklist_options_FE')" color="primary" hide-details></v-checkbox>
                      </v-flex>
                      <v-flex xs4>
                        <v-checkbox v-model="current.bcadmin" :label="$t('system_blacklist_options_BE')" color="primary" hide-details></v-checkbox>
                      </v-flex>
                    </v-flex>
                    <v-flex v-if="tab == 0" xs12>
                      <v-text-field v-if="current.id" :value="current.ip" type="text" :label="$t('system_blacklist_ruleIp')" readonly disabled />
                      <v-text-field
                        v-else
                        v-model="current.ip"
                        type="text"
                        :label="$t('system_blacklist_ruleIp')"
                        hint=""
                        :rules="[
                          v =>
                            !!/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v) || '格式不符合',
                        ]"
                      />
                    </v-flex>
                    <v-flex v-else xs12>
                      <v-select
                        v-model="current.region"
                        item-text="CityName"
                        :items="regions"
                        label="限制地区"
                        :readonly="Boolean(current.id)"
                        :disabled="Boolean(current.id)"
                        return-object
                        :hint="current.region ? `${current.region.ProvinceName}, ${current.region.CityName}` : ''"
                      >
                        <template #selection>{{ `${current.region.ProvinceName}, ${current.region.CityName}` }}</template>
                        <template #item="{ item }">{{ `${item.ProvinceName}, ${item.CityName}` }}</template>
                      </v-select>
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field v-model="current.comment" type="text" :label="$t('g_table_column_remarks')"> </v-text-field>
                    </v-flex>
                  </v-layout>
                </v-container>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" depressed :disabled="!valid" @click="mergeBlacklist()">{{ $t('g_btn_confirm') }}</v-btn>
                </v-card-actions>
              </v-tab-item>
              <v-tab-item value="tab-2">
                <v-btn color="primary ma-1" :loading="loading" @click="$refs.uploader.click()">{{ $t('g_import_csv') }}</v-btn>
                <a class="v-btn v-btn--contained theme--light v-size--default primary ma-1" :loading="loading" download href="/blacklist.csv">
                  {{ $t('system_blacklist_downloadTemp') }}
                </a>
                <input ref="uploader" class="d-none" type="file" accept=".csv" @change="onFileChanged" />
                <v-data-table
                  :items-per-page.sync="importPreview.length"
                  :headers="headers.slice(1, 4)"
                  :items="importPreview"
                  :loading="loading"
                  class="elevation-1"
                  hide-default-footer
                >
                  <template slot="no-data">
                    {{ $t('system_blacklist_clickBtn') }}
                  </template>
                  <template #item="{ item }">
                    <tr>
                      <td class="text-center">
                        {{ item.ip }}
                      </td>
                      <td class="text-center">
                        {{
                          item.wsystem != 0 && item.bcadmin != 0
                            ? $t('system_blacklist_options_FEAndBE')
                            : item.wsystem != 0
                            ? $t('system_blacklist_options_FE')
                            : item.bcadmin != 0
                            ? $t('system_blacklist_options_BE')
                            : `--`
                        }}
                      </td>
                      <td class="text-center">
                        {{ item.comment }}
                      </td>
                    </tr>
                  </template>
                </v-data-table>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="error" @click="resetInfoBox()">{{ $t('g_btn_cancel') }}</v-btn>
                  <v-btn color="primary" depressed :disabled="!importPreview.length" :loading="loading" @click="_import()">{{
                    $t('g_btn_send')
                  }}</v-btn>
                </v-card-actions>
              </v-tab-item>
            </v-tabs>
          </v-card-text>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import { shortcuts, exportXLSX } from '@/utils';
import { formatDate } from '../../filters/custom';
import Papa from 'papaparse';

export default {
  name: 'Blacklist',
  components: {},
  data() {
    return {
      tab: 0,
      valid: true,
      current: {},
      infoBox: false,
      infoTab: 0,
      selectItem: 10,
      selectItems: [10, 25, 50, 100],
      selected: [],
      note: {
        show: false,
        x: 0,
        y: 0,
      },
      loading: false,
      pagination: {
        totalItems: 0,
        page: 1,
        length: 0,
        itemsPerPage: 10,
        sortBy: ['ip'],
        sortDesc: [true],
      },
      headers: [
        {
          lang: 'g_table_column_id',
          text: 'ID',
          value: 'id',
          align: 'center',
          sortable: false,
        },
        {
          lang: 'system_blacklist_ip',
          text: 'IP',
          value: 'ip',
          align: 'center',
          sortable: false,
        },
        {
          lang: 'system_blacklist_limitEndPoint',
          text: '限制端点',
          align: 'center',
          sortable: false,
        },
        {
          lang: 'g_table_column_remarks',
          text: '备注',
          value: 'comment',
          align: 'center',
          sortable: false,
        },
        {
          lang: 'g_table_column_action',
          text: '操作',
          sortable: false,
          value: '',
          align: 'center',
        },
      ],
      desserts: [],
      importPreview: [],
      searchOption: {},
      finalCount: 0,
      regions: [],
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    blacklist() {
      return this.desserts;
    },
    headerComputed() {
      return this.headers.map(item => {
        if (/ip/gi.test(item.value)) {
          if (this.tab == 1) {
            item.lang = 'system_blacklist_area';
          } else {
            item.lang = 'system_blacklist_ip';
          }
        }
        item.text = this.$t(item.lang);
        return item;
      });
    },
    provinces() {
      const allProvince = {};
      const uniqProvince = [];
      _.each(this.regions, region => {
        allProvince[region.ProvinceName] = region.ProvinceCode;
      });
      _.each(allProvince, (region, label) => {
        uniqProvince.push({
          value: region,
          text: label,
        });
      });
      return uniqProvince;
    },
    cities() {
      return _.filter(this.regions, region => (this.searchOption.region ? region.ProvinceName == this.searchOption.region : true));
    },
  },
  watch: {
    'pagination.page'(n) {
      this.loadData(n);
    },
    selectItem(newVal) {
      this.pagination.itemsPerPage = newVal;
      this.loadData(1);
    },
    tab() {
      this.loadData(1);
    },
  },
  created() {
    this.loadData(1);
    this.loadRegions();
  },
  methods: {
    loadData(p) {
      if (this.loading) {
        return;
      }
      const $this = this;
      $this.loading = true;
      $this.searchOption.page = p;
      $this.searchOption.num = $this.pagination.itemsPerPage;
      $this.searchOption.sort = $this.pagination.sortBy[0];
      $this.searchOption.asc = !$this.pagination.sortDesc[0];
      let url = `/system/black/ip/list`;
      if ($this.tab == 0) {
        if ($this.searchOption.ip || $this.searchOption.platform) {
          $this.searchOption.ip = $this.searchOption.ip ? $this.searchOption.ip.replace(/^\s*(\S*)\s*$/, '$1') : '';
          url = `/system/black/ip/search`;
        }
      } else {
        $this.pagination.sortBy[0] = 'region';
        $this.searchOption.sort = $this.pagination.sortBy[0];
        url = `/system/black/area/list`;
        if ($this.searchOption.region || $this.searchOption.platform) {
          url = `/system/black/area/search`;
        }
      }
      api
        .get(url, $this.searchOption)
        .then(data => {
          $this.desserts = data.list == null ? [] : data.list;
          if ($this.searchOption.ip || $this.searchOption.platform || $this.searchOption.region) {
            _.each($this.desserts, (item, i) => {
              _.each(item, (value, field) => {
                item[field.toLowerCase()] = value;
              });
            });
          }
          $this.pagination.length = Math.ceil(data.count / this.pagination.itemsPerPage);
          $this.pagination.totalItems = data.count;
          $this.loading = false;
        })
        .catch(error => {
          console.log(error);
          $this.$store.commit('MsgError', error.error);
          $this.loading = false;
        });
    },
    loadRegions() {
      api
        .get('/system/areamap')
        .then(data => {
          // console.log(data);
          this.regions = data.result;
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    resetOptions() {
      _.each(this.searchOption, (item, i) => {
        if (i.toLocaleLowerCase().indexOf('date') >= 0) {
          this.searchOption[i] = [];
        } else {
          this.searchOption[i] = null;
        }
      });
    },
    deleteItem(item) {
      const $this = this;
      // console.log(item);
      const doSave = () => {
        let url = `/system/black/ip`;
        let params = {
          id: item.id * 1,
        };
        if ($this.tab == 1) {
          url = `/system/black/area/${item.id}`;
          params = undefined;
        }
        api
          .delete(url, params)
          .then(data => {
            $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
            $this.note.show = false;
            $this.loadData();
          })
          .catch(error => {
            $this.$store.commit('MsgError', error.error);
            $this.note.show = false;
          });
      };
      const text = this.$t('g_dialog_confirm_delete');
      $this.$store.commit('Confirm', {
        text,
        ok() {
          doSave();
        },
      });
    },
    addBlacklist() {
      this.current = {
        bcadmin: true,
        wsystem: true,
      };
      this.infoBox = true;
    },
    updateItem(item) {
      this.current = _.cloneDeep(item);
      this.current.wsystem = this.current.wsystem == 1;
      this.current.bcadmin = this.current.bcadmin == 1;
      this.infoBox = true;
      this.infoTab = 0;
      if (this.current.city_code != null) {
        this.current.region = {};
        this.current.region.ProvinceName = this.current.region;
        this.current.region.CityName = this.current.city;
        this.current.region.CityCode = this.current.city_code;
      }
    },
    mergeBlacklist() {
      if (this.$refs.form.validate()) {
        const $this = this;
        let url = '/system/black/ip';
        if (this.tab == 1) {
          url = '/system/black/area';
        }
        let current = $this.current;
        current.wsystem = current.wsystem * 1;
        current.bcadmin = current.bcadmin * 1;
        if (current.id > 0) {
          if (this.tab == 0) {
            current = {
              id: current.id * 1,
              wsystem: current.wsystem,
              bcadmin: current.bcadmin,
              // ip: current.ip,
              comment: current.comment,
            };
          } else {
            current = {
              id: current.id * 1,
              wsystem: current.wsystem,
              bcadmin: current.bcadmin,
              // region: current.region.CityCode,
              comment: current.comment,
            };
          }
          api
            .put(url, current)
            .then(res => {
              this.$store.commit('MsgOk', this.$t('g_msgSaved'));
              this.infoBox = false;
              this.loadData(1);
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
            });
        } else {
          if (this.tab == 1) {
            current = {
              wsystem: current.wsystem,
              bcadmin: current.bcadmin,
              ProvinceCode: current.region.ProvinceCode * 1,
              CityCode: current.region.CityCode * 1,
              comment: current.comment,
            };
          }
          api
            .post(url, current)
            .then(res => {
              this.$store.commit('MsgOk', this.$t('g_msgInsert'));
              this.infoBox = false;
              this.loadData(1);
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error.replace(/(.*)(重复|已重複)/, '添加的$1已存在于黑名单中'));
            });
        }
      }
    },
    onFileChanged(file) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      Papa.parse(file.target.files[0], {
        header: true,
        complete: meta => {
          // console.log(meta);
          this.importPreview = [];
          meta.data.forEach((item, i) => {
            let counter = 0;
            _.forEach(item, (field, index) => {
              switch (counter) {
                case 0:
                  item.id = field;
                  break;
                case 1:
                  item.ip = field;
                  break;
                case 2:
                  switch (field) {
                    case '前台、后台':
                      item.bcadmin = 1;
                      item.wsystem = 1;
                      item.platform = '前台,后台';
                      break;
                    case '前台':
                      item.wsystem = 1;
                      item.bcadmin = 0;
                      item.platform = '前台';
                      break;
                    case '后台':
                      item.wsystem = 0;
                      item.bcadmin = 1;
                      item.platform = '后台';
                      break;
                    default:
                      item.wsystem = 1;
                      item.bcadmin = 1;
                      item.platform = '前台,后台';
                      break;
                  }
                  break;
                case 3:
                  item.comment = field;
                  break;
                default:
                  break;
              }
              counter++;
            });
            // item.ip = item.IP;
            // item.id = item.ID * 1;
            // item.comment = item['备注'];
            this.importPreview.push(item);
          });
          this.loading = false;
        },
      });
    },
    _export(evt) {
      if (this.loading) {
        return;
      }
      const $this = this;
      $this.loading = true;
      $this.searchOption.page = 1;
      $this.searchOption.num = $this.pagination.totalItems;
      $this.searchOption.sort = $this.pagination.sortBy[0];
      $this.searchOption.asc = !$this.pagination.sortDesc[0];
      let url = `/system/black/ip/list`;
      if ($this.searchOption.ip || $this.searchOption.platform) {
        url = `/system/black/ip/search`;
      }
      api
        .get(url, $this.searchOption)
        .then(data => {
          if (data == null || data.list == null || data.list == []) {
            $this.$store.commit('MsgError', this.$t('g_export_nodata'));
          } else {
            const blacklists = [];
            const cols = [];
            if ($this.searchOption.ip || $this.searchOption.platform) {
              _.each(data.list, (item, i) => {
                _.each(item, (value, field) => {
                  item[field.toLowerCase()] = value;
                });
              });
            }
            $this.headers.forEach(v => {
              if (v.value != '') {
                cols.push(v.text);
              }
            });
            blacklists.push(cols);
            data.list.forEach(item => {
              const tmp = [];
              tmp.push(item.id);
              tmp.push(item.ip);
              if (item.wsystem != 0 && item.bcadmin != 0) {
                tmp.push(`前台、后台`);
              } else if (item.wsystem != 0) {
                tmp.push(`前台`);
              } else if (item.bcadmin != 0) {
                tmp.push(`后台`);
              } else {
                tmp.push(`--`);
              }
              tmp.push(item.comment);
              blacklists.push(tmp);
            });

            exportXLSX(blacklists, '访问黑名单');
            $this.loading = false;
          }
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
          $this.loading = false;
        });
    },
    _import(evt) {
      if (this.loading) {
        return;
      }
      const $this = this;
      $this.loading = true;
      const data = [];
      $this.importPreview.forEach((item, i) => {
        data.push({
          ip: item.ip,
          platform: item.platform,
          comment: item.comment,
        });
      });
      api
        .post('/system/black/ip/bulkadd', { data })
        .then(result => {
          $this.importPreview = [];
          $this.$refs.uploader.value = '';
          $this.infoBox = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        })
        .finally(() => {
          $this.loading = false;
          $this.loadData(1);
        });
    },
    massDelete() {
      if (this.loading) {
        return;
      }
      this.loading = true;
      const params = {};
      let url = '/system/black/ip/bulkdel';
      if (this.tab == 0) {
        params.ids = [];
        this.selected.forEach((item, i) => {
          params.ids.push(item.id * 1);
        });
      } else {
        url = '/system/black/area/bulkdel';
        params.ids = [];
        this.selected.forEach((item, i) => {
          params.ids.push(item.id);
        });
      }
      api
        .delete(url, params)
        .then(() => {
          if (/ip/.test(url)) {
            this.$store.commit('MsgOk', `${this.$t('system_blacklist_dialog_deleteSuccess')}(${params.ids.length})`);
          } else if (/area/.test(url)) {
            this.$store.commit('MsgOk', `${this.$t('system_blacklist_dialog_deleteSuccess')}(${params.ids.length})`);
          }
          this.selected = [];
        })
        .catch(error => {
          this.$store.commit('MsgError', this.$t('system_blacklist_dialog_deleteFail'));
        })
        .finally(() => {
          this.loading = false;
          this.loadData(1);
        });
    },
    resetInfoBox() {
      this.infoBox = false;
      this.importPreview = [];
      this.loading = false;
      !this.$refs.uploader || (this.$refs.uploader.value = '');
      this.loadData();
      // this.$refs.uploader.value = '';
    },
  },
};
</script>
<style lang="scss">
.diy-page-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
}

.diy-page {
  margin-left: 50px;
  display: flex;
  align-items: center;

  .diy-page-select {
    .v-input__slot {
      width: 90px !important;
    }
  }
}
</style>
