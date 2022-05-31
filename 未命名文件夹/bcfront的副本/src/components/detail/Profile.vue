<template>
  <div class="Profile">
    <v-container fluid class="pa-0 ma-0">
      <!-- 按鈕 -->
      <v-card elevation="0" class="ma-0 pt-4" color="blue-grey lighten-5">
        <v-row dense wrap>
          <!--阻止帳戶 啟動帳戶 -->
          <v-flex shrink pa-1>
            <v-btn v-if="player.block_status == 0" class="mr-1" color="red" dark depressed @click="setStatus(player.id, 1)">
              <v-icon class="mr-2" small dark>lock</v-icon> <span>{{ $t('player_detail_profile_btnDisable') }}</span>
            </v-btn>
            <v-btn v-else class="mr-1" color="green" dark depressed @click="setStatus(player.id, 0)">
              <v-icon class="mr-2" small dark>lock_open</v-icon> <span>{{ $t('player_detail_profile_btnEnable') }}</span>
            </v-btn>
          </v-flex>
          <!-- 重設登入密碼 -->
          <v-flex shrink pa-1>
            <v-menu v-model="resetPW.show" :close-on-content-click="false" :nudge-width="300" right>
              <template #activator="{ on }">
                <v-btn class="mr-1" color="primary" dark depressed v-on="on">
                  <v-icon class="mr-2" small dark>loop</v-icon>
                  <span>{{ $t('player_detail_profile_btnResetPassword') }}</span>
                </v-btn>
              </template>
              <v-card>
                <v-list>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>{{ $t('player_detail_profile_modifyPassword') }}</v-list-item-title>
                      <v-list-item-subtitle>{{ $t('player_detail_profile_textfield_user') }}{{ player.name }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn class="primary--text" icon>
                        <v-icon>favorite</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
                <v-divider></v-divider>
                <v-card class="transparent">
                  <v-card-text class="py-0">
                    <v-layout wrap>
                      <v-flex md12>
                        <v-text-field
                          v-model="resetPW.password"
                          :label="$t('player_detail_profile_textfield_password')"
                          :placeholder="$t('player_detail_profile_textfield_newPassword')"
                          type="text"
                          append-outer-icon="sync"
                          @click:append-outer="refresh"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-card-text>
                </v-card>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text class="x-small" outlined @click="resetPW.show = false">{{ $t('g_btn_cancel') }}</v-btn>
                  <v-btn color="primary" depressed class="x-small" @click="resetPassword(player.id)">{{ $t('g_btn_save') }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
          </v-flex>
          <!-- 重設取款密碼 -->
          <v-flex shrink pa-1>
            <v-menu v-model="resetWPW.show" :close-on-content-click="false" :nudge-width="300" right>
              <template #activator="{ on }">
                <v-btn class="mr-1" color="primary" dark depressed v-on="on">
                  <v-icon class="mr-2" small dark>loop</v-icon>
                  <span>{{ $t('player_detail_profile_btnResetWithdrawPassword') }}</span>
                </v-btn>
              </template>
              <v-card>
                <v-list>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>{{ $t('player_detail_profile_modifyWithdrawPassword') }}</v-list-item-title>
                      <v-list-item-subtitle>{{ $t('player_detail_profile_textfield_user') }}{{ player.name }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn class="primary--text" icon>
                        <v-icon>favorite</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
                <v-divider></v-divider>
                <v-card class="transparent">
                  <v-card-text class="py-0">
                    <v-layout wrap>
                      <v-flex md12>
                        <v-text-field
                          v-model="resetWPW.password"
                          :label="$t('player_detail_profile_textfield_password')"
                          :placeholder="$t('player_detail_profile_textfield_newPassword')"
                          type="text"
                          append-outer-icon="sync"
                          @click:append-outer="refreshW"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-card-text>
                </v-card>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text class="x-small" outlined @click="resetWPW.show = false">{{ $t('g_btn_cancel') }}</v-btn>
                  <v-btn color="primary" depressed class="x-small" @click="resetWPassword(player.id)">{{ $t('g_btn_save') }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
          </v-flex>
          <!-- 設置玩家標籤 -->
          <v-flex shrink pa-1>
            <v-btn class="mr-1" color="primary" dark depressed @click="setTag.show = true">
              <v-icon class="mr-2" small dark>label</v-icon> <span>{{ $t('player_detail_profile_btnSetPlayerTags') }}</span>
            </v-btn>
          </v-flex>
          <!-- 玩家身份登陸 -->
          <v-flex v-if="!Number(config.hideLoginAs)" shrink pa-1>
            <v-btn class="mr-1" color="primary" depressed @click="loginAs(player.id)">
              <v-icon class="mr-2" small dark>login</v-icon> <span>{{ $t('player_detail_profile_btnLoginAsPlayer') }}</span>
            </v-btn>
          </v-flex>
          <!-- 调整代理属性 -->
          <v-flex shrink pa-1>
            <v-btn
              class="mr-1"
              color="primary"
              depressed
              @click="
                affiliateChange.affName = player.aff_name;
                affiliateChange.show = true;
              "
            >
              <v-icon class="mr-2" small dark>people</v-icon> <span>{{ $t('player_detail_profile_btnAffiliateChange') }}</span>
            </v-btn>
          </v-flex>
          <!-- 踢下线 -->
          <v-flex shrink pa-1>
            <v-btn v-if="player.online == 'yes'" class="mr-1" color="primary" depressed @click="logoutAs(player.id)">
              <v-icon class="mr-2" small dark>voice_over_off</v-icon> <span>{{ $t('player_detail_profile_btnKick') }}</span>
            </v-btn>
          </v-flex>

          <!-- 新取款新存款-->
          <Tools ref="tools" :user-id.sync="userId" :player.sync="player"></Tools>
          <!-- 新增示警用戶 -->
          <v-flex shrink pa-1>
            <template v-if="!!player.warning">
              <v-menu v-if="!player.warning.UserId" v-model="warningDialog.show" :close-on-content-click="false" :nudge-width="300" left>
                <template #activator="{ on }">
                  <v-btn class="mr-1" color="primary" depressed v-on="on">
                    <v-icon class="mr-2" small dark>person_add</v-icon> <span>{{ $t('player_detail_profile_btnAddWarningUserId') }}</span>
                  </v-btn>
                </template>
                <v-card>
                  <v-list>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title> {{ $t('player_detail_profile_btnAddWarningUserId') }} </v-list-item-title>
                        <v-list-item-subtitle>{{ player.name }}</v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-btn class="primary--text" icon>
                          <v-icon>favorite</v-icon>
                        </v-btn>
                      </v-list-item-action>
                    </v-list-item>
                  </v-list>
                  <v-divider></v-divider>
                  <v-form>
                    <v-card class="transparent">
                      <v-card-text class="py-0">
                        <v-layout wrap>
                          <v-flex md12>
                            <v-textarea v-model="warningDialog.remark" value="" hide-details :placeholder="$t('g_input_remark')"></v-textarea>
                          </v-flex>
                        </v-layout>
                      </v-card-text>
                    </v-card>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn text class="x-small" outlined @click="warningDialog = { show: false }">{{ $t('g_btn_cancel') }}</v-btn>
                      <v-btn color="primary" depressed class="x-small" @click="addWarning()">{{ $t('g_btn_save') }}</v-btn>
                    </v-card-actions>
                  </v-form>
                </v-card>
              </v-menu>
              <v-btn v-else class="mx-2" color="error" depressed @click="deleteWarning()">
                <v-icon small dark>settings</v-icon>
                <span>{{ $t('player_detail_profile_btnCancleWarningUserId') }}</span>
              </v-btn>
            </template>
            <!-- 刷新 -->
          </v-flex>
          <v-flex shrink pa-1>
            <v-btn class="mr-1 white--text" color="primary" depressed @click="loadBalance(player.id)">
              <v-icon class="mr-2" small dark>loop</v-icon> <span>{{ $t('player_detail_profile_btnRefreshWallet') }}</span>
            </v-btn>
          </v-flex>
          <!-- 轉回 -->
          <v-flex shrink pa-1>
            <v-btn class="mr-1 white--text" color="primary" depressed @click="returnAllBalance">
              <v-icon class="mr-2" small dark>undo</v-icon> <span>{{ $t('player_detail_profile_accountInfo_recall') }}</span>
            </v-btn>
          </v-flex>
          <!-- 餘額調整 -->
          <v-flex shrink pa-1>
            <v-btn class="mr-1 white--text" color="primary" depressed @click="reviseOpt.show = true">
              <v-icon class="mr-2" small dark>attach_money</v-icon> <span>{{ $t('player_detail_profile_accountInfo_adjust') }}</span>
            </v-btn>
          </v-flex>
          <!-- 参加体育活动 -->
          <v-flex v-if="Number(config.showTurnoverSetting)" shrink pa-1>
            <v-btn
              class="mr-1 white--text"
              :disabled="Number(player.join_activity) != 0"
              :color="Number(player.join_activity) ? 'red' : 'primary'"
              depressed
              @click="joinActivity(player.id)"
            >
              <v-icon class="mr-2" small dark>group_add</v-icon> <span>{{ $t('g_campaign') }}</span>
            </v-btn>
          </v-flex>
          <!-- 返水黑名单 -->
          <v-flex pa-1 v-if="isRebateBlack!==null">
            <el-button type="danger" v-if="isRebateBlack" style="padding:9px 20px" :loading="setRebateBlackLoading" class="mr-1" @click="setRebateBlackStatus(player.id)">
              <v-icon class="mr-2" small dark>lock</v-icon>移除返水黑名单
            </el-button>
            <el-button type="success" :loading="setRebateBlackLoading" style="padding:9px 20px" size="medium" v-else @click="setRebateBlackStatus(player.id)">
              <v-icon class="mr-2" small dark>lock_open</v-icon><span>添加返水黑名单</span>
            </el-button>
          </v-flex>
          <v-spacer></v-spacer>
          <!-- 展開 隱藏錢包 -->
          <v-col class="d-flex align-center justify-end">
            <v-btn color="primary" icon depressed fab dark small class="mx-5" @click="isExpand['wallet'] = !isExpand['wallet']">
              <v-icon>{{ isExpand['wallet'] ? `keyboard_arrow_up` : `keyboard_arrow_down` }}</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
      <!-- 錢包統計 -->
      <v-card v-if="!/^\{\}$/.test(JSON.stringify(balance))" elevation="0" class="ma-0 pt-3 rounded-lg" color="blue-grey lighten-5">
        <v-progress-linear v-show="loading" :indeterminate="loading"></v-progress-linear>
        <v-container v-if="isExpand['wallet']" fluid class="ma-0 pa-0">
          <!-- 代取款  總餘額  總入金 總出金-->
          <v-row dense>
            <template v-for="(item, i) in balance">
              <template v-if="i == -1">
                <v-col :key="i" cols="3">
                  <v-alert dense class="my-0" border="left" colored-border color="green">
                    <div class="d-flex align-center justify-space-between">
                      <span v-if="i != -1" class="ml-2">{{ item.name }}</span>
                      <span v-else class="ml-2">{{ $t('g_pending_withdrawals') }}</span>
                      <span class="font-weight-bold"> {{ item.balance | money }}</span>
                    </div>
                  </v-alert>
                </v-col>
              </template>
            </template>
            <v-col cols="3">
              <v-alert dense class="my-0" border="left" colored-border color="green">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <span class="mx-2">{{ $t('g_statics_totalBalance') }}</span>
                    <!-- 總餘額計算流程 -->
                    <v-tooltip bottom nudge-bottom="10" nudge-right="25">
                      <template #activator="{ on, attrs }">
                        <v-icon v-bind="attrs" small v-on="on">open_in_new</v-icon>
                      </template>
                      <div class="pa-1" style="width: 250px">
                        <v-row no-gutters>
                          <!-- 总入金 -->
                          <v-col cols="3"> {{ $t('g_statics_totalDeposits') }} </v-col>
                          <v-col class="text-right" offset="3" cols="6"> {{ player.deposit | money }} </v-col>
                          <!-- 总出金 -->
                          <v-col cols="3"> {{ $t('g_statics_totalWithdrawals') }} </v-col>
                          <v-col cols="3"> <v-icon dark class="mx-8">remove</v-icon> </v-col>
                          <v-col class="text-right" cols="6"> {{ player.withdrawal | money }} </v-col>

                          <!--小計-->
                          <v-col cols="12"><v-divider dark class="my-1"></v-divider></v-col>
                          <v-col class="text-right" offset="6" cols="6"> {{ (player.deposit - player.withdrawal) | money }} </v-col>

                          <!-- 总投注 -->
                          <v-col cols="3"> {{ $t('g_statics_totalBet') }} </v-col>
                          <v-col cols="3"> <v-icon dark class="mx-8">remove</v-icon> </v-col>
                          <v-col class="text-right" cols="6"> {{ gameTotals[0] | money }} </v-col>

                          <!--小計-->
                          <v-col cols="12"><v-divider dark class="my-1"></v-divider></v-col>
                          <v-col class="text-right" offset="6" cols="6">
                            {{ (player.deposit - player.withdrawal - Number(gameTotals[0] || 0)) | money }}
                          </v-col>

                          <!-- 总派彩 -->
                          <v-col cols="3"> {{ $t('g_statics_totalPayout') }} </v-col>
                          <v-col cols="3"> <v-icon dark class="mx-8">add</v-icon> </v-col>
                          <v-col class="text-right" cols="6"> {{ gameTotals[1] | money }} </v-col>

                          <!--小計-->
                          <v-col cols="12"><v-divider dark class="my-1"></v-divider></v-col>
                          <v-col class="text-right" offset="6" cols="6">
                            {{ (player.deposit - player.withdrawal - Number(gameTotals[0] || 0) + Number(gameTotals[1] || 0)) | money }}
                          </v-col>

                          <!-- 余额调整 -->
                          <v-col cols="3"> {{ $t('g_statics_totalUpdated') }} </v-col>
                          <v-col cols="3"> <v-icon dark class="mx-8">add</v-icon> </v-col>
                          <v-col class="text-right" cols="6"> {{ player.total_updated | money }} </v-col>

                          <!--小計-->
                          <v-col cols="12"><v-divider dark class="my-1"></v-divider></v-col>
                          <v-col class="text-right" offset="6" cols="6">
                            {{
                              (Number(player.deposit) -
                                Number(player.withdrawal) -
                                Number(gameTotals[0] || 0) +
                                Number(gameTotals[1] || 0) +
                                Number(player.total_updated))
                                | money
                            }}
                          </v-col>

                          <!-- 待取款 -->

                          <template v-if="balance[-1]">
                            <v-col cols="3"> {{ $t('g_pending_withdrawals') }} </v-col>
                            <v-col cols="3"> <v-icon dark class="mx-8">remove</v-icon> </v-col>
                            <v-col class="text-right" cols="6"> {{ balance[-1].balance | money }} </v-col>
                          </template>
                          <!-- 总余额 -->
                          <!--小計-->
                          <v-col cols="12"><v-divider dark class="my-1"></v-divider></v-col>
                          <v-col cols="3"> {{ $t('g_statics_totalBalance') }} </v-col>
                          <v-col class="text-right font-weight-bold" offset="3" cols="6">
                            {{
                              (Number(player.deposit) -
                                Number(player.withdrawal) -
                                Number(gameTotals[0] || 0) +
                                Number(gameTotals[1] || 0) +
                                Number(player.total_updated) -
                                (balance[-1] ? Number(balance[-1].balance) : 0))
                                | money
                            }}
                          </v-col>
                          <v-col cols="12"><v-divider dark class="my-1"></v-divider></v-col>
                        </v-row>
                      </div>
                    </v-tooltip>
                  </div>
                  <span class="font-weight-bold"> {{ allBalance() | money }}</span>
                </div>
              </v-alert>
            </v-col>
            <v-col cols="3">
              <v-alert dense class="my-0" border="left" colored-border color="green">
                <div class="d-flex align-center justify-space-between">
                  <span class="ml-2">{{ $t('g_statics_totalDeposits') }}</span>
                  <span class="font-weight-bold">{{ player.deposit | money }}</span>
                </div>
              </v-alert>
            </v-col>
            <v-col cols="3">
              <v-alert dense class="my-0" border="left" colored-border color="green">
                <div class="d-flex align-center justify-space-between">
                  <span class="ml-2">{{ $t('g_statics_totalWithdrawals') }}</span>
                  <span class="font-weight-bold"> {{ player.withdrawal | money }}</span>
                </div>
              </v-alert>
            </v-col>
          </v-row>
          <!-- 余额调整 總投注 總派彩 總結果 -->
          <v-row dense>
            <v-col cols="3">
              <v-alert dense class="my-0" border="left" colored-border color="blue">
                <div class="d-flex align-center justify-space-between">
                  <span class="ml-2">{{ $t('g_statics_totalUpdated') }}</span>
                  <span class="font-weight-bold"> {{ player.total_updated | money }}</span>
                </div>
              </v-alert>
            </v-col>
            <v-col cols="3">
              <v-alert dense class="my-0" border="left" colored-border color="blue">
                <div class="d-flex align-center justify-space-between">
                  <span class="ml-2">{{ $t('g_statics_totalBet') }}</span>
                  <span class="font-weight-bold">{{ (s2f(gameTotals[0]) ? s2f(gameTotals[0]) : 0) | money }}</span>
                </div>
              </v-alert>
            </v-col>
            <v-col cols="3">
              <v-alert dense class="my-0" border="left" colored-border color="blue">
                <div class="d-flex align-center justify-space-between">
                  <span class="ml-2">{{ $t('g_statics_totalPayout') }}</span>
                  <span class="font-weight-bold">{{ (s2f(gameTotals[1]) ? s2f(gameTotals[1]) : 0) | money }}</span>
                </div>
              </v-alert>
            </v-col>
            <v-col cols="3">
              <v-alert dense class="my-0" border="left" colored-border color="blue">
                <div class="d-flex align-center justify-space-between">
                  <span class="ml-2">{{ $t('g_statics_totalResult') }}</span>
                  <span class="font-weight-bold">{{ (s2f(gameTotals[2]) ? s2f(gameTotals[2]) : 0) | money }}</span>
                </div>
              </v-alert>
            </v-col>
          </v-row>
          <!-- 主錢包 Gamebus1遊戲錢包 Gamebus2遊戲錢包 盈虧比例=總結果/總存款  -->
          <v-row dense>
            <template v-for="(item, i) in balance">
              <template v-if="i != -1 && i != -2 && (i < 201 || i > 301)">
                <v-col :key="i" cols="3">
                  <v-alert dense class="my-0" border="left" colored-border color="primary">
                    <div class="d-flex align-center justify-space-between">
                      <span class="ml-2">{{ item.name }}</span>
                      <span class="font-weight-bold"> {{ item.balance | money }}</span>
                    </div>
                  </v-alert>
                </v-col>
              </template>
            </template>
            <v-col v-if="!isNaN(gameWallet)" cols="3">
              <v-alert dense class="my-0 mb-5" border="left" colored-border color="primary">
                <div class="d-flex align-center justify-space-between">
                  <!-- <span class="ml-2">{{ $t('g_text_gameWallet') }}</span> -->
                  <span class="ml-2">{{ gameWalletLabel }}</span>
                  <span class="font-weight-bold"> {{ gameWallet | money }}</span>
                </div>
              </v-alert>
            </v-col>
            <v-col cols="3">
              <v-alert dense class="my-0" border="left" colored-border color="primary">
                <div class="d-flex align-center justify-space-between">
                  <span class="ml-2">{{ $t('player_list_column_profitLossRatio') }}</span>
                  <!-- <span class="font-weight-bold"> {{ profitLossRatio }}%</span> -->
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <span class="font-weight-bold" v-html="ratioColor(player.profitLossRatio)"></span>
                </div>
              </v-alert>
            </v-col>
          </v-row>
        </v-container>

        <!-- 餘額調整視窗 -->
        <v-dialog v-model="reviseOpt.show" persistent width="500px">
          <v-card>
            <v-toolbar dark elevation="0" color="primary">
              <v-toolbar-title class="ml-2">{{ $t('player_detail_profile_accountInfo_adjustment') }}</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-menu bottom left>
                <template #activator="{ on }">
                  <v-btn icon v-on="on" @click.native="reviseOpt.show = false"> <v-icon>close</v-icon> </v-btn>
                </template>
              </v-menu>
            </v-toolbar>
            <v-divider></v-divider>
            <v-container grid-list-md class="py-5 px-10">
              <v-form model="reviseValid">
                <v-layout wrap>
                  <v-flex md12> <v-switch v-model="reviseOpt.front" :label="$t('g_text_frontShow')"></v-switch> </v-flex>
                  <v-flex md12>
                    <v-switch v-model="reviseOpt.affeff" :label="$t('player_detail_profile_accountInfo_affsEffective')"></v-switch>
                  </v-flex>
                  <v-flex md12>
                    <v-radio-group v-model="reviseOpt.direction" required row>
                      <v-radio :label="$t('g_increase')" value="1"></v-radio>
                      <v-radio :label="$t('g_decrease')" value="2"></v-radio>
                    </v-radio-group>
                  </v-flex>
                  <v-flex md12>
                    <v-text-field
                      ref="reviseOptAmount"
                      v-model.number="reviseOpt.amount"
                      :label="$t('g_quota')"
                      :rules="[v => (reviseOpt.direction == 2 && v <= allBalance()) || reviseOpt.direction != 2 || $t('g_msgQuotaError')]"
                      :placeholder="$t('g_msgQuota')"
                      outlined
                      type="number"
                    ></v-text-field>
                  </v-flex>
                  <v-flex md12>
                    <v-textarea v-model="reviseOpt.remark" value="" outlined hide-details :placeholder="$t('g_input_remark')"></v-textarea>
                  </v-flex>
                </v-layout>
                <v-card-actions class="pt-5">
                  <v-spacer></v-spacer>
                  <v-btn color="primary" outlined @click="reviseOpt.show = false">{{ $t('g_btn_cancel') }}</v-btn>
                  <v-btn color="primary" depressed @click="saveReviseData()">{{ $t('g_btn_save') }}</v-btn>
                </v-card-actions>
              </v-form>
            </v-container>
          </v-card>
        </v-dialog>
      </v-card>
      <!-- 註冊訊息 -->
      <v-card v-if="!/^\{\}$/.test(JSON.stringify(player))" elevation="1" class="mt-0 rounded-lg">
        <v-toolbar elevation="0" class="pl-2 rounded-lg">
          <v-icon class="mr-2">account_box</v-icon>
          <v-toolbar-title>{{ $t('player_detail_profile_registerInfo') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="primary" icon depressed fab dark small class="mx-5" @click="isExpand['regInfo'] = !isExpand['regInfo']">
            <v-icon>{{ isExpand['regInfo'] ? `keyboard_arrow_up` : `keyboard_arrow_down` }}</v-icon>
          </v-btn>
        </v-toolbar>
        <!-- 列表 -->
        <v-container v-if="isExpand.regInfo" fluid class="pa-0">
          <v-card elevation="0" class="pa-5 pt-0 rounded-lg">
            <v-row dense wrap class="ma-2">
              <v-col cols="2" class="mb-3"> {{ $t('player_detail_profile_textfield_username') }} </v-col>
              <v-col cols="4" class="title"> {{ player.name }} </v-col>
              <v-col cols="2" class="mb-3"> {{ $t('player_detail_profile_textfield_userRealName') }} </v-col>
              <v-col cols="4" class="title">
                <v-row>
                  <v-col :key="`mobile_${player.id}`" cols="4" class="d-flex align-center">
                    <span class="mr-2" :class="player.warningExist === 'true' ? 'warning' : ''">
                      {{ player.bname ? player.bname : $t('g_text_none') }}
                    </span>
                    <v-spacer></v-spacer>
                    <v-edit-dialog :return-value.sync="player.bname" lazy @save="updateUsername(player)">
                      <v-tooltip bottom>
                        <template #activator="{ on, attrs }">
                          <v-btn v-bind="attrs" color="primary" small icon v-on="on">
                            <v-icon>edit</v-icon>
                          </v-btn>
                        </template>
                        <span>{{ $t('g_btn_modify') }}</span>
                      </v-tooltip>
                      <v-text-field slot="input" v-model="player.bname" type="text" :label="$t('g_btn_carrageReturn')"></v-text-field>
                    </v-edit-dialog>
                  </v-col>
                </v-row>
              </v-col>
              <template v-if="!config.register_disable_mobile">
                <v-col cols="2" class="mb-3"> {{ $t('player_detail_profile_textfield_mobile') }} </v-col>
                <v-col cols="4" class="title">
                  <v-row>
                    <v-col :key="`mobile_${player.id}`" cols="4" class="d-flex align-center">
                      <span class="mr-2"> {{ limitInfo.mobile ? limitInfo.mobile : '-' }}</span>
                      <v-spacer></v-spacer>
                      <v-edit-dialog :return-value.sync="limitInfo.mobile" lazy @save="updateUserMobile(limitInfo)">
                        <template v-if="limitInfo.mobile != ''">
                          <v-tooltip bottom>
                            <template #activator="{ on, attrs }">
                              <v-btn v-bind="attrs" color="primary" small icon v-on="on">
                                <v-icon>edit</v-icon>
                              </v-btn>
                            </template>
                            <span>{{ $t('g_btn_modify') }}</span>
                          </v-tooltip>
                        </template>
                        <template v-else>
                          <v-tooltip bottom>
                            <template #activator="{ on, attrs }">
                              <v-btn v-bind="attrs" color="primary" small icon v-on="on">
                                <v-icon>add</v-icon>
                              </v-btn>
                            </template>
                            <span>{{ $t('g_btn_add') }}</span>
                          </v-tooltip>
                        </template>
                        <v-text-field slot="input" v-model="limitInfo.mobile" type="text" :label="$t('g_btn_carrageReturn')"></v-text-field>
                      </v-edit-dialog>
                    </v-col>
                  </v-row>
                </v-col>
              </template>
              <v-col cols="2" class="mb-3"> {{ $t('player_detail_profile_textfield_affiliateInfo') }} </v-col>
              <v-col cols="4" class="title">
                {{ player.refer_id }}/{{ player.aff_name }}/{{ player.aff_code }}
                <!-- <span class="agent-edit" @click="openAgentEdit">修改</span> -->
              </v-col>
              <v-col cols="2" class="mb-3"> {{ $t('player_detail_profile_textfield_registerDate') }} </v-col>
              <v-col cols="4" class="title"> {{ player.created | formatDate }} </v-col>
              <v-col cols="2" class="mb-3"> {{ $t('player_detail_profile_textfield_registerIP') }} </v-col>
              <v-col cols="4" class="title"> {{ player.regip }}( {{ player.ip }} ) </v-col>
              <v-col cols="2" class="mb-3"> {{ $t('player_detail_profile_textfield_playerTags') }} </v-col>
              <v-col cols="4" class="title">
                <v-chip
                  v-for="id in player.tagArr"
                  v-show="player.tags"
                  :key="id"
                  label
                  :color="tags[id] ? tags[id]['color'] : ''"
                  small
                  class="white--text mr-1"
                >
                  {{ tags[id] ? tags[id]['name'] : '' }}
                </v-chip>
              </v-col>
              <v-col cols="6" class="mb-2">
                <v-row>
                  <v-col cols="4"> {{ $t('player_detail_profile_textfield_ban') }} </v-col>
                  <v-col cols="2" lg="3" xl="2" class="d-flex align-center">
                    <v-checkbox
                      v-model="w_status"
                      class="ma-0 pa-0 d-inline-block white--text"
                      hide-details
                      :disabled="loading"
                      @click="setWithdrawStatus(Number(w_status))"
                    >
                    </v-checkbox>
                    <span>{{ $t('player_detail_profile_textfield_banWithdraw') }}</span>
                  </v-col>
                  <v-col cols="2" lg="3" xl="2" class="d-flex align-center">
                    <v-checkbox
                      v-model="d_status"
                      class="ma-0 pa-0 d-inline-block white--text"
                      hide-details
                      :disabled="loading"
                      @click="setDepositStatus(Number(d_status))"
                    ></v-checkbox>
                    <span>{{ $t('player_detail_profile_textfield_banDeposit') }}</span>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="2" class="mb-3"> {{ $t('player_detail_profile_textfield_lastIP') }} </v-col>
              <v-col cols="4" class="title"> {{ player.lastip }} </v-col>
              <v-col cols="2" class="mb-3"> {{ $t('player_detail_profile_textfield_lastTime') }} </v-col>
              <v-col cols="4" class="title"> {{ player.lastime | formatDate }} </v-col>
            </v-row>
          </v-card>
        </v-container>
      </v-card>
      <!-- VIP信息 -->
      <v-card elevation="1" class="mt-5 rounded-lg">
        <VipCards v-model="player.vip_lv" :user-id.sync="userId"></VipCards>
      </v-card>
      <!-- 身份信息 -->
      <v-card elevation="1" class="mt-5 rounded-lg">
        <IdCards :user-id.sync="userId" :cards.sync="player.cards"></IdCards>
      </v-card>
      <!-- 銀行信息 -->
      <v-card elevation="1" class="mt-5 rounded-lg">
        <Banks v-if="banks.length" :loading.sync="bankLoading" :user-id.sync="userId" :banks.sync="banks" @loadBanks="loadBanks"></Banks>
      </v-card>
      <!-- 常用IP -->
      <v-card elevation="1" class="mt-5 rounded-lg">
        <v-toolbar elevation="0" class="pl-2 rounded-lg">
          <v-icon class="mr-2">my_location</v-icon>
          <v-toolbar-title>{{ $t('player_detail_profile_accountInfo_regularIP') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <!-- <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                :outlined="!filterRegIp"
                v-bind="attrs"
                class="mr-2"
                color="primary"
                depressed
                fab
                dark
                small
                v-on="on"
                @click="filterRegIp = !filterRegIp"
              >
                <v-icon>filter_list</v-icon>
              </v-btn>
            </template>
            <span>不显示注册IP</span>
          </v-tooltip> -->
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                class="mr-2"
                color="primary"
                depressed
                fab
                dark
                small
                v-on="on"
                @click="
                  commonIpsSelected.join(',') != commonIps.map(item => item.ip).join(',')
                    ? (commonIpsSelected = commonIps.map(item => item.ip))
                    : (commonIpsSelected = [])
                "
              >
                <v-icon>check</v-icon>
              </v-btn>
            </template>
            <span>选取全部</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn v-bind="attrs" color="primary" depressed fab dark small v-on="on" @click="addBlackList(commonIpsSelectedComputed)">
                <v-icon>add</v-icon>
              </v-btn>
            </template>
            <span>选取加入黑名单</span>
          </v-tooltip>
          <v-btn color="primary" icon depressed fab dark small class="mx-5" @click="isExpand['commonIps'] = !isExpand['commonIps']">
            <v-icon>{{ isExpand['commonIps'] ? `keyboard_arrow_up` : `keyboard_arrow_down` }}</v-icon>
          </v-btn>
        </v-toolbar>
        <!-- 列表 -->
        <v-container v-if="isExpand.commonIps" fluid class="pa-0">
          <v-card elevation="0" class="pa-5 pt-0 rounded-lg">
            <v-row dense wrap class="ma-2">
              <template v-for="(item, index) in commonIps">
                <template v-if="!filterRegIp || item.ip !== player.regip">
                  <v-col :key="`cb_${index}`" cols="3" md="6" lg="4" xl="3" class="py-4">
                    <v-layout row wrap align-center align-content-center>
                      <v-flex style="max-width: 2em; flex-shrink: 1">
                        <v-checkbox
                          v-model="commonIpsSelected"
                          class="mt-0 d-inline-block"
                          :checked="commonIpsSelected.includes(item.ip)"
                          dense
                          hide-details
                          :value="item.ip"
                        >
                        </v-checkbox>
                      </v-flex>
                      <v-flex class="d-flex align-center">
                        <h4 class="primary--text">
                          <!-- eslint-disable-next-line vue/no-v-html -->
                          <span :class="item.warn ? 'warning black--text' : ''" v-html="item.ip"></span>
                          ( {{ item.ip_cn }} ) <span class="black--text">( {{ formatDate(item.created) }} )</span>
                        </h4>
                      </v-flex>
                    </v-layout>
                  </v-col>
                </template>
              </template>
            </v-row>
          </v-card>
        </v-container>
      </v-card>
      <!-- 相似IP -->
      <v-card elevation="1" class="mt-5 rounded-lg">
        <v-toolbar elevation="0" class="pl-2 rounded-lg">
          <v-icon class="mr-2">location_on</v-icon>
          <v-toolbar-title>{{ $t('player_detail_profile_accountInfo_similarIP') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-select
            v-model="similarFilter.includes"
            hide-details
            dense
            outlined
            class="mr-2"
            style="max-width: 300px"
            :items="[
              { value: true, text: $t('g_including') },
              { value: false, text: $t('g_excluding') },
            ]"
          ></v-select>
          <v-text-field v-model="similarFilter.text" hide-details dense outlined :label="$t('g_filter_text')" style="max-width: 300px" />
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                :outlined="!filterRegIp2"
                v-bind="attrs"
                class="mx-2"
                color="primary"
                depressed
                fab
                dark
                small
                v-on="on"
                @click="filterRegIp2 = !filterRegIp2"
              >
                <v-icon>filter_list</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('player_detail_profile_accountInfo_hideRegip') }}</span>
          </v-tooltip>
          <v-btn color="primary" icon depressed fab dark small class="mx-5" @click="isExpand['similarIps'] = !isExpand['similarIps']">
            <v-icon>{{ isExpand['similarIps'] ? `keyboard_arrow_up` : `keyboard_arrow_down` }}</v-icon>
          </v-btn>
        </v-toolbar>
        <!-- 列表 -->
        <v-container v-if="isExpand['similarIps']" fluid class="pa-0">
          <v-card elevation="0" class="pa-5 pt-0 rounded-lg">
            <v-row dense wrap class="ma-2">
              <template v-for="(item, i) in similarIpsArr">
                <template v-if="!filterRegIp2 || item.ip !== player.regip">
                  <v-col :key="`commonIps_${i}`" cols="3" md="6" lg="4" xl="3" class="py-2">
                    <v-flex class="d-flex align-center">
                      <h3>
                        (<span :class="item.warn ? 'warning' : ''"> {{ item.ip }} </span>) {{ item.name.replace(/\(.*\)/, '') }}
                      </h3>
                      <h4>
                        ( <a href="#" class="text-decoration-none" @click.prevent="$store.commit('PLAYER', item.id)"> {{ item.id }} </a> )
                      </h4>
                    </v-flex>
                  </v-col>
                </template>
              </template>
            </v-row>
          </v-card>
        </v-container>
      </v-card>
    </v-container>

    <v-col
      v-if="processing.balance || processing.player || processing.commonIps || processing.similarIps"
      cols="12"
      class="ma-5 d-flex align-content justify-center"
    >
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-col>

    <!-- 调整代理属性彈窗 -->
    <v-dialog v-model="affiliateChange.show" persistent width="500px">
      <v-card>
        <v-toolbar dark elevation="0" color="primary">
          <v-toolbar-title class="ml-2">{{ $t('player_detail_profile_btnAffiliateChange') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom left>
            <template #activator="{ on }">
              <v-btn icon v-on="on" @click.native="affiliateChange.show = false"> <v-icon>close</v-icon> </v-btn>
            </template>
          </v-menu>
        </v-toolbar>
        <v-card-text>
          <v-flex mt-5>
            <v-autocomplete
              ref="autocomplete"
              v-model="affiliateChange.affName"
              :rules="[() => affiliateChange.affName || $t('cms_email_recipient_required')]"
              :items.sync="agentList"
              outlined
              color="blue-grey lighten-2"
              :label="$t('affiliate_balanceHistory_affiliateName')"
              hide-details
              @update:search-input="autoWordToApi"
            >
              <template slot="selection" slot-scope="data">
                {{ data.item }}
              </template>
              <template slot="item" slot-scope="data"> {{ data.item }} </template>
              <template slot="no-data">
                <span class="pl-3">{{ $t('g_text_noData') }} － {{ $t('cms_email_recipient_no_data_tips') }}</span>
              </template>
            </v-autocomplete>
          </v-flex>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-5">
          <v-spacer></v-spacer>
          <v-btn color="primary" class="x-small" outlined @click="affiliateChange.show = false">{{ $t('g_btn_cancel') }}</v-btn>
          <v-btn color="primary" class="x-small" depressed @click="saveAgent()">{{ $t('g_btn_save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 設置玩家標籤彈窗 -->
    <v-dialog v-model="setTag.show" persistent width="600px">
      <v-card>
        <v-toolbar dark elevation="0" color="primary">
          <v-toolbar-title class="ml-2">{{ $t('player_detail_profile_btnSetPlayerTags') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom left>
            <template #activator="{ on }">
              <v-btn icon v-on="on" @click.native="setTag.show = false"> <v-icon>close</v-icon> </v-btn>
            </template>
          </v-menu>
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text class="pa-5">
          <v-row dense wrap>
            <v-col v-for="(r, index) in tags" :key="`tags_${index}`" cols="6">
              <v-checkbox v-model="setTag.ids" :label="r.name" color="primary" :value="index"></v-checkbox>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-5">
          <v-spacer></v-spacer>
          <v-btn color="primary" class="x-small" outlined @click="setTag.show = false">{{ $t('g_btn_cancel') }}</v-btn>
          <v-btn color="primary" class="x-small" depressed @click="setPlayerTag(player.id)">{{ $t('g_btn_save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
import Banks from './Banks';
import IdCards from './IdCards';
import Tools from './Tools';
import VipCards from './VipCards';
import { formatDate, ratioColor } from '@/filters/custom';
import { formatFloat } from '@/utils';
import _ from 'lodash'

export default {
  name: 'Profile',
  components: {
    IdCards,
    Tools,
    Banks,
    VipCards,
  },
  props: {
    userId: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      loading: false,
      player: {},
      banks: [],
      limitInfo: {},
      tags: {},
      resetPW: {
        show: false,
      },
      resetWPW: {
        show: false,
      },
      setTag: {
        ids: [],
        show: false,
      },
      reviseOpt: { front: true },
      warningDialog: { show: false, remark: null },
      balance: {},
      commonIps: [],
      similarIps: [],
      reviseValid: false,
      bankLoading: false,
      processing: {
        balance: true,
        player: true,
        commonIps: true,
        similarIps: true,
      },
      similarFilter: {
        includes: true,
        text: '',
      },
      existsWarning: false,
      commonIpsSelected: [],
      isExpand: {
        wallet: true,
        bank: true,
        commonIps: true,
        similarIps: true,
        regInfo: true,
      },
      affiliateChange: {
        show: false,
      },
      tempAutoSearch: '',
      isUpdating: false, // 搜尋代理loading
      agentList: [],
      gameTotals: [],
      gameWalletLabel: () => '',
      filterRegIp: false,
      filterRegIp2: false,
      isRebateBlack: null,
      setRebateBlackLoading: false
    };
  },
  computed: {
    config() {
      return this.$store.getters.config;
    },
    w_status: {
      get() {
        // console.log('w_status', !this.player.w_status);
        return this.player.w_status != 1;
      },
      set(val) {},
    },
    d_status: {
      get() {
        // console.log('d_status', !this.player.d_status);
        return this.player.d_status != 1;
      },
      set(val) {},
    },
    similarIpsArr() {
      const filter = this.similarFilter;
      return this.similarIps.filter(item => {
        return (
          (filter.includes && item.name.indexOf(filter.text) >= 0) || filter.text == '' || (!filter.includes && item.name.indexOf(filter.text) < 0)
        );
      });
    },
    commonIpsSelectedComputed() {
      return this.commonIpsSelected.map(ip => ip.replace(/127\.0\.0\.1,/, '')).filter(ip => /^\d+\.\d+\.\d+\.\d+$/.test(ip));
    },
    gameWallet() {
      let totalSum = 0;
      const wallet = _.find(this.balance, (item, i) => item.balance && i >= 201 && i <= 301);
      if (wallet) {
        totalSum = wallet.balance;
      }
      return Number(totalSum);
    },
    profitLossRatio() {
      return formatFloat((this.gameTotals[2] / this.player.deposit) * 100, 3);
    },
  },

  watch: {
    userId(n) {
      if (n > 0) {
        this.getTags();
        this.getPlayer(n);
        this.getRebateBlackStatus()
      }
    },
    banks(payload) {
      this.$emit('updateBanks', payload);
    },
    similarIpsArr(ips) {
      this.checkIpWarning(ips);
    },
    commonIps(ips) {
      this.checkIpWarning(ips);
    },
  },
  mounted() {
    if (this.userId > 0) {
      this.getTags();
      this.getPlayer(this.userId);
    }
    this.loadAgents();
    this.getRebateBlackStatus()
  },
  methods: {
    ratioColor,
    openAgentEdit() {
      this.$emit('openAgentEdit');
    },
    refresh() {
      const rand = Math.random();
      this.$set(this.resetPW, 'password', rand.toString().slice(-6));
    },
    refreshW() {
      const rand = Math.random();
      this.$set(this.resetWPW, 'password', rand.toString().slice(-6));
    },
    getRebateBlackStatus() {
      api
        .get('/cms/selectRebateBlacklist?user_id='+this.userId)
        .then(data => {
          this.isRebateBlack = data.res
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    setRebateBlackStatus() {
      const apiUrl = ['/cms/addRebateBlacklist','/cms/deleterebateBlacklist'][Number(this.isRebateBlack)]
      const params = {
        user_id: this.userId,
        user_name: this.player.name
      }
      this.setRebateBlackLoading = true
      api.get(apiUrl, params).then(res => {
        this.setRebateBlackLoading = false
        this.isRebateBlack = !this.isRebateBlack
        this.$store.commit('MsgOk', this.$t('g_msgSet'));
      })
      .catch(error => {
        this.setRebateBlackLoading = false
        this.$store.commit('MsgError', error.error);
      });
    },
    getPlayer(id) {
      this.commonIps = [];
      this.similarIps = [];
      api
        .get(`/player/${id}`)
        .then(data => {
          this.player = data.result;
          this.player.tagArr = this.player.tags.split(',');
          this.setTag.ids = this.player.tags.split(',');
          this.commonIps = _.orderBy(data.ips, ['created', 'ip'], ['desc', 'asc']);
          this.player.w_status = data.result.w_status;
          this.player.d_status = data.result.d_status;
          this.getPlayerLimit(this.userId);
          this.loadGames();
          this.showDetail();
          this.loadBanks();
          this.loadWarning();
          this.processing.player = false;
          this.processing.commonIps = false;
          this.$emit('updatePlayer', this.player);
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    loadBanks() {
      this.bankLoading = true;
      api
        .get(`/player/banks/${this.userId}`)
        .then(data => {
          this.banks = data.result == null ? [] : data.result;
          this.bankLoading = false;
        })
        .catch(error => {
          this.bankLoading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    getPlayerLimit() {
      api
        .get(`/player/limit/${this.userId}`)
        .then(data => {
          this.limitInfo = data.result;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    getTags() {
      api
        .get('/player/tagkv')
        .then(data => {
          this.tags = data;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    showDetail() {
      this.reviseOpt = {
        show: false,
      };
      this.resetPW = {
        show: false,
      };
      this.resetWPW = {
        show: false,
      };
      this.getSimilarIps(this.userId);
      this.loadBalance(this.userId);
      // this.getCardProfile(this.userId) //获取身份证
    },
    saveReviseData() {
      if (!this.$refs.reviseOptAmount.validate(true)) {
        this.$store.commit('MsgError', this.$t('g_msgQuotaError'));
        return false;
      }
      if (this.reviseOpt.direction == undefined) {
        this.$store.commit('MsgError', this.$t('player_detail_profile_accountInfo_adjustment_errorSelectIncrease'));
        return false;
      }
      if (this.reviseOpt.amount == undefined || this.reviseOpt.amount == 0) {
        this.$store.commit('MsgError', this.$t('player_detail_profile_accountInfo_adjustment_errorAmount'));
        return false;
      }
      if (this.reviseOpt.remark == undefined && this.reviseOpt.remark == '') {
        this.$store.commit('MsgError', this.$t('g_remark_error'));
        return false;
      }
      this.reviseOpt.show = false;
      const postData = _.cloneDeep(this.reviseOpt);
      delete postData.show;
      postData.isFrontShow = postData.front ? 1 : 2;
      delete postData.front;
      this.$store.commit('Confirm', {
        text: this.$t('g_msgBalanceAdjust'),
        ok: () => {
          api
            .post(`/player/balance/${this.userId}`, postData)
            .then(data => {
              this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
              this.reviseOpt = { front: true };
              this.loadBalance(this.userId);
            })
            .catch(error => {
              this.$store.commit('MsgError', error.error);
            });
        },
        cancel: () => {
          this.reviseOpt.show = true;
        },
      });
    },
    allBalance() {
      const allBalance = this.balance;
      let total = 0;
      for (const v in allBalance) {
        if (v > -1 && (v < 201 || v > 301)) {
          total += parseFloat(allBalance[v].balance);
        }
      }
      return total + this.gameWallet;
    },
    loadBalance(id) {
      this.loading = true;
      api
        .get(`/player/balance/${id}`)
        .then(data => {
          const balance = {};
          for (const i in data.result) {
            balance[i] = {
              name: data.map[i],
              balance: data.result[i],
            };
          }
          this.gameWalletLabel = data.map[-2];
          this.balance = balance;
          this.loading = false;
          this.processing.balance = false;
          if (data.error !== '') {
            this.$store.commit('MsgError', data.error);
          }
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    getSimilarIps(id) {
      api
        .get(`/player/ips/${id}`)
        .then(data => {
          this.similarIps = _.orderBy(data.result, ['name'], ['asc']);
          this.similarIps.map(item => {
            item.ip = item.name.replace(/^.*\((.*)\).*$/, '$1');
            item.warn = false;
            return item;
          });
          this.processing.similarIps = false;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    setStatus(id, status) {
      api
        .post(`/player/status/${id}/${status}`)
        .then(data => {
          this.player.block_status = status;
          this.$store.commit('MsgOk', this.$t('g_msgSet'));
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    setWithdrawStatus(status) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      api
        .put(`/player/withdrawstatus/${this.player.id}?status=${status}`)
        .then(data => {
          this.player.w_status = status;
          this.$store.commit('MsgOk', this.$t('g_msgSet'));
          this.loading = false;
        })
        .catch(error => {
          this.player.w_status = Number(!status);
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    setDepositStatus(status) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      api
        .put(`/player/depositstatus/${this.player.id}?status=${status}`)
        .then(data => {
          this.player.d_status = status;
          this.$store.commit('MsgOk', this.$t('g_msgSet'));
          this.loading = false;
        })
        .catch(error => {
          this.player.d_status = Number(!status);
          this.loading = false;
          this.$store.commit('MsgError', error.error);
        });
    },
    updateUsername(player) {
      let { bname } = player;
      bname = bname.replace(/\s+/g, '');
      const $this = this;
      $this.$store.commit('Confirm', {
        text: `${this.$t('player_detail_profile_msgUpdateUsername')}(${bname})？`,
        ok: () => {
          api
            .put(`/player/profile/${player.id}`, {
              name: bname,
            })
            .then(data => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              player.bname = bname;
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    updateUserMobile(player) {
      const $this = this;
      player.id = $this.player.id;
      $this.$store.commit('Confirm', {
        text: `${this.$t('player_detail_profile_msgUpdateMobile')}(${player.mobile})？`,
        ok: () => {
          api
            .put(`/player/profile/${player.id}`, {
              mobile: player.mobile,
            })
            .then(data => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    setPlayerTag(id) {
      const $this = this;

      const ids = $this.setTag.ids.filter(n => n);
      api
        .post(`/player/tag/${id}`, { Ids: ids })
        .then(data => {
          $this.player.tagArr = $this.setTag.ids;
          $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
          $this.setTag.show = false;
        })
        .catch(error => {
          $this.$store.commit('MsgError', error.error);
        });
    },
    loginAs(id) {
      api
        .get(`/player/login/${id}`)
        .then(data => {
          window.open(data.result);
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    logoutAs(id) {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: `${this.$t('player_detail_profile_msgKick')}(${$this.player.name})${this.$t('player_detail_profile_msgKick2')}`,
        ok: () => {
          api
            .get(`/player/logout/${id}`)
            .then(data => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    resetPassword(id) {
      const $this = this;
      if ($this.resetPW.password == undefined || $this.resetPW.password.length < 6 || $this.resetPW.password.length > 16) {
        $this.$store.commit('MsgError', this.$t('player_detail_profile_msgNewPassword'));
        return false;
      }
      $this.resetPW.show = false;
      $this.$store.commit('Confirm', {
        text: `${this.$t('player_detail_profile_msgConfirmNewPassword')}${$this.player.name}${this.$t(
          'player_detail_profile_msgConfirmNewPassword2',
        )}`,
        ok: () => {
          api
            .post(`/player/password/${id}`, {
              password: $this.resetPW.password,
            })
            .then(data => {
              $this.$emit('showPassword', data.result);
              $this.s = data.result;
              $this.resetPW.password = '';
              $this.resetPW.show = false;
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
        cancel: () => {
          $this.resetPW.password = '';
        },
      });
    },
    resetWPassword(id) {
      const $this = this;
      if ($this.resetWPW.password == undefined || $this.resetWPW.password.length < 6 || $this.resetWPW.password.length > 16) {
        $this.$store.commit('MsgError', this.$t('player_detail_profile_msgNewPassword'));
        return false;
      }
      $this.resetWPW.show = false;
      $this.$store.commit('Confirm', {
        text: `${this.$t('player_detail_profile_msgConfirmNewWithdrawPassword')} ${$this.player.name} ${this.$t(
          'player_detail_profile_msgConfirmNewWithdrawPassword2',
        )}`,
        ok: () => {
          api
            .post(`/player/wpassword/${id}`, {
              password: $this.resetWPW.password,
            })
            .then(data => {
              $this.$emit('showPassword', data.result);
              $this.s = data.result;
              $this.resetWPW.password = '';
              $this.resetWPW.show = false;
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
        cancel: () => {
          $this.resetWPW.password = '';
        },
      });
    },
    returnAllBalance() {
      const $this = this;
      $this.$store.commit('Confirm', {
        text: this.$t('player_detail_profile_msgConfirmReturnAll'),
        ok: () => {
          api
            .post(`/player/balance/transfer/${$this.userId}`)
            .then(data => {
              $this.$store.commit('MsgOk', $this.$t('g_msgSuccess'));
              $this.loadBalance($this.userId);
            })
            .catch(error => {
              $this.$store.commit('MsgError', error.error);
            });
        },
      });
    },
    loadWarning() {
      api
        .get(`/system/warning/${this.userId}`)
        .then(data => {
          this.player.warning = data.result;
          this.$forceUpdate();
          // console.log(this.player.warning);
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
        });
    },
    addWarning() {
      const { lastip } = this.player;
      // const ip = this.commonIps
      //   .map(item => item.ip)
      //   .filter(item => /\d+\.\d+\.\d+\.\d+/gi.test(item))
      //   .join(',');

      // PF-2536:[1129] 示警用户名单IP栏位显示IP、地区与时间: 前端
      const ip = this.commonIps.map(item => `${item.ip}(${item.ip_cn})(${formatDate(item.created)})`).join(',');
      // console.log(ip);

      const warning = {
        note: `玩家详情一键新增: ${this.warningDialog.remark}`,
        ip,
        userid: this.userId,
        Name: this.player.name,
        Username: this.player.bname,
        Mobile: this.player.mobile,
        card: this.banks ? this.banks.map(item => item.Card).join(',') : '',
      };
      api
        .post(`/system/warning`, warning)
        .then(data => {
          this.loadWarning();
          this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    deleteWarning() {
      api
        .delete(`/system/warning/delete/0?userid=${this.userId}`)
        .then(data => {
          this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
          this.warningDialog = { show: false };
          this.loadWarning();
        })
        .catch(error => {
          console.log(error);
          this.$store.commit('MsgError', error.error);
        });
    },
    formatDate,
    addBlackList(ips) {
      const data = [];
      ips.forEach((ip, i) => {
        data.push({
          ip,
          platform: '前台,后台',
          comment: '由玩家详情加入',
        });
      });
      api
        .post('/system/black/ip/bulkadd', { data })
        .then(result => {
          // console.log(result);
          this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        })
        .finally(() => {});
    },
    loadAgents() {
      if (this.isUpdating) {
        return;
      }
      this.isUpdating = true;
      api
        .get('/affiliate/listall')
        .then(data => {
          this.agentList = data.result == null ? [] : data.result.map(item => item.name);
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        })
        .finally(() => {
          this.isUpdating = false;
        });
    },
    // 代理用戶 搜尋 3個字以上才開始查找 tempAutoSearch 避免重複查找
    autoWordToApi(keyIn) {
      if (keyIn && keyIn.length > 2 && keyIn !== this.tempAutoSearch) {
        this.tempAutoSearch = keyIn;
        this.loadAgents(keyIn);
      }
    },
    saveAgent() {
      const { affName } = this.affiliateChange;
      api
        .post(`player/changeaff/${this.userId}`, { affName })
        .then(data => {
          this.$store.commit('MsgOk', this.$t('g_msgSet'));
          this.player.aff_name = this.affiliateChange.affName;
          this.affiliateChange.show = false;
          this.getPlayer(this.userId);
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        })
        .finally(() => {
          this.isUpdating = false;
        });
    },
    loadGames() {
      api
        .get(`/player/games/${this.userId}`)
        .then(data => {
          this.gameTotals = data.trade_total == null ? [] : data.trade_total;
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    s2f(s) {
      if (s) {
        return Number(s).toFixed(2);
      }
      return 0.0;
    },
    checkIpWarning(original) {
      const ips = original.map(item => _.last(item.ip.split(',')));
      api
        .post('/system/warning/ips', ips)
        .then(data => {
          data.ips.forEach(ip => {
            const found = original.filter(item => item.ip == ip);
            if (found) {
              found.forEach(item => (item.warn = true));
              this.$forceUpdate();
            }
          });
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    joinActivity(id) {
      console.log(id);
      this.$store.commit('Confirm', {
        text: '是否确认参加活动，确认后无法取消参加',
        ok: () => {
          api
            .get(`/player/joinActivity/${id}`)
            .then(result => {
              this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
              this.player.join_activity = 1;
            })
            .catch(e => {
              this.$store.commit('MsgError', e.error);
            })
            .finally(() => {
              this.loading = false;
            });
        },
        cancel: () => {},
      });
    },
  },
};
</script>
