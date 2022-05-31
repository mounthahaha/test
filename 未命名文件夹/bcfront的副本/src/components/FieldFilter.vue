<template>
  <v-menu :close-on-content-click="false" :nudge-bottom="50">
    <template #activator="{ on }">
      <v-btn class="mr-1" color="primary" depressed v-on="on">
        <v-icon class="mr-2">remove_red_eye</v-icon> <span>{{ $t('g_btn_fields') }}</span>
      </v-btn>
    </template>
    <div style="max-height: 100vh" :style="`--primary:${$vuetify.theme.themes.light.primary}; `">
      <v-card elevation="0" class="pa-2 pb-3" style="min-width: 350px">
        <!-- <v-card-title>
          <v-icon class="mr-3">remove_red_eye</v-icon> <span>{{ $t('g_btn_fields') }}</span>
          <v-spacer />
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn color="primary" depressed v-bind="attrs" @click="items = headerMap" v-on="on">
                <v-icon small dark>refresh</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('g_btn_search') }}</span>
          </v-tooltip>
        </v-card-title> -->
        <v-card-text>
          <draggable v-model="items">
            <div v-for="(field, index) in items" :key="index" class="field">
              <v-row align-center dense class="ma-0 mr-2 align-center">
                <v-col cols="10">{{ index + 1 }}. {{ $t(field.lang) }} </v-col>
                <v-col cols="1">
                  <v-tooltip v-if="field.canHide" bottom>
                    <template #activator="{ on, attrs }">
                      <v-checkbox v-model="field.show" class="mt-0 pt-0" hide-details v-bind="attrs" @change="setItems(items)" v-on="on"></v-checkbox>
                    </template>
                    <span>{{ $t('g_btn_search') }}</span>
                  </v-tooltip>
                </v-col>
                <v-col cols="1">
                  <v-icon class="d-inline-block" middle color="primary">swap_vert</v-icon>
                </v-col>
              </v-row>
              <v-divider class="primary"></v-divider>
            </div>
          </draggable>
        </v-card-text>
      </v-card>
    </div>
    <!-- <div :style="`--primary:${$vuetify.theme.themes.light.primary};`"></div> -->
  </v-menu>
</template>

<script>
import draggable from 'vuedraggable';
import _ from 'lodash';
export default {
  name: 'FieldFilter',
  components: {
    draggable,
  },
  props: {
    // Take start and end as the input. Passable via v-model.
    headerMap: {
      type: Array,
      default: () => [],
    },
    storageTag: {
      type: String,
      default: () => '__filterDefault__',
    },
  },
  data() {
    return {
      gitCommitHash: process.env.VUE_APP_GIT_COMMITHASH,
    };
  },
  computed: {
    localStorageTag() {
      return `__field_filter_${this.storageTag}(${this.gitCommitHash})__`;
    },
    items: {
      get() {
        return this.headerMap;
      },
      set(items) {
        this.setItems(items);
      },
    },
    localStorageItems() {
      let storeSettings = [];
      try {
        storeSettings = JSON.parse(localStorage.getItem(this.localStorageTag) ?? '[]');
      } catch (e) {
        console.log(e);
      }
      return storeSettings;
    },
  },
  watch: {
    localStorageItems(items) {
      if (this.localStorageItems.length) {
        this.$emit('updateInfo', items);
      }
    },
  },
  created() {
    if (this.localStorageItems.length) {
      this.$emit('updateInfo', this.localStorageItems);
    }
  },
  methods: {
    setItems(items) {
      localStorage.setItem(this.localStorageTag, JSON.stringify(items));
      this.$emit('updateInfo', items);
    },
  },
};
</script>
<style lang="scss" scoped>
// .field-filter {
//   .field {
//     // box-shadow: 0 0 0 1px var(--primary) inset;
//     & + .field {
//       border-top: 1px solid var(--primary);
//     }
//   }
// }
// .sortable-chosen {
//   .row:first-child {
//     // background: #fff;
//     // filter: invert(1);
//     color: #fff;
//     background-color: var(--primary);
//     .v-icon {
//       color: #fff !important;
//       caret-color: #fff !important;
//     }
//   }
// }
</style>
