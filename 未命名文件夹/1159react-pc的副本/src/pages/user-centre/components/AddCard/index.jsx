import React, { useState } from "react";
import {  Select, Input, Form, Button, message } from "antd";
import { useNavigate, useLocation  } from "react-router-dom";

import { LeftOutlined } from "@ant-design/icons";
import styles from "./styles.module.scss";
import regionsSelect from "@/utils/regions"
import {chinaBankList} from "@/utils/bankInfo"
import API from "@/api/account.api"

const { Option } =  Select;

const Myseting = () => {
  const navigate = useNavigate();
  const locations = useLocation();
  const [form] = Form.useForm();
  const [bankInfoListArr, setBankListArr] = useState([]);
  const onFinish = async (formData)=>{
    let res = await API.postApiBankList({data:formData});
    if (res.isError) {
      message.error( res.error )
      return ;
    }
    message.success('添加成功',1,()=>gotPath())
  };
  const onLocaleChage = (value)=>{
    setBankListArr(value == 'cn'? chinaBankList : []);
    form.resetFields(['Bank']); // 清空选择的银行
  };

  const gotPath = () => {
    let arr = locations.pathname.split('/');
    let path = arr.splice(0,arr.length-1).join('/');
    navigate(path, { replace: true, state:{refresh: true} });
  }

  return (
    <section className={styles.addCard}>
      <Button
        type="text"
        size="large"
        className={styles.addbtn}
        onClick={() => gotPath("/user-centre/profile")}
      >
        <LeftOutlined /> 添加銀行卡
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
        <Form.Item 
          label="持卡人姓名:" 
          name="Name" 
          extra={<span className={styles.tips}> 为了您的资金能够迅速到账，请确保填写的姓名与银行卡的开户姓名一致 </span>}
        >
          <Input placeholder="请输入持卡人姓名"/>
        </Form.Item>

        <Form.Item label="地区:" name="Locale">
          <Select placeholder="请选择地区" onChange={onLocaleChage}>
            {
              regionsSelect.map((item,index)=>{
                return <Option value={item.value} key={index}>{item.title}</Option>
              })
            }
          </Select>
        </Form.Item>
        <Form.Item label="银行:" name="Bank">
          <Select placeholder="请选择银行">
            {
              bankInfoListArr.map((item,index)=>{
                return <Option value={item.value} key={index}>{item.text}</Option>
              })
            }
          </Select>
        </Form.Item>

        <Form.Item 
          name="Card" 
          label="银行卡号:"
          extra={<span className={styles.tips}>请认真校对银行卡号，卡号错误资金将无法到账</span>}
        >
          <Input placeholder="请输入银行卡号"/>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Button type="primary" htmlType="submit" className={styles.submits}>提交</Button>
        </Form.Item>
      </Form>
    </section>
  );
};

export default Myseting;
