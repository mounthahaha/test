import React, { useState, useImperativeHandle,forwardRef } from "react";
import {  Modal, Input, Form, Button, message } from "antd";
import API from "@/api/account.api"
import styles from "./styles.module.scss";

const Myseting = forwardRef((props,ref) => {
  useImperativeHandle(ref,()=>({ totalShow: setIsModalVisible }));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (data)=>{
    const { New, Old, ReNew } = data
    if (!Old) {
      return message.error('旧密码不能为空')
    }
    if (!New) {
      return message.error('新密码不能为空')
    }
    if (!ReNew) {
      return message.error('重复密码不能为空')
    }
    if (New !== ReNew) {
      return message.error('两次密码不一致')
    }
    setLoading(true)
    let res = await API.password({data});
    setLoading(false)
    if (res.isError) {
      return message.error(res.error)
    } else {
      message.success('更新成功')
      form.resetFields()
      setIsModalVisible(false)
    }
  }

  const onCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  return (
    <Modal title="修改登入密码" visible={isModalVisible} footer={null} onCancel={onCancel}>
      <Form
        form={form}
        size="large"
        autoComplete="off"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        onFinish={onFinish}
      >
        <Form.Item label="旧登入密码:" name="Old">
          <Input.Password placeholder="请输入旧登入密码"/>
        </Form.Item>
       
        <Form.Item label="新登入密码:" name="New">
          <Input.Password placeholder="请输入新登入密码"/>
        </Form.Item>
        <Form.Item label="确认新登入密码:" name="ReNew">
          <Input.Password placeholder="确认新登入密码"/>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 6, span: 14 }}>
          <Button type="primary" htmlType="submit" className={styles.submits} loading={loading}>提交</Button>
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
