<template>
  <v-dialog v-model="model" max-width="350" :retain-focus="false">
    <v-card>
      <v-card-title class="headline">{{ $t('player_detail_password_textfield_password') }}</v-card-title>
      <v-card-text>
        {{ $t('player_detail_password_textfield_password_hint') }}<span class="display-1 red--text lighten-2">{{ password }}</span>
        <v-btn v-clipboard:copy="password" v-clipboard:success="onCopy" v-clipboard:error="onError" text depressed color="primary">
          <v-icon>file_copy</v-icon> {{ $t('g_btn_copy') }}
        </v-btn>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text depressed @click="model = false"> {{ $t('g_btn_close') }} </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import api from '@/api';
import dialog from '../../components/mixins/dialog.js';
import Vue from 'vue';
import VueClipboard from 'vue-clipboard2';
Vue.use(VueClipboard);

export default {
  name: 'Password',
  mixins: [dialog],
  props: {
    password: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      s: '',
    };
  },
  methods: {
    onCopy(e) {
      this.$store.commit('MsgOk', `${this.$t('g_btn_copy')}[${e.text}]${this.$t('g_msgSuccess2')}`);
      this.model = false;
    },
    onError(e) {
      this.$store.commit('MsgError', this.$t('g_msgCopyFailed'));
    },
  },
};
</script>
