import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { ConfigProvider, message } from "antd"
import zh_CN from 'antd/lib/locale-provider/zh_CN'

import { Provider } from "react-redux"
import { store } from './store';

message.config({
  maxCount: 1
})
message.destroy()

ReactDOM.render(
  <ConfigProvider locale={zh_CN}>
    <Provider store={store}>
        <App />
    </Provider>
  </ConfigProvider>
  ,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
