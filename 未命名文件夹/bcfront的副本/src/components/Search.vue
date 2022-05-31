<template>
  <v-navigation-drawer v-model="showDrawer" width="600" right :clipped="$vuetify.breakpoint.mdAndUp" app class="lighten-3" temporary>
    <v-card>
      <v-toolbar>
        <v-icon>search</v-icon>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="cancel">
          <v-icon>cancel</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="pa-0">
        <slot></slot>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="green--text darken-1 x-small" small text outlined @click.native="cancel">{{ $t('g_btn_cancel') }}</v-btn>
        <v-btn class="x-small" color="primary" depressed @click.native="ok">
          <v-icon>search</v-icon>
          {{ $t('g_btn_search') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'SearchModal',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'Search',
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
    };
  },
  watch: {
    show(n, o) {
      if (n == true) {
        this.showDrawer = true;
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
      this.showDrawer = false;
    },
    cancel() {
      this.showDrawer = false;
      //    this.$emit('cancel');
    },
  },
};
</script>
