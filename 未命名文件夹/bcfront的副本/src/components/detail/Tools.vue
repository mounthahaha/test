<template>
  <div class="Tools d-flex align-center">
    <v-flex shrink pa-1>
      <v-btn class="mr-1" color="primary" depressed @click="withdrawal = true">
        <v-icon class="mr-2" small dark>add_circle_outline</v-icon>{{ $t('player_detail_tool_newWithdraw') }}
      </v-btn>
    </v-flex>
    <v-flex shrink pa-1>
      <v-btn class="mr-1" color="primary" depressed @click="deposit = true">
        <v-icon class="mr-2" small dark>add_circle_outline</v-icon>{{ $t('player_detail_tool_newDeposit') }}
      </v-btn>
    </v-flex>

    <!-- 新取款彈窗  -->
    <v-dialog v-model="withdrawal" persistent width="500px">
      <v-card>
        <v-form ref="wform" v-model="valid" lazy-validation>
          <v-toolbar dark color="primary">
            <v-toolbar-title class="headline">{{ $t('player_detail_tool_newWithdraw') }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click.native="withdrawal = false">
                  <v-icon>close</v-icon>
                </v-btn>
              </template>
            </v-menu>
          </v-toolbar>
          <v-card-text>
            <v-container grid-list-md pa-2>
              <v-layout wrap>
                <v-flex xs12>
                  <v-select
                    v-model="bank.BankId"
                    hide-details
                    :items="player.banks ? player.banks.filter(item => item.Deleted == false) : []"
                    item-value="Id"
                    :label="$t('player_detail_tool_bank')"
                    persistent-hint
                  >
                    <template #selection="{ item }">{{ `${item.Bank} ${item.Card}` }}</template>
                    <template #item="{ item }">{{ `${item.Bank} ${item.Card}` }}</template>
                  </v-select>
                </v-flex>                
                <v-flex xs12>
                  <v-text-field
                    v-model.number="bank.Amount"
                    @input="handleAmountChange"
                    type="number"
                    hide-details
                    :label="$t('g_amount')"
                    :rules="[v => !!v || $t('player_detail_tool_withdrawAmount')]"
                  >
                  </v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field v-model="bank.Remark" type="text" hide-details :label="$t('g_table_column_remarks')"> </v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" depressed :disabled="!valid" @click="doWithdrawal()"> {{ $t('g_btn_confirm') }}</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- 新存款彈窗  -->
    <v-dialog v-model="deposit" persistent width="500px">
      <v-card>
        <v-form ref="dform" v-model="valid" lazy-validation>
          <v-toolbar dark color="primary">
            <v-toolbar-title class="headline">{{ $t('player_detail_tool_newDeposit') }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template #activator="{ on }">
                <v-btn icon v-on="on" @click.native="deposit = false">
                  <v-icon>close</v-icon>
                </v-btn>
              </template>
            </v-menu>
          </v-toolbar>
          <v-card-text>
            <v-container grid-list-md pa-2>
              <v-layout wrap>
                <v-flex xs12>
                  <v-select
                    v-model="depositInfo.Aid"
                    :items="accounts"
                    item-text="name"
                    item-value="value"
                    :label="$t('player_detail_tool_pay')"
                    single-line
                  ></v-select>
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    v-model.number="depositInfo.Amount"                    
                    type="number"
                    hide-details
                    :label="$t('g_amount')"
                    :rules="[v => !!v || $t('player_detail_tool_depositAmount')]"
                  >
                  </v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field v-model="depositInfo.Remark" type="text" hide-details :label="$t('g_table_column_remarks')"> </v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" depressed :disabled="!valid" @click="doDeposit()"> {{ $t('g_btn_confirm') }}</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import api from '@/api';
export default {
  name: 'Tools',
  props: {
    userId: {
      type: Number,
      default: 0,
    },
    player: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      withdrawal: false,
      valid: false,
      bank: {},
      deposit: false,
      depositInfo: {},
      accounts: [],
      banksMap: {}
    };
  },
  watch: {    
    userId(n) {
      if (n > 0) {
        this.loadPaymentAccount();
      }
    },
  },
  mounted() {  
    if (this.userId > 0) {
      this.loadPaymentAccount();
    }
  },
  methods: {
    handleAmountChange(value) {
      // debugger
      if ( !Array.isArray( this.player.banks) || !this.bank.BankId ) {
        return
      }
      if ( value ) {
        const _arr = value.split('.');
        if (_arr[1] && _arr[1].length > 2 ) {
          const _v = `${_arr[0]}.${_arr[1].substr(0,2)}`
          const _bank = this.player.banks.find(ele=>ele.Id === this.bank.BankId)
          if ( _bank && _bank.Bank === 'USDT' ) {
            setTimeout(() => {
              this.bank.Amount = _v;
            }, 0)              
          }         
        }
      }           
    },
    doWithdrawal() {
      if (this.$refs.wform.validate()) {
        this.$store.commit('Confirm', {
          text: this.$t('player_detail_tool_msgConfirmWithdraw'),
          ok: () => {
            api
              .post(`/player/withdrawal/${this.userId}`, this.bank)
              .then(data => {
                this.$store.commit('MsgOk', this.$t('player_detail_tool_msgSuccessWithdraw'));
                this.withdrawal = false;
                this.bank = {};
              })
              .catch(error => {
                this.bank = {};
                this.$store.commit('MsgError', error.error);
              });
          },
        });
      }
    },
    loadPaymentAccount() {
      api
        .get('/system/payment/account?u=0')
        .then(data => {
          this.accounts = data.result.map(({ accountId, accountName }) => ({ name: accountName, value: accountId }));
        })
        .catch(error => {
          this.$store.commit('MsgError', error.error);
        });
    },
    doDeposit() {
      if (this.$refs.dform.validate()) {
        this.$store.commit('Confirm', {
          text: this.$t('player_detail_tool_msgConfirmDeposit'),
          ok: () => {
            api
              .post(`/player/deposit/${this.userId}`, this.depositInfo)
              .then(data => {
                this.$store.commit('MsgOk', this.$t('player_detail_tool_msgSuccessDeposit'));
                this.deposit = false;
                this.depositInfo = {};
              })
              .catch(error => {
                this.depositInfo = {};
                this.$store.commit('MsgError', error.error);
              });
          },
        });
      }
    },
  },
};
</script>
