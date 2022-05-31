<template>
  <div class="Authorization">
    <v-toolbar elevation="1" class="pl-2">
      <v-icon class="mr-2"> settings </v-icon>
      <v-toolbar-title>{{ $t(`sidebar_${$route.name}`) }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- 新增管理員 角色  -->
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="elevation-0 ml-4 mr-2" fab dark small medium depressed v-on="on" @click="addManager">
            <v-icon>person_add</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('system_auth_addManager') }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn v-bind="attrs" color="primary" class="elevation-0 ml-4 mr-2" fab dark small medium depressed v-on="on" @click="addGroup">
            <v-icon>group_add</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('system_auth_addRole') }}</span>
      </v-tooltip>
    </v-toolbar>

    <v-container fluid class="pa-5">
      <v-tabs slot="extension" v-model="tab" background-color="#eceff1" center-active>
        <v-tabs-slider color="primary"></v-tabs-slider>
        <v-tab v-for="item in tabItems" :key="item" color="primary"> {{ $t(item) }} </v-tab>
      </v-tabs>
      <v-card class="pa-5">
        <v-tabs-items v-model="tab">
          <!-- 管理員列表 -->
          <v-tab-item>
            <v-data-table
              :no-data-text="$t('g_text_noData')"
              :headers="managerHeaderComputed"
              :options.sync="pagination1"
              :server-items-length="pagination1.totalItems"
              :items="gridItems1"
              :loading="loading"
              :footer-props="{ 'items-per-page-options': [10, 50, 100, 150, 200], 'rows-per-page-text': $t('g_pagination_rows') }"
              class="elevation-1"
              hide-default-footer
            >
              <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
              <template slot="no-data"> {{ $t('g_text_noData') }} </template>
              <template #body="{ items }">
                <tbody>
                  <tr v-for="(item, index) in items" :key="`list_${index}`">
                    <td class="text-left text-no-wrap">{{ item.id }}</td>
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <td class="text-left text-no-wrap" v-html="FormatGroup(item.groups)"></td>
                    <td class="text-left text-no-wrap">{{ item.name }}</td>
                    <!-- <td class="text-left text-no-wrap">
                      <v-edit-dialog :return-value.sync="item.password" lazy @save="updatePassword(index)">
                        <span>******</span>
                        <v-text-field slot="input" v-model="item.password" type="password" :label="$t('system_auth_pressToSave')"></v-text-field>
                      </v-edit-dialog>
                    </td> -->
                    <td class="text-left text-no-wrap">{{ item.created | formatDate }}</td>
                    <td class="text-center text-no-wrap">
                      <v-chip label outlined small :color="item.deleted == 'true' ? `red` : `green`">
                        {{ item.deleted == 'true' ? $t('g_btn_disable') : $t('g_btn_enable') }}
                      </v-chip>
                    </td>
                    <!-- 操作 -->
                    <td class="text-center text-no-wrap">
                      <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                          <v-btn icon color="primary" v-bind="attrs" @click="editManager(item)" v-on="on">
                            <v-icon>edit</v-icon>
                          </v-btn>
                        </template>
                        <span>{{ $t('g_btn_edit') }}</span>
                      </v-tooltip>
                      <template v-if="item.id != 1">
                        <v-tooltip bottom>
                          <template #activator="{ on, attrs }">
                            <v-btn icon color="primary" v-bind="attrs" @click="deleteManager(item.id)" v-on="on">
                              <v-icon>delete</v-icon>
                            </v-btn>
                          </template>
                          <span>{{ $t('g_btn_delete') }}</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                          <template #activator="{ on, attrs }">
                            <v-btn v-if="item.deleted == 'false'" icon color="red" v-bind="attrs" @click="setManagerStatus(item.id, 1)" v-on="on">
                              <v-icon>do_not_disturb_on</v-icon>
                            </v-btn>
                            <v-btn v-else icon color="green" v-bind="attrs" @click="setManagerStatus(item.id, 0)" v-on="on">
                              <v-icon>add_circle</v-icon>
                            </v-btn>
                          </template>
                          <span v-if="item.deleted == 'false'">{{ $t('g_btn_disable') }}</span>
                          <span v-else>{{ $t('g_btn_enable') }}</span>
                        </v-tooltip>
                      </template>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-data-table>
            <v-divider></v-divider>
            <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
              <v-pagination v-model="pagination1.page" :length="pagination1.length" :total-visible="15" :disabled="loading"></v-pagination>
              <div class="diy-page">
                {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
              </div>
            </div>
          </v-tab-item>

          <!-- 角色列表 -->
          <v-tab-item>
            <v-data-table
              :no-data-text="$t('g_text_noData')"
              :headers="groupHeadersComputed"
              :options.sync="pagination2"
              :server-items-length="pagination2.totalItems"
              :items="gridItems2"
              :loading="loading"
              :footer-props="{ 'items-per-page-options': [10, 50, 100, 150, 200], 'rows-per-page-text': $t('g_pagination_rows') }"
              class="elevation-1"
              hide-default-footer
            >
              <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
              <template slot="no-data"> {{ $t('g_text_noData') }} </template>
              <template #body="{ items }">
                <tbody>
                  <tr v-for="(item, index) in items" :key="`list_${index}`">
                    <td class="text-left text-no-wrap">{{ item.Id }}</td>
                    <td class="text-left text-no-wrap">
                      <v-edit-dialog :return-value.sync="item.Name" lazy @save="updateGroup(index)">
                        {{ item.Name }}
                        <v-text-field slot="input" v-model="item.Name" :label="$t('system_auth_pressToSave')"></v-text-field>
                      </v-edit-dialog>
                    </td>
                    <td class="text-left text-no-wrap">
                      <v-edit-dialog :return-value.sync="item.Note" lazy @save="updateGroup(index)">
                        {{ item.Note }}
                        <v-text-field slot="input" v-model="item.Note" :label="$t('system_auth_pressToSave')"></v-text-field>
                      </v-edit-dialog>
                    </td>
                    <td class="text-left text-no-wrap">{{ item.Created | formatDate }}</td>
                    <!-- 操作 -->
                    <td class="text-center">
                      <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                          <v-btn v-if="item.Id != 1" icon color="primary" v-bind="attrs" @click="setRouter(item.Id)" v-on="on">
                            <v-icon>edit</v-icon>
                          </v-btn>
                        </template>
                        <span>{{ $t('g_btn_edit') }}</span>
                      </v-tooltip>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-data-table>
            <v-divider></v-divider>
            <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
              <v-pagination v-model="pagination2.page" :length="pagination2.length" :total-visible="15" :disabled="loading"></v-pagination>
              <div class="diy-page">
                {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
              </div>
            </div>
          </v-tab-item>

          <!-- 路由列表 -->
          <v-tab-item>
            <v-data-table
              :no-data-text="$t('g_text_noData')"
              :headers="routerHeadersComputed"
              :options.sync="pagination3"
              :server-items-length="pagination3.totalItems"
              :items="gridItems3"
              :loading="loading"
              :footer-props="{ 'items-per-page-options': [10, 50, 100, 150, 200], 'rows-per-page-text': $t('g_pagination_rows') }"
              class="elevation-1"
              hide-default-footer
            >
              <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
              <template slot="no-data"> {{ $t('g_text_noData') }} </template>
              <template #body="{ items }">
                <tbody>
                  <tr v-for="(item, index) in items" :key="`list_${index}`">
                    <td class="text-left text-no-wrap">{{ item.id }}</td>
                    <td class="text-left text-no-wrap">{{ item.mname }}</td>
                    <td class="text-left text-no-wrap">{{ item.name }}</td>
                    <td class="text-left text-no-wrap">{{ item.router }}</td>
                    <td class="text-left text-no-wrap">
                      <v-chip label outlined small :color="item.method == 'POST' ? `red` : `green`">{{ item.method }}</v-chip>
                    </td>
                    <!-- <td class="text-left text-no-wrap">
                      <v-btn small class="x-small" color="primary" @click="updateAccount(index)">{{ $t('g_btn_edit') }}</v-btn>
                    </td> -->
                  </tr>
                </tbody>
              </template>
            </v-data-table>
            <v-divider></v-divider>
            <div class="text-center pa-0 mt-5 diy-page-wrap text-no-wrap">
              <v-pagination v-model="pagination3.page" :length="pagination3.length" :total-visible="15" :disabled="loading"></v-pagination>
              <div class="diy-page">
                {{ $t('g_pagination_rows') }}&nbsp;&nbsp;<v-select v-model="selectItem" class="diy-page-select" :items="selectItems"></v-select>
              </div>
            </div>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </v-container>

    <!-- 新增管理員彈窗 -->
    <v-dialog v-model="managerDialog" width="50%">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card class="rounded-lg">
          <v-toolbar dark elevation="0" color="primary">
            <v-toolbar-title class="headline ml-2"> {{ $t('system_auth_editManager') }} </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click.native="managerDialog = false"> <v-icon>close</v-icon> </v-btn>
              </template>
            </v-menu>
          </v-toolbar>

          <v-container grid-list-md class="py-5 px-10">
            <v-row wrap>
              <v-col cols="12">
                <v-text-field
                  v-model="manager.Name"
                  :readonly="!!manager.id"
                  :disabled="!!manager.id"
                  :label="$t('system_auth_manageAcc')"
                  :placeholder="$t('system_auth_placeholder_enterAcc')"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-if="!manager.name"
                  v-model="manager.Password"
                  type="password"
                  :label="$t('system_auth_pwd')"
                  :placeholder="$t('system_auth_placeholder_enterPwd')"
                ></v-text-field>
                <v-edit-dialog v-else :return-value.sync="manager.password" lazy @save="updatePassword()">
                  <v-btn small depressed color="primary">{{ $t('system_auth_resetPwd') }}</v-btn>
                  <v-text-field slot="input" v-model="manager.password" type="password" :counter="16" :label="$t('system_auth_pressToSave')">
                  </v-text-field>
                </v-edit-dialog>
              </v-col>
              <template v-if="manager.id !== 1">
                <v-col v-if="!!manager.id" cols="12">
                  <v-switch
                    v-model="managerEnabled"
                    :label="manager.deleted == 'true' ? $t('g_btn_enable') : $t('g_btn_disable')"
                    @click="setManagerStatus(manager.id, Number(managerEnabled))"
                  ></v-switch>
                  <!-- <v-btn v-if="manager.deleted == 'false'" small color="error" @click="setManagerStatus(manager.id, 1)">
                    {{ $t('g_btn_disable') }}
                  </v-btn>
                  <v-btn v-if="manager.deleted == 'true'" small color="green" dark @click="setManagerStatus(manager.id, 0)">
                    {{ $t('g_btn_enable') }}
                  </v-btn> -->
                </v-col>
                <v-col cols="12">
                  <v-row wrap>
                    <v-col v-for="(r, index) in groups" :key="index" cols="4">
                      <v-checkbox v-model="manager.group" :label="r.Name" color="primary" :value="r.Id"></v-checkbox>
                    </v-col>
                  </v-row>
                </v-col>
              </template>
              <v-col v-if="!!manager.id" class="align-self-center text-no-wrap" shrink>
                <span class="mr-2">{{ $t('system_auth_googleCode') }}</span>
                <v-btn small color="primary" dark class="x-small elevation-0" @click="Authed(manager.id)">
                  {{ $t('system_auth_clearGoogleBinding') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-container>

          <v-divider></v-divider>
          <v-card-actions class="pa-5">
            <v-spacer></v-spacer>
            <template v-if="manager.id != 1">
              <v-btn color="blue darken-1" text outlined @click.native="managerDialog = false">{{ $t('g_btn_cancel') }}</v-btn>
              <v-btn color="primary" depressed @click.native="saveManager">{{ $t('g_btn_save') }}</v-btn>
            </template>
            <template v-else>
              <v-btn color="primary" depressed @click.native="managerDialog = false">{{ $t('g_btn_close') }}</v-btn>
            </template>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <!-- 新增角色彈窗 -->
    <v-dialog v-model="groupDialog" width="50%">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card class="rounded-lg">
          <v-toolbar dark elevation="0" color="primary">
            <v-toolbar-title class="headline ml-2"> {{ $t('system_auth_addNewRole') }} </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click.native="groupDialog = false"> <v-icon>close</v-icon> </v-btn>
              </template>
            </v-menu>
          </v-toolbar>

          <v-container grid-list-md class="py-5 px-10">
            <v-row wrap>
              <v-col cols="12">
                <v-text-field
                  v-model="group.Name"
                  :label="$t('system_auth_userGroup')"
                  :placeholder="$t('system_auth_placeholder_enterName')"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="group.Note"
                  :label="$t('system_auth_remarks')"
                  :placeholder="$t('system_auth_placeholder_intro')"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
          <v-divider></v-divider>
          <v-card-actions class="pa-5">
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text outlined @click.native="groupDialog = false">{{ $t('g_btn_cancel') }}</v-btn>
            <v-btn color="primary" depressed @click.native="saveGroup">{{ $t('g_btn_save') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <!-- 權限表彈窗 -->
    <v-dialog v-model="infoBox" persistent width="100%">
      <v-card class="rounded-lg">
        <v-toolbar dark elevation="0" color="primary">
          <v-toolbar-title class="headline ml-2">{{ $t('system_auth_editPermissions') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom left>
            <template #activator="{ on }">
              <v-btn icon v-on="on" @click.native="infoBox = false"> <v-icon>close</v-icon> </v-btn>
            </template>
          </v-menu>
        </v-toolbar>

        <v-container grid-list-md class="py-5 px-10">
          <v-row wrap class="mb-5">
            <v-col v-for="(v, i) in formatRouters" :key="i" cols="12">
              <v-checkbox v-model="GroupModule" :label="v.name" color="primary" :value="i" hide-details></v-checkbox>
              <v-row wrap class="ml-5">
                <v-col v-for="(r, index) in v['children']" :key="index" cols="2">
                  <v-checkbox
                    v-model="GroupRouter"
                    persistent-hint
                    :hint="r.note"
                    :label="r.name"
                    color="primary"
                    :value="r.id + ''"
                    @change="Toggle(r)"
                  ></v-checkbox>
                </v-col>
              </v-row>
              <v-divider class="mt-5"></v-divider>
            </v-col>
          </v-row>
        </v-container>
        <v-divider></v-divider>
        <v-card-actions class="pa-5">
          <v-spacer></v-spacer>
          <v-btn color="primary" depressed @click="saveRouter()">{{ $t('g_btn_confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';

export default {
  name: 'Authorization',
  data() {
    return {
      selectItem: 25,
      selectItems: [25, 50, 100, 500],
      valid: true,
      tab: null,
      tabItems: ['system_auth_manager', 'system_auth_roleManagement', 'system_auth_routeManagement'],
      loading: false,
      pagination1: {
        length: 0,
        itemsPerPage: 25,
        page: 1,
        sortBy: ['created'],
        sortDesc: [true],
      },
      pagination2: {
        length: 0,
        itemsPerPage: 25,
        page: 1,
        sortBy: ['created'],
        sortDesc: [true],
      },
      pagination3: {
        length: 0,
        itemsPerPage: 25,
        page: 1,
        sortBy: ['created'],
        sortDesc: [true],
      },
      managerheaders: [
        {
          lang: 'g_table_column_id',
          text: 'ID',
          value: 'Id',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'system_auth_column_role',
          text: '角色',
          value: 'groups',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'system_auth_column_account',
          text: '帐号',
          value: 'Type',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        // {
        //   lang: '',
        //   text: '密码(点击*修改)',
        //   value: 'Pass',
        //   sortable: false,
        //   class: 'text-no-wrap blue-grey lighten-5',
        //   align: 'left',
        // },
        {
          lang: 'g_table_column_created',
          text: '创建时间',
          value: 'Bank',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_status',
          text: '状态',
          value: 'Deleted',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
        {
          lang: 'g_table_column_action',
          text: '操作',
          value: 'operate',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
      ],
      managers: [],
      groupHeaders: [
        {
          lang: 'g_table_column_id',
          text: 'ID',
          value: 'Id',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'system_auth_column_roleName',
          text: '角色名(点击修改)',
          value: 'Name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'system_auth_column_remarksEdit',
          text: '备注(点击修改)',
          value: 'Note',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_created',
          text: '创建时间',
          value: 'Created',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'g_table_column_action',
          text: '操作',
          value: 'operate',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'center',
        },
      ],
      groups: [],
      routerHeaders: [
        {
          lang: 'g_table_column_id',
          text: 'ID',
          value: 'Id',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'system_auth_column_module',
          text: '模块',
          value: 'Name',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'system_auth_column_routeName',
          text: '路由名称',
          value: 'Note',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'system_auth_column_requirePath',
          text: '访问路径',
          value: 'Created',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        {
          lang: 'system_auth_column_requireMethod',
          text: '请求方式',
          value: 'Created',
          sortable: false,
          class: 'text-no-wrap blue-grey lighten-5',
          align: 'left',
        },
        // {
        //   lang: 'g_table_column_action',
        //   text: '操作',
        //   value: 'operate',
        //   sortable: false,
        //   class: 'text-no-wrap blue-grey lighten-5',
        //   align: 'left',
        // },
      ],
      routers: [],
      formatRouters: {},
      infoBox: false,
      GroupModule: [],
      GroupRouter: [],
      GroupRouterAll: {},
      CurGroup: 0,
      groupDialog: false,
      group: {},
      groupKV: {},
      managerDialog: false,
      manager: { group: [] },
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    gridItems1() {
      const skip = (this.pagination1.page - 1) * this.pagination1.itemsPerPage;
      return this.managers.slice(skip, skip + this.pagination1.itemsPerPage);
    },
    gridItems2() {
      const skip = (this.pagination2.page - 1) * this.pagination2.itemsPerPage;
      return this.groups.slice(skip, skip + this.pagination2.itemsPerPage);
    },
    gridItems3() {
      const skip = (this.pagination3.page - 1) * this.pagination3.itemsPerPage;
      return this.routers.slice(skip, skip + this.pagination3.itemsPerPage);
    },
    managerEnabled: {
      get() {
        return this.manager.deleted == 'false';
      },
      set(val) {
        this.manager.deleted = (!val).toString();
      },
    },
    managerHeaderComputed() {
      return this.managerheaders.map(item => {
        item.text = this.$t(item.lang);
        return item;
      });
    },
    groupHeadersComputed() {
      return this.groupHeaders.map(item => {
        item.text = this.$t(item.lang);
        return item;
      });
    },
    routerHeadersComputed() {
      return this.routerHeaders.map(item => {
        item.text = this.$t(item.lang);
        return item;
      });
    },
  },
  watch: {
    selectItem(newVal) {
      this.pagination1.itemsPerPage = newVal;
      this.pagination2.itemsPerPage = newVal;
      this.pagination3.itemsPerPage = newVal;
      this.loadGroups(1);
    },
    tab(n, o) {
      this.pagination1.page = 1;
      this.pagination2.page = 1;
      this.pagination3.page = 1;
      const $this = this;
      switch (n) {
        case 0:
          $this.loadManagers(1);
          break;
        case 1:
          $this.loadGroups(1);
          break;
        case 2:
          $this.loadRouters(1);
          break;
        default:
          break;
      }
    },
    GroupModule(n, o) {
      const $this = this;
      if (n.length > o.length) {
        // 新增
        const d = n.filter(v => {
          return o.indexOf(v) === -1;
        }); // 求差集
        if (d.length > 0) {
          // 并集
          const arr = $this.GroupRouterAll[d[0]].filter(v => {
            return !($this.GroupRouter.indexOf(v) > -1);
          });
          $this.GroupRouter = $this.GroupRouter.concat(arr);
        }
      } else {
        // 减少
        const dd = o.filter(v => {
          return n.indexOf(v) === -1;
        }); // 求差集
        if (dd.length > 0) {
          // 差集
          $this.GroupRouter = $this.GroupRouter.filter(v => {
            return !($this.GroupRouterAll[dd[0]].indexOf(v) > -1);
          });
        }
      }
    },
    managerDialog(n, o) {
      if (this.group.length == 0) {
        this.loadGroups(1);
      }
    },
  },
  created() {
    this.loadGroups(1);
  },
  methods: {
    FormatGroup(group) {
      if (group == '') {
        return '--';
      }
      const groups = group.split(',');
      let ret = '';
      const len = groups.length;
      for (let i = 0; i < len; i++) {
        ret += this.groupKV[groups[i]];
        if (i < len - 1) {
          ret += ' , ';
        }
      }
      return ret;
    },
    Toggle(obj) {
      const $this = this;
      const c = $this.GroupRouterAll[obj.module].filter(v => {
        return $this.GroupRouter.indexOf(v) > -1;
      });
      if (c.length !== $this.GroupRouterAll[obj.module].length) {
        const index = $this.GroupModule.indexOf(obj.module);
        if (index > -1) {
          $this.GroupModule.splice(index, 1);
        }
      } else {
        $this.GroupModule.push(obj.module);
      }
    },
    loadManagers(p) {
      this.loading = true;
      const $this = this;
      api
        .get('/system/managers')
        .then(data => {
          if (data.result) {
            $this.managers = data.result;
            $this.pagination1.length = Math.ceil(data.result.length / this.pagination1.itemsPerPage);
            $this.pagination1.totalItems = data.result.length;
          } else {
            $this.managers = [];
            $this.pagination1.length = 0;
            $this.pagination1.totalItems = 0;
          }
          $this.loading = false;
        })
        .catch(error => {
          console.log(error);
          $this.$store.commit('MsgError', error.error);
        });
    },
    loadGroups(p) {
      const $this = this;
      this.loading = true;
      api
        .get('/system/manager/groups')
        .then(data => {
          if (data.result) {
            this.groups = data.result;
            this.pagination2.length = Math.ceil(data.result.length / this.pagination2.itemsPerPage);
            this.pagination2.totalItems = data.result.length;
            this.groups.forEach(v => {
              $this.groupKV[v.Id] = v.Name;
            });
          } else {
            $this.groups = [];
            $this.pagination2.length = 0;
            $this.pagination2.totalItems = 0;
          }
          this.loading = false;
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
        });
    },
    loadRouters() {
      this.loading = true;
      api
        .get('/system/manager/routers')
        .then(data => {
          if (data.result) {
            this.routers = data.result;
            this.pagination3.length = Math.ceil(data.result.length / this.pagination3.itemsPerPage);
            this.pagination3.totalItems = data.result.length;

            this.formatRouters = {};
            const $this = this;
            const formatRouters = {};
            data.result.forEach(v => {
              if (!formatRouters[v.module]) {
                formatRouters[v.module] = {
                  name: v.mname,
                  children: [],
                };
                $this.GroupRouterAll[v.module] = [];
              }
              $this.GroupRouterAll[v.module].push(v.id);
              formatRouters[v.module].children.push(v);
            });
            this.formatRouters = formatRouters;
          } else {
            $this.routers = [];
            $this.pagination3.length = 0;
            $this.pagination3.totalItems = 0;
          }
          this.loading = false;
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
        });
    },
    setRouter(gid) {
      const $this = this;
      $this.$store.commit('ShowGlobal', 'standby');
      if (Object.keys($this.formatRouters).length == 0) {
        $this.loadRouters();
      }
      $this.CurGroup = gid;
      $this.GroupModule = []; // 清空
      api
        .get(`/system/manager/router/${gid}`)
        .then(data => {
          $this.infoBox = true;
          if (data.result == null) {
            data.result = [];
          }
          $this.GroupRouter = data.result;
          if ($this.GroupRouter.length > 0) {
            for (const i in $this.GroupRouterAll) {
              if ($this.GroupRouterAll[i].length > 0) {
                const c = $this.GroupRouterAll[i].filter(v => {
                  return $this.GroupRouter.indexOf(v) > -1;
                }); // 求交集
                if (c.length > 0) {
                  const d = c.filter(v => {
                    return $this.GroupRouterAll[i].indexOf(v) == -1;
                  }); // 求差集
                  if (d.length == 0) {
                    // 全选
                    $this.GroupModule.push(i);
                  }
                }
              }
            }
          }
          $this.$store.commit('ShowGlobal', '');
        })
        .catch(error => {
          $this.$store.commit('ShowGlobal', '');
          $this.$store.commit('MsgError', error.error);
        });
    },
    saveRouter() {
      const $this = this;
      api
        .post(`/system/manager/router/${$this.CurGroup}`, { Data: $this.GroupRouter })
        .then(data => {
          $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
          $this.infoBox = false;
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    saveGroup() {
      const $this = this;
      api
        .post('/system/manager/group', $this.group)
        .then(data => {
          $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
          $this.groupDialog = false;
          $this.loadGroups(1);
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    updateGroup(e) {
      const $this = this;
      const group = this.groups[e];
      api
        .post(`/system/manager/group/${group.Id}`, group)
        .then(data => {
          $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
          $this.loadGroups(1);
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    updateManager(i) {
      this.managerDialog = true;
      this.manager = this.managers[i];
      this.manager.Name = this.manager.name;
      this.manager.group = this.manager.groups.split(',').map(x => parseInt(x));
    },
    saveManager() {
      const $this = this;
      let promise = null;
      const id = $this.manager.id;
      console.log(this.manager);
      if (!$this.manager.id) {
        promise = api.post('/system/manager', $this.manager);
      } else {
        const post = {
          group: $this.manager.group,
        };
        promise = api.put(`/system/manager/${id}`, post);
      }
      promise
        .then(data => {
          $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
          $this.managerDialog = false;
          $this.manager = { group: [] };
          $this.loadManagers();
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    setManagerStatus(id, status) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: status == 0 ? this.$t('system_auth_dialog_confirmEnableAccount') : this.$t('system_auth_dialog_confirmDisableAccount'),
        ok() {
          api
            .post(`/system/manager/${id}`, { status })
            .then(data => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              $this.loadManagers(1);
              $this.managerEnabled = Boolean(!status);
              $this.$forceUpdate();
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    updatePassword() {
      api
        .post(`/system/manager/password/${this.manager.id}`, { password: this.manager.password })
        .then(data => {
          this.$store.commit('MsgOk', this.$t('g_msgSet'));
          this.manager.password = '';
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    Authed(id) {
      const $this = this;
      id = Number(id);
      api
        .post('/system/manager/authed', { id })
        .then(data => {
          $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    editManager(item) {
      this.managerDialog = true;
      item.Name = item.name;
      item.showPass = false;
      item.passRules = [v => !!v || this.$t('system_auth_rules_password')];
      item.group = _.map(item.groups.split(','), d => {
        return Number(d);
      });
      this.manager = item;
    },
    deleteManager(id) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: this.$t('system_auth_dialog_confirmDeleteAccount'),
        ok() {
          api
            .delete(`/system/managers/${id}`)
            .then(data => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              $this.loadManagers(1);
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    addManager() {
      this.manager = { group: [] };
      this.managerDialog = true;
    },
    addGroup() {
      this.groupDialog = true;
    },
  },
};
</script>
