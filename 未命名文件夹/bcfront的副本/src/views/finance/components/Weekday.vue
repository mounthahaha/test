<template>
  <v-dialog v-model="showDrawer" width="500" right persistent>
    <v-card class="rounded-lg">
      <v-toolbar dark elevation="0" color="primary">
        <v-icon class="mr-2">build</v-icon>
        <v-toolbar-title class="headline ml-2"> {{ title }} </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-menu bottom left>
          <template #activator="{ on }">
            <v-btn icon v-on="on" @click.native="showDrawer = false"> <v-icon>close</v-icon> </v-btn>
          </template>
        </v-menu>
      </v-toolbar>

      <!-- 插槽 -->
      <slot></slot>

      <v-divider></v-divider>
      <v-card-actions class="pa-5">
        <v-spacer></v-spacer>
        <v-btn text outlined color="primary" @click.native="showDrawer = false">{{ $t('g_btn_cancel') }}</v-btn>
        <v-btn :loading="loading" color="primary" @click.native="ok"> 完成 </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'WeekdayModal',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'Weekday',
    },
    // 确认按钮text
    okText: {
      type: String,
      default: '确认',
    },
    // 取消按钮text
    cancelText: {
      type: String,
      default: '取消',
    },
  },
  data() {
    return {
      showDrawer: false,
      loading: false,
    };
  },
  watch: {
    show(n, o) {
      if (n == true) {
        this.showDrawer = true;
      } else {
        this.showDrawer = false;
        this.loading = false;
      }
    },
    showDrawer(n, o) {
      if (n == false) {
        this.$emit('cancel');
      }
    },
  },
  mounted() {
    const $this = this;
    document.onkeyup = ev => {
      if (ev.keyCode == 13) {
        $this.$emit('ok');
        $this.showDrawer = false;
      }
    };
  },
  methods: {
    ok() {
      this.$emit('ok');
      this.loading = true;
      // this.showDrawer = false;
    },
    cancel() {
      this.showDrawer = false;
      //    this.$emit('cancel');
    },
  },
};
</script>
