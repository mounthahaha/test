import React, { useState, useImperativeHandle,forwardRef ,useEffect} from "react";
import {  Modal, Input, Form, Button, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import API from "@/api/account.api"
import styles from "./styles.module.scss";
import aes from 'crypto-js/aes';
import md5 from 'crypto-js/md5';
import enc from 'crypto-js/enc-utf8';
import { setUserInfo } from "@/store/modules/user";

const Myseting = forwardRef((props,ref) => {
  const dispatch = useDispatch();
  useImperativeHandle(ref,()=>({ totalShow: setIsModalVisible }));
  const [form] = Form.useForm();
  let [isModalVisible, setIsModalVisible] = useState(false);
  let [isfirst, setIsfirst] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const userInfo = useSelector((state) => state.user.userInfo);

  const onFinish = async (data)=>{
    let res;
    if(isfirst){
      // 首次更改
      setLoading(true)
      res = await API.wpassPassword({data});
    }else{
      setLoading(true)
      res = await API.updateWpassPassword({data});
    }
    setLoading(false)
    if (res.isError) {
      return message.error(res.error)
    } else {
      if (isfirst) {
        let user = window.localStorage.getItem('userInfo');
        const token = window.localStorage.getItem('token');
        user = JSON.parse(aes.decrypt(user, md5(token).toString()).toString(enc));
        dispatch(setUserInfo({...user, w: true}));
      }
      form.resetFields()
      message.success('更新成功')
      setIsModalVisible(false)
    }
  };
  useEffect(()=>{
    setIsfirst(!userInfo.w)
  },[userInfo])
  return (
    <Modal title={isfirst?'首次设置提款密码':'修改提款密码'} visible={isModalVisible} footer={null} onCancel={setIsModalVisible.bind(null,false)}>
      <Form
        size="large"
        autoComplete="off"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        form={form}
        onFinish={onFinish}
      >
        {isfirst?
          <Form.Item label="登录密码:" name="Password">
            <Input.Password placeholder="请输入登录密码"/>
          </Form.Item>:
          <Form.Item label="旧提款密码:" name="Password">
            <Input.Password placeholder="请输入旧提款密码"/>
          </Form.Item>
        }
        <Form.Item label="新提款密码:" name="Rwpass">
          <Input.Password placeholder="请输入新提款密码"/>
        </Form.Item>
        <Form.Item label="确认新提款密码:" name="Wpass">
          <Input.Password placeholder="确认新提款密码"/>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 6, span: 14 }}>
          <Button type="primary" htmlType="submit" loading={loading} className={styles.submits}>提交</Button>
        </Form.Item>
      </Form>
      <div>
        <p className={styles.tipstop}>温馨提示</p>
        <p className={styles.tips}>密码必须是 6-16 位字符之间，由字母和数字组成。</p>
        <p className={styles.tips}>如您忘记登录密码，请及时联系在线客服协助找回。</p>
        <p className={styles.tips}>定期修改密码可以让您的账户更安全。</p>
      </div>
    </Modal>
  );
});

export default Myseting;
