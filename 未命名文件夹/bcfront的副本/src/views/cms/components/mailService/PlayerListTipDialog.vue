<template>
  <v-dialog v-model="model" width="550px">
    <v-toolbar dark color="primary">
      <v-toolbar-title class="headline mx-auto">{{ title }}</v-toolbar-title>
    </v-toolbar>
    <v-card tile :loading="fetchLoading">
      <v-card-text class="pa-8">
        <v-row>
          <v-col cols="12">
            <strong>{{ text }}</strong>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="d-flex justify-center">
        <v-btn color="primary" depressed @click.native="closeDialog">{{ $t('g_btn_confirm') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import api from '@/api';
import { GET_STATION_USERS } from '@/api/Uri';
import dialog from '@/components/mixins/dialog.js';

export default {
  name: 'PlayerListTipDialog',
  mixins: [dialog],
  data() {
    return {
      text: '',
    };
  },
  computed: {
    title() {
      return this.item?.title;
    },
  },
  watch: {
    model: {
      handler(val) {
        if (val) {
          this.init();
          this.getLog();
        }
      },
    },
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.text = '';
    },
    getLog() {
      this.fetchLoading = true;
      api.get(GET_STATION_USERS, { id: this.item.id, type: this.item.type }).then(data => {
        this.text = data.result.users.length > 0 ? data.result.users.join(',') : '無';
        this.fetchLoading = false;
      });
    },
  },
};
</script>
