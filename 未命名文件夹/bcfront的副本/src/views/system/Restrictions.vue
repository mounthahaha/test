<template>
  <div class="Restrictions">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> settings </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
    </v-toolbar>

    <v-container fluid class="pa-5">
      <!-- IP限制地區列表 -->
      <v-card elevation="0" class="mb-5 pa-8 pt-1 rounded-lg" color="blue-grey lighten-4">
        <!-- 新增與搜尋 -->
        <v-card elevation="0" class="pa-0 my-7 mb-5" color="blue-grey lighten-4">
          <v-row dense class="align-center">
            <v-col>
              <v-select
                v-model="restrictionType[2].searchOptions.region"
                solo
                hide-details
                append-icon="map"
                :items="provinces"
                item-value="text"
                label="限制地区"
              >
                <template #item="{ item }">{{ `${item.text}` }}</template>
              </v-select>
            </v-col>
            <v-col>
              <v-select
                v-model="restrictionType[2].searchOptions.city"
                solo
                hide-details
                append-icon="map"
                item-text="CityName"
                item-value="CityName"
                :items="cities"
                label="限制地区"
              >
                <template #item="{ item }">{{ `${item.CityName}` }}</template>
              </v-select>
            </v-col>
            <v-col>
              <v-select
                v-model="restrictionType[2].searchOptions.platform"
                :items="platforms"
                hide-details
                solo
                clearable
                :label="$t('system_blacklist_limitEndPoint')"
                :placeholder="$t('system_blacklist_limitEndPoint')"
              ></v-select>
            </v-col>
            <!-- 搜尋 重置 批量刪除 新增地區限制 按鈕 -->
            <v-col class="d-flex align-center justify-end">
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="loadData(1, 2)">
                    <v-icon>search</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('g_btn_search') }}</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="resetOptions(2)">
                    <v-icon>find_replace</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('g_btn_reset') }}</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="massDelete(2)">
                    <v-icon>delete</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('system_blacklist_batchDelete') }}</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn v-bind="attrs" color="green" class="mx-2" depressed fab dark small v-on="on" @click="addRestrict(2)">
                    <v-icon>add</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('g_btn_add') }}{{ $t('system_blacklist_tab_area') }}</span>
              </v-tooltip>
            </v-col>
          </v-row>
        </v-card>
        <!-- 列表 -->
        <v-card elevation="2" class="pa-5 rounded-lg">
          <v-data-table
            v-model="restrictionType[2].selected"
            :headers="headerArr(2)"
            :items="restrictionType[2].data"
            :loading="restrictionType[2].loading"
            :page.sync="restrictionType[2].pagination.page"
            :items-per-page.sync="restrictionType[2].pagination.itemsPerPage"
            class="elevation-0"
            hide-default-footer
            show-select
          >
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template slot="no-data"> {{ $t('g_text_noData') }} </template>
            <template #item="{ item, isSelected, select }">
              <tr>
                <td><v-checkbox :value="isSelected" @change="select"></v-checkbox></td>
                <td class="text-left text-no-wrap">{{ item.id }}</td>
                <td class="text-left text-no-wrap">{{ item.region }}, {{ item.city }}</td>
                <td class="text-left text-no-wrap">
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
                <td class="text-left text-no-wrap">{{ item.comment }}</td>
                <td class="text-left text-no-wrap">{{ item.updated | formatDate }}</td>
                <td class="text-center">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="red" v-bind="attrs" v-on="on" @click="deleteItem(item, 2)">
                        <v-icon>do_not_disturb_on</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('g_btn_delete') }}</span>
                  </v-tooltip>
                </td>
              </tr>
            </template>
          </v-data-table>
          <v-divider></v-divider>
          <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
            <v-pagination
              v-model="restrictionType[2].pagination.page"
              :length="restrictionType[2].pagination.length"
              :total-visible="15"
              :disabled="restrictionType[2].loading"
            >
            </v-pagination>
            <div class="diy-page">
              {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select
                v-model="restrictionType[2].pagination.itemsPerPage"
                class="diy-page-select"
                :items="selectItems"
              >
              </v-select>
            </div>
          </div>
        </v-card>
      </v-card>

      <!-- IP 限制列表 -->
      <v-card elevation="0" class="mb-5 pa-8 pt-1 rounded-lg" color="blue-grey lighten-4">
        <!-- 新增與搜尋 -->
        <v-card elevation="0" class="pa-0 my-7 mb-5" color="blue-grey lighten-4">
          <v-row dense class="align-center">
            <v-col>
              <v-text-field
                v-model="restrictionType[tab].searchOptions.ip"
                hide-details
                solo
                clearable
                append-icon="place"
                label="限制 IP"
                :placeholder="$t('system_blacklist_enterIp')"
              ></v-text-field>
            </v-col>
            <v-col>
              <v-select
                v-model="restrictionType[tab].searchOptions.platform"
                :items="platforms"
                hide-details
                solo
                clearable
                :label="$t('system_blacklist_limitEndPoint')"
                :placeholder="$t('system_blacklist_limitEndPoint')"
              ></v-select>
            </v-col>
            <!-- 搜尋 重置 批量刪除 新增IP 批量新增IP 匯出按鈕 -->
            <v-col class="d-flex align-center justify-end">
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="loadData(1, tab)">
                    <v-icon>search</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('g_btn_search') }}</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="resetOptions(tab)">
                    <v-icon>find_replace</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('g_btn_reset') }}</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="massDelete(tab)">
                    <v-icon>delete</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('system_blacklist_batchDelete') }}</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn v-bind="attrs" color="primary" class="mx-2" depressed fab dark small v-on="on" @click="_export($event, tab)">
                    <v-icon>file_download</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('g_export') }}</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn v-bind="attrs" color="green" class="mx-2" depressed fab dark small v-on="on" @click="addRestrict(tab)">
                    <v-icon>person_add</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('system_blacklist_addBlackList') }}</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn v-bind="attrs" color="green" class="mx-2" depressed fab dark small v-on="on" @click="addMassRestrict(tab)">
                    <v-icon>group_add</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('system_blacklist_addBlackListBatches') }}</span>
              </v-tooltip>
            </v-col>
          </v-row>
        </v-card>
        <!-- 列表 -->
        <v-tabs v-model="tab" class="mt-5" background-color="blue-grey lighten-4">
          <v-tab>
            <h3>{{ $t('system_blacklist_IP_whitelist') }}</h3>
          </v-tab>
          <v-tab>
            <h3>{{ $t('system_blacklist_IP_blacklist') }}</h3>
          </v-tab>
        </v-tabs>
        <v-card elevation="2" class="pa-5 rounded-lg">
          <v-data-table
            v-model="restrictionType[tab].selected"
            :headers="headerArr(tab)"
            :items="restrictionType[tab].data"
            :loading="restrictionType[tab].loading"
            :page.sync="restrictionType[tab].pagination.page"
            :items-per-page.sync="restrictionType[tab].pagination.itemsPerPage"
            class="elevation-0"
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
                <td class="text-left text-no-wrap">{{ item.id }}</td>
                <td class="text-left text-no-wrap">{{ item.ip }}</td>
                <td class="text-left text-no-wrap">
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
                <td class="text-left text-no-wrap">{{ item.comment }}</td>
                <td class="text-left text-no-wrap">{{ item.updated | formatDate }}</td>
                <td class="text-center">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="primary" v-bind="attrs" v-on="on" @click="updateItem(item, tab)">
                        <v-icon>edit</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('g_btn_modify') }}</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn icon color="red" v-bind="attrs" v-on="on" @click="deleteItem(item, tab)">
                        <v-icon>do_not_disturb_on</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('g_btn_delete') }}</span>
                  </v-tooltip>
                </td>
              </tr>
            </template>
          </v-data-table>
          <v-divider></v-divider>
          <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
            <v-pagination
              v-model="restrictionType[tab].pagination.page"
              :length="restrictionType[tab].pagination.length"
              :total-visible="15"
              :disabled="restrictionType[tab].loading"
            ></v-pagination>
            <div class="diy-page">
              {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select
                v-model="restrictionType[tab].pagination.itemsPerPage"
                class="diy-page-select"
                :items="selectItems"
              ></v-select>
            </div>
          </div>
        </v-card>
      </v-card>
    </v-container>

    <!-- 新增限制 IP 彈窗 -->
    <v-dialog v-model="editItem.show" persistent width="650px">
      <v-form ref="form" v-model="editItem.valid" lazy-validation>
        <v-card class="rounded-lg">
          <v-toolbar dark elevation="0" color="primary">
            <v-toolbar-title class="headline ml-2">
              {{ editItem.item.id ? $t('system_blacklist_editBlackList') : $t('system_blacklist_addBlackList') }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon @click.native="resetEditItem()" v-on="on"> <v-icon>close</v-icon> </v-btn>
              </template>
            </v-menu>
          </v-toolbar>

          <v-container grid-list-md class="py-5 px-10">
            <v-row wrap>
              <v-col cols="12" class="d-flex align-end">
                <v-col cols="2"> {{ $t('system_blacklist_limitEndPoint') }} </v-col>
                <v-col cols="2">
                  <v-checkbox v-model="editItem.item.wsystem" :label="$t('system_blacklist_options_FE')" color="primary" hide-details></v-checkbox>
                </v-col>
                <v-col cols="2">
                  <v-checkbox v-model="editItem.item.bcadmin" :label="$t('system_blacklist_options_BE')" color="primary" hide-details></v-checkbox>
                </v-col>
              </v-col>
              <v-col v-if="editItem.type != 2" cols="12">
                <v-text-field
                  v-if="editItem.item.id"
                  :value="editItem.item.ip"
                  type="text"
                  :label="$t('system_blacklist_ruleIp')"
                  readonly
                  disabled
                />
                <v-text-field
                  v-else
                  v-model="editItem.item.ip"
                  type="text"
                  :label="$t('system_blacklist_ruleIp')"
                  hint=""
                  :rules="[
                    v => !!/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v) || '格式不符合',
                  ]"
                />
              </v-col>
              <template v-else>
                <v-col cols="12">
                  <v-select v-model="editItem.item.regionAll" multiple outlined :items="[{ text: '全部', value: 1 }]" label="限制地区"> </v-select>
                </v-col>
                <v-col cols="12">
                  <v-select v-model="editItem.item.region" clearable multiple outlined :items="provinces" label="限制地区">
                    <!-- <template #item="{ item }">{{ `${item.text}` }}</template> -->
                  </v-select>
                </v-col>
                <v-col cols="12">
                  <v-select v-model="editItem.item.city" clearable outlined multiple :items="editCities" label="限制地区">
                    <!-- <template #item="{ item }">{{ `${item.CityName}` }}</template> -->
                  </v-select>
                </v-col>
              </template>
              <v-col cols="12">
                <v-text-field v-model="editItem.item.comment" type="text" :label="$t('g_table_column_remarks')"> </v-text-field>
              </v-col>
            </v-row>
          </v-container>

          <v-divider></v-divider>
          <v-card-actions class="pa-5">
            <v-spacer></v-spacer>
            <v-btn :loading="editItem.loading" color="primary" depressed :disabled="!editItem.valid" @click="mergeEdit(editItem.type)">
              {{ $t('g_btn_confirm') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <!-- 新增批量限制 IP 彈窗 -->
    <v-dialog v-model="importFile.show" persistent width="650px">
      <v-card class="rounded-lg">
        <v-toolbar dark elevation="0" color="primary">
          <v-toolbar-title class="headline ml-2"> {{ $t('system_blacklist_addBlackListBatches') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom left>
            <template #activator="{ on }">
              <v-btn icon @click.native="importFile.show = false" v-on="on"> <v-icon>close</v-icon> </v-btn>
            </template>
          </v-menu>
        </v-toolbar>

        <v-container grid-list-md class="py-5 px-10">
          <div class="d-flex align-center justify-center mb-5">
            <v-btn class="mx-1" color="primary" depressed :loading="importFile.loading" @click="$refs.uploader.click()">
              {{ $t('g_import_csv') }}
            </v-btn>
            <a class="mx1 v-btn v-btn--contained theme--light v-size--default primary" download href="/blacklist.csv">
              {{ $t('system_blacklist_downloadTemp') }}
            </a>
            <input ref="uploader" class="d-none" type="file" accept=".csv" @change="onFileChanged" />
          </div>
          <v-data-table
            :items-per-page.sync="importFile.items.length"
            :headers="headerArr(importFile.type).slice(1, 4)"
            :items="importFile.items"
            :loading="importFile.loading"
            class="elevation-1"
            hide-default-footer
          >
            <template slot="no-data">
              {{ $t('system_blacklist_clickBtn') }}
            </template>
            <template #item="{ item }">
              <tr>
                <td class="text-center">{{ item.ip }}</td>
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
                <td class="text-center">{{ item.comment }}</td>
              </tr>
            </template>
          </v-data-table>
        </v-container>

        <v-divider></v-divider>
        <v-card-actions class="pa-5">
          <v-spacer></v-spacer>
          <v-btn color="error" outlined @click="resetImportFile()">{{ $t('g_btn_cancel') }}</v-btn>
          <v-btn
            color="primary"
            depressed
            :disabled="!importFile.items.length"
            :loading="importFile.loading"
            @click="_import($event, importFile.type)"
            >{{ $t('g_btn_send') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import { shortcuts, exportXLSX } from '@/utils';
import { formatDate } from '@/filters/custom';
import Papaparse from 'papaparse';

export default {
  name: 'Restrictions',
  data() {
    return {
      selectItems: [10, 25, 50, 100],
      tab: 0,
      platformItems: [
        { lang: 'system_blacklist_options_all', value: 0 },
        { lang: 'system_blacklist_options_FE', value: 2 },
        { lang: 'system_blacklist_options_BE', value: 1 },
        { lang: 'system_blacklist_options_FEAndBE', value: 3 },
      ],
      restrictionType: [
        {
          name: 'IP白名单',
          lang: '',
          searchOptions: {},
          pagination: {
            totalItems: 0,
            page: 1,
            length: 0,
            itemsPerPage: 10,
          },
          headers: [
            {
              lang: 'g_table_column_id',
              text: 'ID',
              value: 'id',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'system_blacklist_ip',
              text: 'IP',
              value: 'ip',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'system_blacklist_limitEndPoint',
              text: '限制端点',
              value: 'limitendpoint',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'g_table_column_remarks',
              text: '备注',
              value: 'comment',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'g_table_column_operated',
              text: '操作時間',
              value: 'updated',
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
              align: 'center',
            },
          ],
          loading: false,
          urlList: '/system/black/ip/white/list',
          urlSearch: '/system/black/ip/white/search',
          urlExport: '/system/black/ip/white/export',
          urlBuckDel: '/system/black/ip/white/bulkdel',
          urlDelete: '/system/black/white/ip',
          urlMerge: '/system/black/white/ip',
          urlBuckAdd: '/system/black/ip/white/bulkadd',
          selected: [],
          data: [],
          importPreview: [],
        },
        {
          name: 'IP黑名单',
          lang: '',
          searchOptions: {},
          pagination: {
            totalItems: 0,
            page: 1,
            length: 0,
            itemsPerPage: 10,
          },
          headers: [
            {
              lang: 'g_table_column_id',
              text: 'ID',
              value: 'id',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'system_blacklist_area',
              text: '地区',
              value: 'region',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'system_blacklist_limitEndPoint',
              text: '限制端点',
              value: 'limitendpoint',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'g_table_column_remarks',
              text: '备注',
              value: 'comment',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'g_table_column_operated',
              text: '操作時間',
              value: 'updated',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'g_table_column_action',
              text: '操作',
              sortable: false,
              value: 'action',
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'center',
            },
          ],
          loading: false,
          urlList: '/system/black/ip/list',
          urlSearch: '/system/black/ip/search',
          urlExport: '/system/black/ip/export',
          urlBuckDel: '/system/black/ip/bulkdel',
          urlDelete: '/system/black/ip',
          urlMerge: '/system/black/ip',
          urlBuckAdd: '/system/black/ip/bulkadd',
          selected: [],
          data: [],
          importPreview: [],
        },
        {
          name: '地区限制',
          lang: '',
          searchOptions: {},
          pagination: {
            totalItems: 0,
            page: 1,
            length: 0,
            itemsPerPage: 10,
          },
          headers: [
            {
              lang: 'g_table_column_id',
              text: 'ID',
              value: 'id',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'system_blacklist_area',
              text: '地区',
              value: 'region',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'system_blacklist_limitEndPoint',
              text: '限制端点',
              value: 'limitendpoint',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'g_table_column_remarks',
              text: '备注',
              value: 'comment',
              sortable: false,
              class: 'text-no-wrap blue-grey lighten-5',
              align: 'left',
            },
            {
              lang: 'g_table_column_operated',
              text: '操作時間',
              value: 'updated',
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
              align: 'center',
            },
          ],
          loading: false,
          urlList: '/system/black/area/list',
          urlSearch: '/system/black/area/search',
          urlBuckDel: '/system/black/area/bulkdel',
          urlDelete: '/system/black/area/',
          urlMerge: '/system/black/area',
          selected: [],
          data: [],
          regions: [],
        },
      ],
      editItem: {
        show: false,
        type: null,
        item: {},
        valid: false,
      },
      importFile: {
        show: false,
        type: null,
        loading: false,
        items: [],
      },
    };
  },
  computed: {
    platforms() {
      return _.each(this.platformItems, item => {
        item.text = this.$t(item.lang);
      });
    },
    areaRestrict() {
      return this.restrictionType[0];
    },
    blacklistRestrict() {
      return this.restrictionType[1];
    },
    whitelistRestrict() {
      return this.restrictionType[2];
    },
    provinces() {
      const allProvince = {};
      const uniqProvince = [];
      _.each(this.restrictionType[2].regions, region => {
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
      return _.filter(this.restrictionType[2].regions, region =>
        this.restrictionType[2].searchOptions.region ? region.ProvinceName == this.restrictionType[2].searchOptions.region : true,
      );
    },
    editCities() {
      return this.cities.map(item => {
        const province = _.find(this.provinces, p => p.value == item.ProvinceCode).text;
        return { text: `${item.CityName}-${province}`, value: item.CityCode, ProvinceCode: item.ProvinceCode };
      });
      // _.filter(this.restrictionType[2].regions, region =>
      //   this.editItem.item.region ? region.ProvinceCode == this.editItem.item.region : true,
      // );
    },
  },
  watch: {
    'areaRestrict.pagination.page'(n) {
      this.loadData(n, 0);
    },
    'blacklistRestrict.pagination.page'(n) {
      this.loadData(n, 1);
    },
    'whitelistRestrict.pagination.page'(n) {
      this.loadData(n, 2);
    },
    'areaRestrict.pagination.itemsPerPage'(n) {
      this.loadData(1, 0);
    },
    'blacklistRestrict.pagination.itemsPerPage'(n) {
      this.loadData(1, 1);
    },
    'whitelistRestrict.pagination.itemsPerPage'(n) {
      this.loadData(1, 2);
    },
    'editItem.item.regionAll'(selection, oldValue) {
      selection = selection || [];
      if (selection.includes(1)) {
        this.editItem.item.region = _.cloneDeep(this.provinces).map(item => item.value);
        this.editItem.item.city = _.cloneDeep(this.cities)
          .filter(city => this.editItem.item.region.includes(city.ProvinceCode))
          .map(city => city.CityCode);
      } else {
        this.editItem.item.region = [];
        this.editItem.item.city = [];
      }
      console.log(this.editItem.item.city);
    },
    'editItem.item.region'(region, oldRegion) {
      region = region || [];
      this.editItem.item.city = _.cloneDeep(this.cities)
        .filter(city => this.editItem.item.region.includes(city.ProvinceCode))
        .map(city => city.CityCode);
    },
    'editItem.item.city'(city, oldCity) {},
  },
  created() {
    this.loadData(1, 0);
    this.loadData(1, 1);
    this.loadData(1, 2);
    this.loadRegions();
  },
  methods: {
    loadData(p, type) {
      const current = this.restrictionType[type ?? this.tab];
      if (current.loading) {
        return;
      }
      current.loading = true;
      this.$forceUpdate();
      const params = {
        ...current.searchOptions,
        page: p,
        num: current.pagination.itemsPerPage,
        status: current.status,
      };
      let url = current.urlList;
      if (params.ip || params.platform || params.region) {
        url = current.urlSearch;
        switch (type) {
          case 0:
          case 1:
            params.ip = params.ip ? params.ip.replace(/^\s*(\S*)\s*$/, '$1') : '';
            break;
          default:
            break;
        }
      }
      api
        .get(url, params)
        .then(data => {
          current.data = data.list == null ? [] : data.list;
          current.pagination.length = data.pageNums;
          current.pagination.totalItems = data.count;
          _.each(current.data, (item, i) => {
            _.each(item, (value, field) => {
              item[field.toLowerCase()] = value;
            });
          });
          current.loading = false;
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
          current.loading = false;
        });
    },
    loadRegions() {
      api
        .get('/system/areamap')
        .then(data => {
          this.restrictionType[2].regions = data.result;
          // console.log(this.restrictionType[2].regions);
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    resetOptions(type) {
      const { searchOptions } = this.restrictionType[type];
      _.each(searchOptions, (item, i) => {
        if (i.toLocaleLowerCase().indexOf('date') >= 0) {
          searchOptions[i] = [];
        } else {
          searchOptions[i] = null;
        }
      });
    },
    deleteItem(item, type) {
      const doSave = () => {
        let url = ``;
        let params;
        if (type == 2) {
          url = `/system/black/area/${item.id}`;
          params = undefined;
        } else {
          url = this.restrictionType[type].urlDelete;
          params = {
            id: item.id * 1,
          };
        }
        api
          .delete(url, params)
          .then(data => {
            this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
            this.loadData(1, type);
          })
          .catch(error => {
            this.$store.commit('MsgError', error.error);
          });
      };
      const text = this.$t('g_dialog_confirm_delete');
      this.$store.commit('Confirm', {
        text,
        ok() {
          doSave();
        },
      });
    },
    addRestrict(type) {
      this.editItem = {
        item: {
          bcadmin: true,
          wsystem: true,
        },
        show: true,
        loading: false,
        type,
        valid: true,
      };
    },
    addMassRestrict(type) {
      this.importFile = {
        items: [],
        show: true,
        loading: false,
        type,
      };
    },
    updateItem(item, type) {
      this.editItem = {
        show: true,
        loading: false,
        type,
        valid: true,
        item: {
          ...item,
          wsystem: item.wsystem == 1,
          bcadmin: item.bcadmin == 1,
        },
      };
    },
    mergeEdit(type) {
      const current = this.restrictionType[type ?? this.tab];
      if (this.$refs.form.validate()) {
        let { item } = this.editItem;
        if (this.editItem.loading) {
          return;
        }
        this.editItem.loading = true;
        const url = current.urlMerge;
        item.wsystem = item.wsystem * 1;
        item.bcadmin = item.bcadmin * 1;
        if (item.id > 0) {
          item = {
            id: item.id * 1,
            wsystem: item.wsystem * 1,
            bcadmin: item.bcadmin * 1,
            ip: item.ip,
            comment: item.comment,
          };
          api
            .put(url, item)
            .then(res => {
              this.$store.commit('MsgOk', this.$t('g_msgSaved'));
              this.editItem.show = false;
              this.editItem.loading = false;
              this.editItem.valid = true;
              this.loadData(1, type);
            })
            .catch(error => {
              this.editItem.loading = false;
              this.editItem.valid = true;
              this.$store.commit('MsgError', error.error);
            });
        } else {
          if (type == 2) {
            item = {
              wsystem: item.wsystem,
              bcadmin: item.bcadmin,
              cityCodes: item.city,
              comment: item.comment,
            };
          }
          api
            .post(url, item)
            .then(res => {
              this.$store.commit('MsgOk', this.$t('g_msgInsert'));
              this.editItem.loading = false;
              this.editItem.show = false;
              this.loadData(1, type);
            })
            .catch(error => {
              console.log(error);
              this.editItem.loading = false;
              this.$store.commit('MsgError', error.error ? error.error.replace(/(.*)(重复|已重複)/, '添加的$1已存在于黑名单中') : null);
            });
        }
      }
    },
    onFileChanged(file) {
      if (this.importFile.loading) {
        return;
      }
      this.importFile.loading = true;
      Papaparse.parse(file.target.files[0], {
        header: true,
        complete: meta => {
          // console.log(meta);
          this.importFile.items = [];
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
            this.importFile.items.push(item);
          });
          this.importFile.loading = false;
        },
      });
    },
    _export(evt, type) {
      const current = this.restrictionType[type];
      if (current.loading) {
        return;
      }
      current.loading = true;
      const url = current.urlExport;
      api
        .get(url, current.searchOptions)
        .then(data => {
          if (data == null || data.list == null || data.list == []) {
            this.$store.commit('MsgError', this.$t('g_export_nodata'));
          } else {
            const list = [];
            const cols = [];
            if (current.searchOptions.ip || current.searchOptions.platform) {
              _.each(data.list, (item, i) => {
                _.each(item, (value, field) => {
                  item[field.toLowerCase()] = value;
                });
              });
            }
            current.headers.forEach(v => {
              if (v.value != '') {
                cols.push(v.text);
              }
            });
            list.push(cols);
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
              tmp.push(formatDate(item.updated));
              list.push(tmp);
            });

            exportXLSX(list, 'IP限制');
            current.loading = false;
          }
        })
        .catch(error => {
          // console.log(error);
          this.$store.commit('MsgError', error.error);
          current.loading = false;
        });
    },
    _import(evt, type) {
      const current = this.restrictionType[type];
      if (this.importFile.loading) {
        return;
      }
      this.importFile.loading = true;
      const data = [];
      this.importFile.items.forEach((item, i) => {
        data.push({
          ip: item.ip,
          platform: item.platform,
          comment: item.comment,
        });
      });
      api
        .post(current.urlBuckAdd, { data })
        .then(result => {
          this.importFile.items = [];
          this.$refs.uploader.value = '';
          this.importFile.show = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        })
        .finally(() => {
          this.importFile.loading = false;
          this.loadData(1, type);
        });
    },
    massDelete(type) {
      const current = this.restrictionType[type];
      if (current.loading) {
        return;
      }
      current.loading = true;
      const params = {
        ids: [],
      };
      current.selected.forEach((item, i) => {
        params.ids.push(item.id * 1);
      });
      const url = current.urlBuckDel;
      api
        .delete(url, params)
        .then(() => {
          this.$store.commit('MsgOk', `${this.$t('system_blacklist_dialog_deleteSuccess')}(${params.ids.length})`);
          current.selected = [];
        })
        .catch(error => {
          this.$store.commit('MsgError', this.$t('system_blacklist_dialog_deleteFail'));
        })
        .finally(() => {
          current.loading = false;
          this.loadData(1, type);
        });
    },
    resetEditItem() {
      this.editItem.show = false;
      this.loadData(1, this.tab);
      this.loadData(1, 2);
    },
    resetImportFile() {
      this.importFile.show = false;
      this.loadData(1, this.tab);
      this.loadData(1, 2);
    },
    headerArr(type) {
      const headerArr = _.each(this.restrictionType[type || 0].headers, item => {
        item.text = this.$t(item.lang);
      });
      return headerArr;
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
