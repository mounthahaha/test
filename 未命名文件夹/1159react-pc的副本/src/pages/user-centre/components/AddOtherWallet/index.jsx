// import React, { useState, useEffect,useRef } from "react";
import { Input, Form, Button, message } from "antd";
import { useNavigate,useLocation } from "react-router-dom";
import { LeftOutlined, CheckOutlined } from "@ant-design/icons";
import styles from "./styles.module.scss";

import API from "@/api/account.api"


const AddOtherWallet = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const locations = useLocation();
  const type = locations.search.split('=')[1]
  const typeText = {TOPAY: '淘币', OKPAY: '欧币'}[type]
  
  const gotPath = () => {
    let arr = locations.pathname.split('/');
    let path = arr.splice(0,arr.length-1).join('/');
    navigate(path, { replace: true, state:{refresh: true} });
  }
  const onFinish = async (formData)=>{
    const Bank = type
    const card = form.getFieldValue('Card')
    
    if (!card) return message.error('钱包地址不能为空！')
    if (Bank === 'OKPAY' && card.length !== 16) {
      return message.error('钱包地址长度只能为16位')
    }
    if (Bank === 'TOPAY') {
      const reg = /^tp.*/
      if (!reg.test(card) || card.length !== 18) {
        return message.error(`钱包地址须为以tp开头的18位英文数字组合`)
      }
    }
    const reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]/ig
    if  (!reg.test(card)) {
      return message.error(`钱包地址不能为纯英文或者纯数字！`)
    }
    let res = await API.postApiBankList({data: {...formData, Bank}});
    if (res.isError) {
      message.error( res.error )
      return ;
    }
    message.success('添加成功',1,()=>gotPath("/user-centre/profile"))
  };
  
  return (
    <section className={styles.addCard}>
      <Button
        type="text"
        size="large"
        className={styles.addbtn}
        onClick={() => gotPath("/user-centre/profile")}
      >
        <LeftOutlined /> 添加{typeText}钱包
      </Button>
      <div style={{ height: "20px" }}></div>
      <Form
        size="large"
        autoComplete="off"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        layout="horizontal"
        form={form}
        onFinish={onFinish}
      >
        <Form.Item label={`${typeText}钱包:`}  name="Card" >
          <Input style={{width:'320px'}} onChange={e => {
            let newVal = e.target.value.replace(/[^a-zA-Z0-9,]/ig, '')
            form.setFieldsValue({'Card': newVal})
          }}  />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Button type="primary" htmlType="submit" className={styles.submits}>提交</Button>
        </Form.Item>
      </Form>
    </section>
  );
};

export default AddOtherWallet;
