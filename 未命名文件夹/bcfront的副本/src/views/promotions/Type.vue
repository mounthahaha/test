<template>
  <div>
    <v-card>
      <v-toolbar elevation="1" class="pl-2">
        <v-icon class="mr-2"> list </v-icon>
        <v-toolbar-title>活动类型管理</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="addGameType">
          <v-icon>add</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="pa-0">
        <v-data-table :headers="headers" :items="GameTypes" :loading="loading" class="elevation-1" :options.sync="pagination">
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template slot="items" slot-scope="props">
            <td class="text-left text-no-wrap">{{ props.item.Id }}</td>
            <td class="text-left text-no-wrap">{{ props.item.Name }}</td>
            <td class="text-left text-no-wrap">{{ props.item.Note }}</td>
            <td class="text-left text-no-wrap">
              <v-chip v-if="props.item.Deleted == true" label outlined small> 停用 </v-chip>
              <v-chip v-else label outlined small color="green"> 启用 </v-chip>
            </td>
            <td class="text-left text-no-wrap">{{ props.item.Created | formatDate }}</td>
            <td class="text-left text-no-wrap">
              <v-btn class="x-small" small depressed color="primary" @click="updateGameType(props.item)">更新</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <v-dialog v-model="infoBox" persistent width="500px">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title class="headline">新增游戏类型</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click.native="infoBox = false">
                  <v-icon>close</v-icon>
                </v-btn>
              </template>
            </v-menu>
          </v-toolbar>
          <v-card-text>
            <v-container grid-list-md pa-2>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field
                    v-model="GameType.Name"
                    type="text"
                    label="名称"
                    placeholder="游戏类型名称"
                    :rules="[v => !!v || '请填写游戏类型名称!']"
                  >
                  </v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-textarea v-model="GameType.Note" label="备注" :rules="[v => !!v || '请填写备注!']"></v-textarea>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" depressed :disabled="!valid" @click="mergeApi()"> {{ $t('g_btn_confirm') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>
<script>
import api from '@/api';

export default {
  name: 'Announcement',
  components: {},
  data() {
    return {
      valid: true,
      loading: false,
      pagination: {
        page: 1,
        length: 0,
        itemsPerPage: 10,
        sortBy: [],
      },
      headers: [
        {
          lang: 'g_table_column_id',
          text: 'ID',
          value: 'Id',
        },
        {
          text: '名称',
          sortable: false,
          value: '',
        },
        {
          lang: 'g_table_column_remarks',
          text: '备注',
          sortable: false,
          value: '',
        },
        {
          lang: 'g_table_column_status',
          text: '状态',
          sortable: false,
          value: '',
        },
        {
          lang: 'g_table_column_created',
          text: '创建时间',
          value: 'Created',
        },
        {
          lang: 'g_table_column_action',
          text: '操作',
          sortable: false,
          value: '',
        },
      ],
      GameTypes: [],
      infoBox: false,
      GameType: {},
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
  },
  watch: {},
  mounted() {
    this.loadGameTypes(1);
  },
  methods: {
    loadGameTypes(p) {
      this.loading = true;
      api
        .get('/games/types')
        .then(data => {
          this.GameTypes = data.result;
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    addGameType() {
      this.GameType = {};
      this.infoBox = true;
    },
    updateGameType(item) {
      this.GameType = item;
      this.infoBox = true;
    },
    offline(id) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: '是否确认将此公告停用',
        ok() {
          api
            .post(`/games/api/offline/${id}`, {
              status,
            })
            .then(() => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              $this.loadGameTypes(1);
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    online(id) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: '是否确认将此公告启用',
        ok() {
          api
            .post(`/games/api/online/${id}`, {
              status,
            })
            .then(() => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              $this.loadGameTypes(1);
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    mergeApi() {
      const $this = this;
      if (this.$refs.form.validate()) {
        let url = '/games/type';
        if ($this.GameType.Id > 0) {
          url += `/${$this.GameType.Id}`;
        }
        api
          .post(url, this.GameType)
          .then(data => {
            $this.$store.commit('MsgOk', this.$t('g_msgSaved'));
            $this.loadGameTypes();
            $this.infoBox = false;
          })
          .catch(error => {
            $this.$store.commit('MsgError', error.error);
          });
      }
    },
  },
};
</script>
