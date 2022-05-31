<template>
  <v-dialog v-model="model" persistent width="800px" :retain-focus="false">
    <v-toolbar dark color="primary">
      <v-toolbar-title class="headline">{{ $t('system_domain_insert') }}{{ $t('system_domain_domain') }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click.native="closeDialog"> <v-icon>close</v-icon> </v-btn>
    </v-toolbar>

    <v-form ref="form" v-model="valid" lazy-validation>
      <v-card elevation="2" class="pa-5" :loading="fetchLoading" tile>
        <v-card-text v-if="!fetchLoading">
          <v-row dense>
            <v-col class="text-right" cols="2">
              <div class="pt-2">
                <strong>{{ $t('system_domain_domain') }}：</strong>
              </div>
            </v-col>
            <v-col cols="9">
              <div class="d-flex flex-row">
                <strong class="mt-2 mr-2">http://</strong>
                <v-text-field
                  ref="domain"
                  v-model="inputPost.domain"
                  type="text"
                  :label="$t('system_domain_domain')"
                  :rules="[rules.required]"
                  error
                  solo
                  dense
                >
                </v-text-field>
                <strong class="mt-2 error--text">*{{ $t('g_text_required') }}</strong>
              </div>
            </v-col>
            <v-col class="text-right" cols="2">
              <div class="pt-2">
                <strong>{{ $t('system_domain_column_remarks') }}：</strong>
              </div>
            </v-col>
            <v-col cols="9">
              <v-text-field v-model="inputPost.note" type="text" :label="$t('system_domain_column_remarks')" error solo dense> </v-text-field>
            </v-col>
            <v-col class="text-right" cols="2">
              <div class="pt-2">
                <strong>{{ note2Label }}：</strong>
              </div>
            </v-col>
            <v-col cols="9">
              <v-text-field v-model="inputPost.note2" type="text" :label="note2Label" error solo dense> </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <v-card tile>
        <v-divider></v-divider>
        <v-card-actions class="pa-5">
          <v-spacer></v-spacer>
          <v-btn text outlined color="primary" :loading="loading" @click="closeDialog">
            {{ !disabled ? $t('g_btn_cancel') : $t('g_btn_exit') }}
          </v-btn>
          <v-btn color="primary" depressed :loading="loading" @click="submit">{{ $t('g_btn_confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import api from '@/api';
import { POST_SYSTEM_URL } from '@/api/Uri';
import dialog from '@/components/mixins/dialog.js';
export default {
  name: 'PromotionsDialog',
  mixins: [dialog],
  props: {
    currentType: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      fetchLoading: false,
      inputPost: {},
    };
  },
  computed: {
    note2Label() {
      return this.currentType == 2 ? `${this.$t('system_domain_column_remarks')}2` : this.$t('system_domain_route');
    },
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.inputPost = {
        domain: '',
        type: this.currentType,
        note: '',
        note2: '',
        status: 1,
      };
    },
    submit() {
      if (this.$refs.form.validate()) {
        this.$emit('submit', { ...this.inputPost });
      }
    },
  },
};
</script>
