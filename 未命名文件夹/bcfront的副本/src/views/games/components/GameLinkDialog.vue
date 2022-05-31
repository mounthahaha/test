<template>
  <v-dialog :value="value" persistent width="600px" @input="closeDialog">
    <v-form ref="form" lazy-validation>
      <v-card class="rounded-lg">
        <v-toolbar dark elevation="0" color="primary">
          <v-toolbar-title class="headline ml-2"> 设定游戏键结 </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom left>
            <template #activator="{ on }">
              <v-btn icon v-on="on" @click.native="closeDialog"> <v-icon>close</v-icon> </v-btn>
            </template>
          </v-menu>
        </v-toolbar>
        <v-container grid-list-md class="py-5 px-10">
          <v-row wrap>
            <!-- 圖片 -->
            <v-col cols="3" class="d-flex align-center justify-center">
              <v-icon small color="red" class="mr-1">star</v-icon>
              <v-label>游戏平台</v-label>
            </v-col>
            <v-col cols="9">
              <v-select
                v-model="gameMenuPlatFormCurrentFormId"
                solo
                clearable
                hide-details
                single-line
                persistent-hint
                :items="gamePlatformSelectItems"
                label="游戏平台名称"
              >
              </v-select>
            </v-col>
          </v-row>
          <v-row wrap>
            <!-- 圖片 -->
            <v-col cols="3" class="d-flex align-center justify-center">
              <v-icon small color="red" class="mr-1">star</v-icon>
              <v-label>游戏名称</v-label>
            </v-col>
            <v-col cols="9">
              <v-select
                v-model="gameMenuID"
                solo
                clearable
                hide-details
                single-line
                persistent-hint
                :items="gameMenuPlatFormSelectItems"
                label="游戏名称"
              >
              </v-select>
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
import gameMenuPlatFormMixin from '../../../mixin/gameMenuPlatFormMixin.js';
// 圖片新增編輯彈窗
export default {
  name: 'GameLinkDialog',
  mixins: [gameMenuPlatFormMixin],
  props: {
    // 彈窗專用參數，用來和v-modal組合
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      gameMenuID: null,
    };
  },
  methods: {
    // 彈窗專用事件，用來和v-modal組合
    closeDialog() {
      return this.$emit('input', false);
    },
    editEvent() {
      this.closeDialog();
      this.$emit('editGameLinkID', this.gameMenuID);
    },
  },
};
</script>

<style></style>
