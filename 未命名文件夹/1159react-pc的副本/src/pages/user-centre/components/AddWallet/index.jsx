import React, { useState, useEffect,useRef } from "react";
import {  Select, Input, Radio, Form, Button, message } from "antd";
import { useNavigate,useLocation } from "react-router-dom";

import { LeftOutlined, CheckOutlined } from "@ant-design/icons";
import styles from "./styles.module.scss";
import ScanCanvasQR from "react-pdf-image-qr-scanner";

import API from "@/api/account.api"
import qr from "@/assets/userCenter/qrcode.png"


const Myseting = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const canvasScannerRef = useRef();
  const inputUpload = useRef();
  const [resultText, setResultText] = useState("");
  const [preImgUrl, setpreImgUrl] = useState("");
  const locations = useLocation();
  
  const gotPath = () => {
    let arr = locations.pathname.split('/');
    let path = arr.splice(0,arr.length-1).join('/');
    navigate(path, { replace: true, state:{refresh: true} });
  }
  const onFinish = async (formData)=>{
    let res = await API.postApiBankList({data: {...formData, Bank: "USDT"}});
    if (res.isError) {
      message.error( res.error )
      return ;
    }
    message.success('添加成功',1,()=>gotPath("/user-centre/profile"))
  };
  async function scanFile(selectedFile) {
    const filemaxsize = 1024*2;//2M
    const { size } = selectedFile;
    if( size/1024 > filemaxsize ) {
      message.error("附件大小不能大于"+filemaxsize/1024+"M！")
      return;
    }
    setResultText("");
    try {
      const qrCode = await canvasScannerRef.current.scanFile(selectedFile);
      if (!qrCode) {
        message.error("未识别到二维码信息！请重试"+filemaxsize/1024+"M！")
        setResultText("未识别到二维码信息！请重试");
        return;
      }
      // It returns null if no QR code is found
      setpreImgUrl(window.URL.createObjectURL(selectedFile))
      setResultText(qrCode);
      form.setFieldsValue({Card:qrCode})
    } catch (e) {
      if (e?.name === "InvalidPDFException") {
        message.error("图片错误！")
        setResultText("图片错误！");
      } else if (e instanceof Event) {
        message.error("图片错误！")
        setResultText("图片错误！");
      } else {
        message.error("未知错误！")
        setResultText("未知错误！");
      }
    }
  }
  const inputClick= () =>  inputUpload.current.click();
  
  
  return (
    <section className={styles.addCard}>
      <Button
        type="text"
        size="large"
        className={styles.addbtn}
        onClick={() => gotPath("/user-centre/profile")}
      >
        <LeftOutlined /> 添加USDT钱包
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
        <Form.Item label="USDT钱包:"  name="Card" >
          <Input style={{width:'320px'}} onClick={inputClick.bind(null)}/>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <div className={styles.uploads}  style={{width:'320px'}}>
          <ScanCanvasQR ref={canvasScannerRef} />
          <input
            accept="image/*"
            type="file"
            ref={inputUpload}
            onChange={(e) => {
              scanFile(e.target.files[0]);
            }}
          />
            {
              preImgUrl?
              <img src={preImgUrl} className={styles.preImg}/>:
              <img className={styles.defaultImg} src={qr} alt="" />
            }
            <p> {preImgUrl ? '' : "上传收款二维码"}</p>
          </div>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Button type="primary" htmlType="submit" className={styles.submits}>提交</Button>
        </Form.Item>
      </Form>
    </section>
  );
};

export default Myseting;
