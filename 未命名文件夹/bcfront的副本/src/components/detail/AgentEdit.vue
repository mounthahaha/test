<template>
  <v-dialog v-model="model" max-width="80%">
    <v-card class="agent-modal">
      <v-layout pa-3>
        <v-flex xs12>
          <v-text-field v-model="agentMsgs" type="text" disabled :label="$t('player_detail_agent_agentMsgs')"></v-text-field>
          <v-select
            v-model="selectItem"
            type="text"
            :label="$t('player_detail_agent_selectAgent')"
            :items="selectList"
            @change="changeHandle"
          ></v-select>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn :disabled="verifyAgent" color="info" depressed @click="agentEditFun">{{ $t('g_btn_confirm') }}</v-btn>
            <v-btn color="error" outlined @click="cancelAgentEdit">{{ $t('g_btn_cancel') }}</v-btn>
          </v-card-actions>
        </v-flex>
      </v-layout>
    </v-card>
  </v-dialog>
</template>

<script>
import api from '@/api';
import dialog from '../../components/mixins/dialog.js';
export default {
  name: 'AgentEdit',
  mixins: [dialog],
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
      cloneAgentMsg: null,
      verifyAgent: true,
      agentName: '',
      selectItem: '',
      selectList: [],
      inputText: '',
    };
  },
  computed: {
    agentMsgs: {
      get() {
        if (!this.cloneAgentMsg) {
          return ``;
        }
        return `${this.cloneAgentMsg.refer_id}/${this.cloneAgentMsg.aff_name}/${this.cloneAgentMsg.aff_code}`;
      },
      set(newValue) {
        const names = newValue.split('/');
        this.cloneAgentMsg.refer_id = names[0] ? names[0] : '';
        this.cloneAgentMsg.aff_name = names[1] ? names[1] : '';
        this.cloneAgentMsg.aff_code = names[2] ? names[2] : '';
      },
    },
  },
  watch: {
    Player: {
      deep: true,
      handler(val) {
        this.getAgentMsg();
      },
    },
  },
  mounted() {
    if (this.userId > 0) {
      this.getAgentMsg();
      this.getSelectList();
    }
  },
  methods: {
    changeHandle(val) {
      this.verifyAgent = false;
      this.agentName = val;
    },
    getAgentMsg() {
      this.cloneAgentMsg = _.cloneDeep({
        refer_id: this.player.refer_id,
        aff_name: this.player.aff_name,
        aff_code: this.player.aff_code,
      });
    },
    getSelectList() {
      api.get(`/affiliate/listall?agencyName=${this.inputText}`).then(({ result }) => {
        if (result) {
          const newResult = [];
          result.map((item, index) => {
            const strItem = `${item.id}/${item.name}/${item.code}`;
            const obj = {
              text: strItem,
              value: item.name,
            };
            newResult.push(obj);
            return obj;
          });
          this.selectList = newResult;
        }
      });
    },
    agentEditFun() {
      const UserName = this.player.name;
      const AgentName = this.agentName;
      const obj = {
        UserName,
        AgentName,
        Note: '调整用户至另一个代理',
      };
      api
        .post('/system/addUsrToAgency', obj)
        .then(res => {
          this.cancelAgentEdit();
          this.$store.commit('MsgOk', this.$t('g_msgSuccess'));
          this.$emit('updated', this.userId);
        })
        .catch(err => {
          this.$store.commit('MsgError', err.error);
        });
    },
    cancelAgentEdit() {
      this.model = false;
      this.selectItem = '';
      this.verifyAgent = true;
    },
  },
};
</script>
