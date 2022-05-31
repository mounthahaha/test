import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { message } from 'antd';
import aes from 'crypto-js/aes';
import md5 from 'crypto-js/md5';
import enc from 'crypto-js/enc-utf8';
import API from '@/api/account.api';

let login = false;
let user = window.localStorage.getItem('userInfo');
const token = window.localStorage.getItem('token');
if (user) {
  try {
    user = JSON.parse(aes.decrypt(user, md5(token).toString()).toString(enc));
  } catch (e) {}
  login = true;
}

const initialState = {
  login,
  token,
  userInfo: user || {},
  profileStatus: 'none',
  profile: {},
};
export const getProfile = createAsyncThunk('user/profile', async () => {
  const res = await API.getProfile();
  return res;
});
// 异步请求示例
// export const incrementAsync = createAsyncThunk(
//   'counter/fetchCount',
//   async (amount) => {
//     const response = await fetchCount(amount);
//     // The value we return becomes the `fulfilled` action payload
//     return response.data;
//   }
// );

export const counterSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    setUserInfo: (state, action) => {
      const token = action.payload.token;
      localStorage.setItem('token', token);
      localStorage.setItem(
        'userInfo', 
        aes
          .encrypt(JSON.stringify(action.payload), md5(token).toString())
          .toString()
      );
      state.userInfo = { ...action.payload };
      state.token = token;
      state.login = true;
    },
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      state.login = false;
      state.token = '';
      message.error('会话已失效，请重新登录！')
      // window.location.reload()
    },
  },  
  // 异步请求后结果处理
  extraReducers: (builder) => {
    builder
      .addCase(getProfile.pending, (state) => {
        state.profileStatus = 'loading';
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.profileStatus = 'down';
        state.profile = action.payload && action.payload.result ? action.payload.result : {};
      });
  },
});

export const { increment, decrement, setUserInfo, logout } =
  counterSlice.actions;

// 下面的函数称为selector，它允许我们从中选择一个值
// 选择器也可以在使用它们的地方定义为内联的
// 在组件中使用。例如: `useSelector((state: RootState) => state.counter.value)`
export const selectCount = (state) => state.counter.value;

// 我们也可以手工编写thunks，它可能包含同步和异步逻辑。
// 下面是一个基于当前状态有条件地分派操作的示例。
export const incrementIfOdd = (amount) => (dispatch, getState) => {
  const currentValue = selectCount(getState());
  if (currentValue % 2 === 1) {
    dispatch(setUserInfo(amount));
  }
};

export default counterSlice.reducer;
