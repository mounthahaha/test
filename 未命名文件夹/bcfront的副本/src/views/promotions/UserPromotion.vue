<template>
  <div>
    <v-card>
      <v-toolbar elevation="1" class="pl-2">
        <v-icon class="mr-2"> list </v-icon>
        <v-toolbar-title>用户参与活动</v-toolbar-title>
      </v-toolbar>
      <v-card-text class="pa-0">
        <v-data-table :headers="headers" :items="promotions" :loading="loading" class="elevation-1" :options.sync="pagination">
          <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
          <template slot="no-data"> {{ $t('g_text_noData') }} </template>
          <template slot="items" slot-scope="props">
            <td class="text-left text-no-wrap">{{ props.item.Username }}</td>
            <td class="text-left text-no-wrap">{{ props.item.Title }}</td>
            <td class="text-left text-no-wrap">
              <v-chip label color="primary" text-color="white"> <v-icon left>label</v-icon>{{ status[props.item.Status] }} </v-chip>
            </td>
            <td class="text-left text-no-wrap">{{ props.item.CreateTime | formatDate }}</td>
            <td class="text-left text-no-wrap">{{ props.item.UpdateTime | formatDate }}</td>
            <td class="text-left text-no-wrap">{{ props.item.CreateBy }}</td>
            <!-- <td class="text-left text-no-wrap"> -->
            <!-- <v-btn @click="updateApi(props.index)" class="x-small" small color="primary">审核</v-btn> -->
            <!-- </td> -->
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
import api from '@/api';
// import Editor from '@tinymce/tinymce-vue';
export default {
  name: 'Announcement',
  components: {
    // 'tinymce-editor': Editor,
  },
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
      status: ['已取消', '已申请', '待审核', '进行中', '已完成'],
      headers: [
        {
          text: '用户ID',
          value: 'UserId',
        },
        {
          text: '活动标题',
          sortable: false,
          value: 'Title',
        },
        {
          text: '审核状态',
          value: '',
        },
        {
          text: '参与时间',
          sortable: false,
          value: 'StartTime',
        },
        {
          text: '更新时间',
          value: 'Updated',
        },
        {
          text: '操作人',
          sortable: false,
          value: '',
        },
        // {
        //     text: '操作',
        //     sortable: false,
        //     value: ''
        // },
      ],
      radios: [],
      promotions: [],
      promotion: {},
      infoBox: false,
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
  },
  watch: {},
  mounted() {
    this.loadApis();
  },
  methods: {
    loadApis() {
      this.loading = true;
      api
        .get('/promotion/user/list')
        .then(data => {
          this.promotions = data.result;
          this.loading = false;
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    addApi() {
      this.APIS = {};
      this.infoBox = true;
    },
    updateApi(i) {
      this.API = this.APIS[i];
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
              $this.loadApis(1);
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
              $this.loadApis(1);
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
        let url = '/games/api';
        if ($this.API.Id > 0) {
          url += `/${$this.API.Id}`;
        }
        api
          .post(url, this.API)
          .then(data => {
            $this.$store.commit('MsgOk', this.$t('g_msgSaved'));
            $this.loadApis();
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
