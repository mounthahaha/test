<template>
  <v-dialog v-model="dialog.show" persistent max-width="350px">
    <v-card>
      <v-card-title class="headline"> <v-icon>notification_important</v-icon> {{ $t('g_dialog_confirm_tipsInfo') }} </v-card-title>
      <v-card-text>{{ dialog.text ? dialog.text : $t('g_msg_sureDo') }}</v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="green--text darken-1 x-small" small text outlined @click.native="cancel">{{ $t('g_btn_cancel') }}</v-btn>
        <v-btn class="x-small" color="primary" depressed @click.native="ok">{{ dialog.okTxt ? dialog.okTxt : $t('g_btn_confirm') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'MyDialog',
  data() {
    return {
      timeout: 3000,
    };
  },
  computed: {
    dialog() {
      return this.$store.getters.dialog;
    },
  },
  watch: {
    'dialog.show'(n, o) {
      if (n == false) {
        this.dialog.okFn = false;
        this.dialog.cancelFn = false;
      }
    },
  },
  methods: {
    ok() {
      if (this.dialog.okFn) {
        this.dialog.okFn();
      }
      this.dialog.show = false;
    },
    cancel() {
      if (this.dialog.cancelFn) {
        this.dialog.cancelFn();
      }
      this.dialog.show = false;
    },
  },
};
</script>
<style>
.v-dialog--active {
  z-index: 9999 !important;
}
</style>
