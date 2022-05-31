<template>
  <v-dialog :value="value" persistent width="800px" @input="closeDialog">
    <v-form ref="form" lazy-validation>
      <v-card class="rounded-lg">
        <v-toolbar dark elevation="0" color="primary">
          <v-toolbar-title class="headline ml-2">
            {{ startContentData.length === 0 ? '新增內文' : '编辑内文' }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom left>
            <template #activator="{ on }">
              <v-btn icon v-on="on" @click.native="closeDialog"> <v-icon>close</v-icon> </v-btn>
            </template>
          </v-menu>
        </v-toolbar>
        <v-container grid-list-md class="py-5 px-10">
          <template v-for="(contentText, index) in contentList">
            <v-row :key="index">
              <v-col cols="11">
                <v-text-field v-model="contentList[index]" type="text" :label="'内文'" :placeholder="'请输入内文'"> </v-text-field>
              </v-col>
              <v-col cols="1">
                <v-icon large color="red" class="mr-1" @click="removeEvent(index)">clear</v-icon>
              </v-col>
            </v-row>
          </template>
          <v-row>
            <v-col cols="11"></v-col>
            <v-col cols="1">
              <v-icon large color="green" class="mr-1" @click="addEvent">add</v-icon>
            </v-col>
          </v-row>
        </v-container>
        <v-divider></v-divider>
        <v-card-actions class="pa-5">
          <v-spacer></v-spacer>
          <v-btn color="secondary" depressed @click="editEvent"> {{ $t('g_btn_confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
// 內文新增編輯彈窗
export default {
  name: 'ContentDialog',
  props: {
    // 彈窗專用參數，用來和v-modal組合
    value: {
      type: Boolean,
      default: false,
    },
    startContentData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      contentList: [],
    };
  },
  computed: {
    // 上傳圖片必須的參數
    uploadHeader() {
      return {
        Authorization: `token ${this.$store.getters.token}`,
      };
    },
  },
  watch: {
    value(newValue, oldValue) {
      // 彈窗打開時，把圖片的資料更新，新增圖片時，自動寫入pictureKey
      if (newValue) {
        this.contentList = this.startContentData;
      }
    },
  },
  methods: {
    // 彈窗專用事件，用來和v-modal組合
    closeDialog() {
      return this.$emit('input', false);
    },
    editEvent() {
      this.closeDialog();
      this.$emit('editContent', this.contentList);
    },
    removeEvent(removeIndex) {
      this.contentList = [...this.contentList].filter((_, index) => index !== removeIndex);
    },
    addEvent() {
      this.contentList = [...this.contentList, ''];
    },
  },
};
</script>

<style></style>
