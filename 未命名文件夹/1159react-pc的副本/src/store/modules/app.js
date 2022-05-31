import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '@/api/config.api';

const initialState = {
  balanceStatus: 'none',
  balanceMap: {},
  balanceResult: {},
  balanceAllInfo: {},
  mainWallet: '0.00',
  gameWallet: '0.00',
  configureStatus: 'none',
  configure: {},
  balanceSum: 0,
  gameList: []
};

export const getBalanceAll = createAsyncThunk('app/balanceAll', async () => {
  const res = await API.balanceAll();
  return res;
});

export const getConfigure = createAsyncThunk('app/configure', async () => {
  const res = await API.configure();
  return res;
});

export const getGameTypes = createAsyncThunk('app/games', async () => {
  const res = await API.getGameTypes();
  return res;
});

export const counterSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppInfo: (state, action) => {
      state.config = action.payload;
    },
  },
  //  异步请求后结果处理
  extraReducers: (builder) => {
    builder
      .addCase(getBalanceAll.pending, (state) => {
        state.balanceStatus = 'loading';
      })
      .addCase(getBalanceAll.fulfilled, (state, action) => {
        state.balanceStatus = 'down';
        if ( action.payload.isError ) {
          return
        }
        state.balanceMap = action.payload.map;
        state.balanceResult = action.payload.result;
        // DODO 只回主錢包與遊戲錢包
        let balanceAllInfo = {};
        let _balanceSum = 0;
        let gameWallet = 0;
        for (let i in action.payload.result) {
          if (i < 201 || i > 224) {
            balanceAllInfo[i] = { name: action.payload.map[i], balance: action.payload.result[i] };
            _balanceSum += parseFloat(action.payload.result[i]);
          } else if (i > 201 && i < 224) {
            gameWallet = gameWallet || parseFloat(action.payload.result[i]);
          }
        }
        balanceAllInfo[-2] = {
          balance: gameWallet,
          name: action.payload.map[-2],
        };       
        for (let i in balanceAllInfo) {
          if (balanceAllInfo[i].name == undefined) {
            delete balanceAllInfo[i];
          }
        }
        state.mainWallet = balanceAllInfo[0].balance
        state.gameWallet = gameWallet
        state.balanceAllInfo = balanceAllInfo;
        state.balanceSum = _balanceSum;
      })
      .addCase(getConfigure.pending, (state) => {
        state.configureStatus = 'loading';
      })
      .addCase(getConfigure.fulfilled, (state, action) => {
        state.configureStatus = 'down';
        state.configure = action.payload;
      })
      .addCase(getGameTypes.fulfilled, (state, action) => {
        const { result } = action.payload
        state.gameList = result.list
      });
  },
  
});

export const { setAppInfo } = counterSlice.actions;

export default counterSlice.reducer;
