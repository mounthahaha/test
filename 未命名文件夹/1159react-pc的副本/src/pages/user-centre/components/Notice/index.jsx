import {
  Button,
  Table,
  Tabs,
  Form,
  Select,
  DatePicker,
  Pagination,
  Col,
  message,
  ConfigProvider
} from "antd";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from "react";
import { DeleteOutlined, MailOutlined ,ContainerOutlined} from "@ant-design/icons";

import styles from "./styles.module.scss";
import style from "../TradeRecord/styles.module.scss";

import API from "@/api/msgList.api";
import EmailAPI from "@/api/email.api";
import {formatDate} from "@/utils/formUltls"
import receiveImg from '@/assets/userCenter/receive.png'

const { TabPane } = Tabs;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;


const Idcard = () => {

  const [data, setData] = useState([]);

  const [persionData, sePersionData] = useState({ current: 1 });
  const [selectedRowKeys, setselectedRowKeys] = useState([]);
  const [expandedRowRenders,setexpandedRowRenders] = useState({});
  const [querParams, setquerParams] = useState({}); // 系统消息请求参数
  const [sysMsgData, setsysMsgData] = useState({ list:[], current: 1 });
  const [form] = Form.useForm();
  
  const iconStyle = {fontSize:'24px',cursor:'pointer'}
  const [msgType, setmsgType] =useState(1)

  const handleReceive = async (record) => {
    const data = {id:record.id}
    const res = await API.reciveReward({data})
    if (res.error) {
      message.error(res.error)
      return 
    } else {
      message.success('领取成功，注意查收')
      record.is_received = false
    }
  }

  const iconRender = (record) => {
    return (
      <div className={styles.iconBox}>
        {record.is_read?<ContainerOutlined style={iconStyle}/>:<MailOutlined style={iconStyle}/>}
        {!record.is_received&&<img src={receiveImg} height="24" onClick={() => handleReceive(record)} />}
      </div>
    )
  }

  const personColumns = [
    { title: <DeleteOutlined onClick={()=>delPersonItem()} style={iconStyle}/>, dataIndex: "id", key: "id", render:(_val,record)=> iconRender(record) },
    { title: "", dataIndex: "title", key: "title"},
    { title: "", dataIndex: "send_time", key: "send_time",  render: (_val) => <span>{formatDate(_val)}</span>, },
  ];
  
  
  const systemColumns = [
    { title: "", dataIndex: "title", key: "title",},
    { title: "", dataIndex: "title", key: "title"},
    { title: "", dataIndex: "created", key: "created",  render: (_val) => <span>{formatDate(_val)}</span>, },
  ]


  // 获取个人消息列表
  const handleSearch = async (page =1) => {
    const params = {
      page,
      page_num: 10,
      is_show_all: 1,
    };
    const res = await EmailAPI.getApiStationLetterList({params});
    if (res.isError) {
      return;
    } else {
      sePersionData({
        list: res?.result?.list,
        total: res?.result?.total,
        current: page
      })
    }
  };
  // 获取系统信息列表
  const systemMsgList = async(page = 1)=>{
    let res = await EmailAPI.geSysMsgList({...querParams, page});
    if (res.status === 200 && res) {
      const reData = Object.values(res).filter((o) => o.id);
      setsysMsgData({list: reData,
        // total: res?.result?.total,
        // current: page
      });
    }
  }

  // 删除个人消息
  const delPersonItem = async ()=>{
    const params = { ids: selectedRowKeys.join()},
    res = await EmailAPI.postDeleteMail({  params });
    if (res.status === 200) {
      message.success('删除成功');
    } else {
      message.error(res.error);
    }
  };

  // 系统消息重置
  const handleReset = () => {
    console.log("--e-e-e22--");
    const res = API.saveRecord({ data: "" });
    if (res.isError) {
      return;
    } else {
      setData();
    }
  };

  // 个人消息配置项目
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => setselectedRowKeys(selectedRowKeys),
    getCheckboxProps: (record) => ({  disabled: record.id === 'Disabled User',  name: record.name}),
  };

  useEffect(()=>{
    if(msgType==1){
      handleSearch();
    }else{
      systemMsgList();
    }
  },[msgType])

  useEffect(()=>{
    systemMsgList();
  },[querParams])
  
  const onFinish = async(formData)=>{
    let [starTime ='', endTime=''] = formData?.time || [];
    setquerParams((preObj)=>({
      ...preObj,
      starTime:starTime?formatDate(starTime,'YYYY-MM-DD'):'',
      endTime:endTime?formatDate(endTime,'YYYY-MM-DD'):'',
      type: formData.type
    }))
  }

  const renderEmpty = () => {
    const styleF = {
      padding: '15px',
      borderRadius: '12px',
      background: '#4caf50',
      fontSize: '16px',
      color: '#000',
      position: 'relative'
    }
    const styleC = {
      position: 'absolute',
      left: '20px',
      top: '20px',
      fontSize: '20px'
    }
    return (
      <div style={styleF}><ExclamationCircleOutlined style={styleC} />现在您的信件是空的</div>
    )
  }

  return (
    <div>
      <div className={styles.TopCard}>
        <h3 className={styles.title}>站內信</h3>
        <Tabs defaultActiveKey={msgType} onChange={(typeMsg)=> setmsgType(typeMsg) }>
          <TabPane tab="个人消息" key="1">
            <div >
              <ConfigProvider renderEmpty={renderEmpty}>
                <Table
                  rowKey='id'
                  columns={personColumns}
                  onExpand={(expanded, record)=>{
                    if(expanded && !expandedRowRenders[record.id]){
                      EmailAPI.getApiStationLetter({urlParams:record,params:record})
                      .then(res=>{
                        setexpandedRowRenders((preData)=>({ 
                          ...preData,
                          [record.id]: <div dangerouslySetInnerHTML={{  __html: res.result.content  }}></div>
                        }))
                      })
                    }
                  }}
                  expandable={{
                    expandedRowRender: (record) => (
                      expandedRowRenders[record.id]?expandedRowRenders[record.id]:''
                    ),
                    rowExpandable: (record) => !!record.id ,
                  }}
                  pagination={false}
                  rowSelection={rowSelection}
                  dataSource={persionData.list}
                ></Table>
              </ConfigProvider>
              <Pagination current={persionData.current} onChange={handleSearch} total={persionData.total} pageSize={10}/>
            </div>
          </TabPane>
          <TabPane tab="系统消息" key="2">
            <Form layout="inline" onFinish={onFinish} form={form}>
              <Col span={8}>
                <FormItem label="查看" name="type">
                  <Select style={{ width: "240px" }}>
                    <Select.Option key="全部">全部</Select.Option>
                    <Select.Option key="系统">系统</Select.Option>
                    <Select.Option key="维护">维护</Select.Option>
                    <Select.Option key="存提款">存提款</Select.Option>
                  </Select>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="时间" name="time">
                  <RangePicker style={{ width: "240px" }} format="YYYY-MM-DD"/>
                </FormItem>
              </Col>
              <Col span={8}>
                <Button className={style.searchBtn} htmlType="submit"> 搜索</Button>
                <Button
                  className={style.Btn}
                  onClick={()=>form.resetFields()}
                  style={{ marginLeft: "8px" }}
                >
                  重置
                </Button>
              </Col>
            </Form>
            <div>
            <ConfigProvider renderEmpty={renderEmpty}>
              <Table
                rowKey='id'
                columns={systemColumns}
                expandable={{
                  expandedRowRender: (record) => (
                    record.content?<div dangerouslySetInnerHTML={{__html:record.content}}></div>:''
                  ),
                  rowExpandable: (record) => !!record.id ,
                }}
                pagination={false}
                dataSource={sysMsgData.list}
              ></Table>
            </ConfigProvider>
              {/* <Pagination current={persionData.current} onChange={handleSearch} total={persionData.total} pageSize={10}/> */}
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default Idcard;
