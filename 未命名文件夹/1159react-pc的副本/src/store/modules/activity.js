import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from "@/api/account.api.js";

const initialState = {
  activityStatus: '',
  activityInfo: {
    list: []
  }
};

export const getActivity = createAsyncThunk('activity/info', async () => {
  const res = await API.getPromotionList();
  return res;
});

export const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    setActivityInfo: (state, action) => {
      state.activityInfo = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getActivity.pending, (state) => {
        state.activityStatus = 'loading';
      })
      .addCase(getActivity.fulfilled, (state, action) => {
        state.activityStatus = 'done';
        state.activityInfo = action.payload.result;
      })
  }
})

export default activitySlice.reducer;
