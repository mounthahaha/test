import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { encrypted } from "@/utils";

import aes from "crypto-js/aes";
import md5 from "crypto-js/md5";
import enc from "crypto-js/enc-utf8";

import { UserOutlined, LockFilled } from "@ant-design/icons";
import { Form, Input, Button, Checkbox, message,Popover } from "antd";

import { setUserInfo } from "@/store/modules/user";
import styles from "./styles.module.scss";
import API from "@/api/login.api";
import log from "@/assets/login/log.png"
import qr from "@/assets/login/qr.png"
import getFingerPrint from '@/utils/visitor-identifier';

const enKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ODAwODUsIm5hbWUiOiJ0ZXN0MDAwMyIsImV4cCI6MTY0NjI5NTY5OH0.pIPE4Uo63DksGwP-dv62nn89W_VoM7RSJBgh90ebnEQ";

const Login = () => {
  const visitorId = getFingerPrint();
  localStorage.setItem('visitorId', visitorId);
  const BrowserHash = localStorage.getItem('visitorId');

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [focusedName, setfocusedName] = useState(false);
  const [focusedPass, setfocusedPass] = useState(false);
  const [loading, setloading] = useState(false);

  let saveInfo = window.localStorage.getItem("saveInfo");
  if (!["", null, undefined].includes(saveInfo)) {
    try {
      saveInfo = JSON.parse(
        aes.decrypt(saveInfo, md5(enKey).toString()).toString(enc)
      );
    } catch (e) {
      console.log(e);
    }
  }
  const remember = JSON.parse(localStorage.getItem("Remember"));
  const goPage = (path) => navigate(path);

  const [loginInfo, setLoginInfo] = useState({
    Name: remember ? saveInfo?.Name : "",
    Passwd: remember ? saveInfo?.Passwd : "",
    Remember: remember || false,
  });
  form.setFieldsValue(loginInfo);

  const onFinish = async (values) => {
    setloading(true)
    const res = await API.login({ data: encrypted({...loginInfo, BrowserHash}) });
    setloading(false)
    if (res.isError) {
      message.error(res.error);
    } else {
      dispatch(setUserInfo(res.result));
      if (loginInfo.Remember) {
        localStorage.setItem(
          "saveInfo",
          aes
            .encrypt(JSON.stringify(loginInfo), md5(enKey).toString())
            .toString()
        );
      }
      message.success("登录成功", 1.5, () => {
        navigate("/");
      });
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const handleInputChange = (key, val) => {
    setLoginInfo({ ...loginInfo, [key]: val });
  };

  const handleCheckChange = (checked) => {
    localStorage.removeItem("saveInfo");
    setLoginInfo({
      ...loginInfo,
      Remember: checked,
    });
    localStorage.setItem("Remember", checked);
  };

  return (
    <div className={styles.loginWrap}>
      <img src={log} className={styles.logImg} alt="" />
      <div className={styles.logCont}>
        <Form
          name="basic"
          initialValues={{
            remember: true,
          }}
          form={form}
          className={styles.formw}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            className={(loginInfo.Name || focusedName )? styles.focusDate : "" }
            label="请输入您的账号"
            name="Name"
            rules={[
              { required: true, message: "请输入您的账号", triger: "change" },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#0bab5e" }} />}
              onChange={(e) => handleInputChange("Name", e.target.value)}
              onFocus={()=>setfocusedName(true)}
              onBlur={()=>setfocusedName(false)}
              value={loginInfo.Name}
              className={styles.fromInput}
              maxLength={16}
              showCount={true}
            />
          </Form.Item>

          <Form.Item
            label="请输入您的密码"
            name="Passwd"
            rules={[{ required: true, message: "请输入您的密码" }]}
            className={(loginInfo.Passwd || focusedPass )? styles.focusDate : "" }
          >
            <Input.Password
              prefix={<LockFilled style={{ color: "#0bab5e" }} />}
              onChange={(e) => handleInputChange("Passwd", e.target.value)}
              onFocus={()=>setfocusedPass(true)}
              onBlur={()=>setfocusedPass(false)}
              value={loginInfo.Passwd}
              className={styles.fromInput}
              maxLength={16}
              showCount={true}
            />
          </Form.Item>

          <Form.Item
            name="Remember"
            valuePropName="checked"
            className={styles.antform}
          >
            <Checkbox
              onChange={(e) => handleCheckChange(e.target.checked)}
              checked={loginInfo.Remember}
              className={styles.logincheck}
            >
              记住密码
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className={styles.loginBtn}
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        <div className={styles.flexRight}>
        <Button
            type="text"
            className={styles.registrys}
            onClick={() => goPage("/guest")}
          >
            游客登录
          </Button>
          <Button
            type="text"
            className={styles.registrys}
            onClick={() => goPage("/register")}
          >
            免费注册
          </Button>
        </div>
        <div className={styles.flexbet}>
          <Button ghost shape="round" className={styles.registry} onClick={()=>{
            const w=window.open('about:blank');
            w.location.href='https://chat.guanjun703.com/kefu/5c6cbcb7d55ca'
          }}>
            在线客服
          </Button>
          <Popover placement={'rightBottom'} content={<img src={qr} className={styles.qrImg}></img>} >
            <Button ghost shape="round" className={styles.registry}>
              APP下载
            </Button>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default Login;
