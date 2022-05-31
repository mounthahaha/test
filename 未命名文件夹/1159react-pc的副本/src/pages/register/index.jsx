import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserOutlined, LockFilled, MobileFilled } from "@ant-design/icons";
import API from "@/api/regist.api";
import { encrypted } from "@/utils";
import { useParams } from 'react-router-dom';

import { Form, Input, Button, Checkbox,Popover,Modal, message } from "antd";
import Privacy from "./privacy";
import styles from "./styles.module.scss";
import log from "@/assets/login/log.png"
import qr from "@/assets/login/qr.png"

const Register = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [focusedName, setfocusedName] = useState(false);
  const [focusedPass, setfocusedPass] = useState(false);
  const [coucusedCon, setcoucusedCon] = useState(false);
  const [focuseMobil, setfocuseMobil] = useState(false);
  const [focuseYqm, setfocuseYqm] = useState(false);

  const [visible, setvisible] = useState(false);

  const {code} = useParams()

  useEffect(() => {
    if (code) {
      form.setFieldsValue({Code: code})
    }
  }, [code])

  const handleBack = () => navigate(-1);
  const onFinish = (values) => {
    if (/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,11}$/.test(values.Name) != true) {
      message.error("账户名需为6～11位(字母和数字)");
      return;
    }
    if (!regFun(values.Name, "userName")) {
       message.error("帐号不符规则！长度需为6~16位(字母和数字)");
      return;
    }
    if (!regFun(values.Passwd, "userName")) {
       message.error("密码不符规则！长度需为6~16位(字母和数字)");
      return;
    }
    if (values.Passwd !== values.RePasswd) {
      message.error("两次输入密码不一致！");
      return;
    }
    if (!regFun(values.Mobile, "phone")) {
      message.error("请输入正确的手机号！");
      return;
    }
    if(!values.Remember){
      message.error( "请确定已满18周岁，并同意条款。")
      return
    }
    API.regist({ data: encrypted(values) })
    .then((res) => {
      if (res.isError) {
        message.error( res?.error || "注册失败！" );
      } else {
        message.success( res?.error || "注册成功" );
        setTimeout(() => {
          navigate("/");
        }, 500);
      }
    })
    .catch((err) => {
      message.error( err.error );
    });
  };

  const regFun = (v, type) => {
    try {
      const reg = {
        phone: /^1(3\d|4[1-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/, // 手机号码
        userName: /^[0-9a-zA-Z]{6,16}$/, // 账户
      };
      if (!reg[type].test(v)) {
        return false;
      } else {
        return true;
      }
    } catch (error) {}
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  const agreeXy = ()=>{
    setvisible(false);
  }
  return (
    <div className={styles.loginWrap}>
      <img src={log} className={styles.logImg} alt="" />
      <div className={styles.logCont}>
        <Form
          name="basic"
          form={form}
          initialValues={{ remember: true, }}
          className={styles.formw}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="Name"
            label="请输入您的账号"
            rules={[{ required: true,  message: "请输入您的账号" }]}
            className={(form.getFieldValue('Name') || focusedName )? styles.focusDate : "" }
          >
            <Input
              className={styles.fromInput}
              onFocus={()=>setfocusedName(true)}
              onBlur={()=>setfocusedName(false)}
              prefix={<UserOutlined style={{ color: "#0bab5e" }} />}
            />
          </Form.Item>

          <Form.Item
            name="Passwd"
            label="请输入您的密码"
            rules={[ {required: true, message: "请输入您的密码"} ]}
            className={(form.getFieldValue('Passwd') || focusedPass )? styles.focusDate : "" }
          >
            <Input.Password
              className={styles.fromInput}
              onFocus={()=>setfocusedPass(true)}
              onBlur={()=>setfocusedPass(false)}
              prefix={<LockFilled style={{ color: "#0bab5e" }} />}
            />
          </Form.Item>

          <Form.Item
            name="RePasswd"
            label="请确认您的密码"
            className={(form.getFieldValue('RePasswd') || coucusedCon )? styles.focusDate : "" }
            rules={[ { required: true, message: "请确认您的密码" } ]}
          >
            <Input.Password
              className={styles.fromInput}
              onFocus={()=>setcoucusedCon(true)}
              onBlur={()=>setcoucusedCon(false)}
              prefix={<LockFilled style={{ color: "#0bab5e" }} />}
            />
          </Form.Item>
          <Form.Item
            name="Mobile"
            label="请输入手机号码"
            className={(form.getFieldValue('Mobile') || focuseMobil )? styles.focusDate : "" }
            rules={[ { required: true,  message: "请输入手机号码" } ]}
          >
            <Input
              className={styles.fromInput}
              onFocus={()=>setfocuseMobil(true)}
              onBlur={()=>setfocuseMobil(false)}
              prefix={<MobileFilled style={{ color: "#0bab5e" }} />}
            />
          </Form.Item>
          <Form.Item
            name="Code"
            label="请输入推荐码"
            className={(form.getFieldValue('Code') || focuseYqm )? styles.focusDate : "" }
            rules={[ { required: true,  message: "请输入推荐码" } ]}
          >
            <Input
              className={styles.fromInput}
              onFocus={()=>setfocuseYqm(true)}
              onBlur={()=>setfocuseYqm(false)}
              prefix={<MobileFilled style={{ color: "#0bab5e" }} />}
            />
          </Form.Item>
          <Form.Item
            name="Remember"
            valuePropName="checked"
            className={styles.antform}
          >
            <Checkbox className={styles.logincheck} onChange={()=>{form.getFieldValue(!form.getFieldValue('Remember'));}}>              
              <span onClick={()=>setvisible(true)}>我已满18周岁并同意用户条款及隐私政策</span>
            </Checkbox>
            
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className={styles.loginBtn}
            >
              注册
            </Button>
          </Form.Item>
        </Form>
        <div className={styles.flexbet}>
          <Button
            ghost
            shape="round"
            className={styles.registry}
            onClick={() => navigate(`/login`)}
          >
            已有账户
          </Button>
          <Button ghost shape="round" className={styles.registry} onClick={()=>{
            const w=window.open('about:blank');
            w.location.href='https://chat.guanjun703.com/kefu/5c6cbcb7d55ca'
          }}>
            在线客服
          </Button>
        </div>
        <div className={styles.flexRight}>
          <Popover content={<img src={qr} className={styles.qrImg}></img>} >
            <Button ghost shape="round" className={styles.registry}>
              APP下载
            </Button>
          </Popover>
        </div>
      </div>
      <Modal
        title="同意用户条款及隐私政策"
        visible={visible}
        width={800}
        closable={false}
        footer={<Button type="primary" className={styles.confrm} onClick={()=>{agreeXy()}}>确认</Button>}
      >
        <Privacy></Privacy>
      </Modal>
    </div>
  );
};

export default Register;
