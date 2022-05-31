<template>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="timeout" elevation="0" min-width="100" top>
    <span class="ml-3"> {{ snackbar.text ? snackbar.text : $t('g_api_default_error') }}</span>
    <template #action="{ attrs }">
      <v-btn dense icon v-bind="attrs" @click="snackbar.show = false">
        <v-icon>close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  name: 'Snackbar',
  data() {
    return {
      timeout: 2000,
    };
  },
  computed: {
    snackbar() {
      return this.$store.getters.snackbar;
    },
  },
};
</script>
