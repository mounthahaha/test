import { configureStore } from '@reduxjs/toolkit';
import userReducer from './modules/user';
import appReducer from './modules/app';
import activityReducer from './modules/activity';

export const store = configureStore({
  reducer: {
    user: userReducer,
    app: appReducer,
    activity: activityReducer
  },
});
