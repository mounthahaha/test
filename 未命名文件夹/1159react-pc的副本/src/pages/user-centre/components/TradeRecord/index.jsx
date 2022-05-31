import {
  Button,
  Table,
  Form,
  Select,
  DatePicker,
  Pagination,
  Modal,
} from "antd";
import React, { useState, useEffect } from "react";
import moment from "moment";
import styles from "./styles.module.scss";
import API from "@/api/transferHistory.api";
import { statusObjMap, balanceTypeMap, withdrawalsTypeMap } from "./status";

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const TradeRecord = () => {
  const [form] = Form.useForm();

  const [listData, setListData] = useState({ current: 1, total: 0, list: [] });
  const [loading, setLoading] = useState(false);
  const [columnsList, setColumnsList] = useState([]);
  const [columnsType, setColumnsType] = useState("1");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paramsData, setParamsData] = useState({
    pt: "", // 查询状态
    st: "", // 支付类型
    s: "", //开始日期
    e: "", //截止日期
    page: 1, // 页码
    num: 10, // 条数
  }); // 查询类型
  const [depositsDetail, setDepositsDetail] = useState({
    order: "",
    bank: "",
    card: "",
    amount: "",
  });

  const columns = [
    {
      title: "时间",
      dataIndex: "Created",
      key: "Created",
      render: (value) => (
        <span>{moment(value).format("yyyy-MM-DD HH:mm:ss")}</span>
      ),
    },
    {
      title: "查询码",
      dataIndex: "Sn",
      key: "Sn",
    },
    {
      title: "存款类型",
      dataIndex: "PayTypeName",
      key: "PayTypeName",
    },
    {
      title: "状态",
      dataIndex: "Status",
      key: "Status",
      render: (val) => (
        <span style={{ color: statusObjMap[1][val].color }}>
          {statusObjMap[1][val].title}
        </span>
      ),
    },
    {
      title: "金额(U)",
      dataIndex: "Amount",
      key: "Amount",
      render: (text, item) =>
        item.PayType === 7 ? (
          <span>
            ￥{text}({item.UsdtAmount})
          </span>
        ) : (
          <span>￥{text}</span>
        ),
    },
    {
      title: "操作",
      dataIndex: "Id",
      key: "Id",
      render: (v) => (
        <Button className={styles.detailBtn} onClick={() => handleModal(v)}>
          详情
        </Button>
      ),
    },
  ];
  const columns2 = [
    {
      title: "时间",
      dataIndex: "Created",
      key: "Created",
      render: (value) => <span>{moment(value).format("yyyy-MM-DD")}</span>,
    },
    {
      title: "查询码",
      dataIndex: "Sn",
      key: "Sn",
    },
    {
      title: "取款类型",
      dataIndex: "Type",
      key: "Type",
      render: (val) => (
        <span style={{ color: withdrawalsTypeMap[val].color }}>
          {" "}
          {withdrawalsTypeMap[val].title}{" "}
        </span>
      ),
    },
    {
      title: "状态",
      dataIndex: "Status",
      key: "Status",
      render: (val) => (
        <span style={{ color: statusObjMap[2][val].color }}>
          {" "}
          {statusObjMap[2][val].title}{" "}
        </span>
      ),
    },
    {
      title: "申请人民币金额",
      dataIndex: "Amount",
      key: "Amount",
      render: (text) => <span>￥{text}</span>,
    },
    {
      title: "申请USDT金额",
      dataIndex: "UsdtAmount",
      key: "UsdtAmount",
      render: (text) => <span>￥{text}</span>,
    },
    {
      title: "实际金额",
      dataIndex: "Amount",
      key: "Amount",
      render: (text) => <span>￥{text}</span>,
    },
    {
      title: "原因",
      dataIndex: "Note",
      key: "Note",
    },
  ];
  const columns3 = [
    {
      title: "时间",
      dataIndex: "Created",
      key: "Created",
      render: (value) => <span>{moment(value).format("yyyy-MM-DD")}</span>,
    },
    {
      title: "类型",
      dataIndex: "Type",
      key: "Type",
      render: (value) => (
        <span className={styles.statusSpan}>{typeData(value)}</span>
      ),
    },
    {
      title: "金额",
      dataIndex: "Amount",
      key: "Amount",
      render: (text) => <span>￥{text}</span>,
    },
    {
      title: "备注",
      dataIndex: "Remark",
      key: "Remark",
    },
  ];

  const columnMap = {
    1: columns,
    2: columns2,
    3: columns3,
  };

  const init = async () => {
    handleEggle("1");
    const param = {
      page: 1, // 页码
      num: 10, // 条数
    };
    const requestApi = await API.depositsHistory({ params: param });
    if (requestApi.status === 200) {
      let resultList = requestApi?.result?.deposits;

      setListData((obj) => ({
        ...obj,
        list: resultList,
        total: requestApi?.result?.total,
        current: 1,
      }));
    }
  };

  const handleEggle = (value) => {
    // setstatusObjMap(statusObjMap[columnsType])
    setColumnsType(value);
    setColumnsList(columnMap[value]);
    setListData({ current: 0, total: 0, list: [] });
  };

  const handleSearch = async (values) => {
    const { time } = values;
    let requestApi;
    const params = {
      ...paramsData,
      s: time && time[0] ? moment(time[0]).format("yyyy-MM-DD") : "",
      e: time && time[1] ? moment(time[1]).format("yyyy-MM-DD") : "",
      page: 1,
    };
    setParamsData(params);
    setLoading(true);
    if (columnsType === "2") {
      requestApi = await API.withdrawalsHistory({ params });
      setLoading(false);
      if (requestApi.status === 200) {
        let resultList = requestApi?.result?.withdrawals;

        setListData((obj) => ({
          ...obj,
          list: resultList,
          total: requestApi?.result?.total,
          current: 1,
        }));
      }
    } else if (columnsType === "3") {
      requestApi = await API.balanceHistory({ params });
      setLoading(false);
      if (requestApi.status === 200) {
        let resultList = requestApi?.result?.logs;

        setListData((obj) => ({
          ...obj,
          list: resultList,
          total: requestApi?.result?.total,
          current: 1,
        }));
      }
    } else {
      requestApi = await API.depositsHistory({ params });
      setLoading(false);
      if (requestApi.status === 200) {
        let resultList = requestApi?.result?.deposits;

        setListData((obj) => ({
          ...obj,
          list: resultList,
          total: requestApi?.result?.total,
          current: 1,
        }));
      }
    }
  };
  // 翻页
  const handlePage = async (page, pageSize) => {
    let requestApi;
    const params = {
      ...paramsData,
      page: page,
      num: pageSize,
    };
    setParamsData(params);
    setLoading(true);
    if (columnsType === "2") {
      requestApi = await API.withdrawalsHistory({ params });
      if (requestApi.status === 200) {
        let resultList = requestApi?.result?.withdrawals;

        setListData((obj) => ({
          ...obj,
          list: resultList,
          total: requestApi?.result?.total,
          current: page,
        }));
        setLoading(false);
      }
    } else if (columnsType === "3") {
      requestApi = await API.balanceHistory({ params });
      if (requestApi.status === 200) {
        let resultList = requestApi?.result?.logs;

        setListData((obj) => ({
          ...obj,
          list: resultList,
          total: requestApi?.result?.total,
          current: page,
        }));
        setLoading(false);
      }
    } else {
      requestApi = await API.depositsHistory({ params });
      if (requestApi.status === 200) {
        let resultList = requestApi?.result?.deposits;

        setListData((obj) => ({
          ...obj,
          list: resultList,
          total: requestApi?.result?.total,
          current: page,
        }));
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    form.setFieldsValue({ ["time"]: "" });
    handleSearch(paramsData);
  }, [columnsType]);

  const handleReset = () => {
    form.resetFields();
    init();
  };
  const handleModal = (id) => {
    API.getDepositsDetails({
      url: `/pc/usercentre/deposit/${id}?id=${id}`,
    }).then((res) => {
      if (res.status === 200) {
        let resultList = res?.result;

        setDepositsDetail(resultList);
      }
    });
    setIsModalVisible(true);
  };

  const typeData = (index) => {
    return balanceTypeMap[index];
  };
  return (
    <div>
      <div className={styles.TopCard}>
        <h3 className={styles.title}>交易记录</h3>
        <div className={styles.remark}>当前系统支持查询最近30日的交易记录</div>
        <Form onFinish={handleSearch} initialValues={{ view: "1" }} form={form}>
          <div className={styles.search}>
            <FormItem label="查看" name="view">
              <Select style={{ width: "240px" }} onChange={handleEggle}>
                <Select.Option key="1">存款记录</Select.Option>
                <Select.Option key="2">取款记录</Select.Option>
                <Select.Option key="3">余额记录</Select.Option>
              </Select>
            </FormItem>

            <div />
          </div>
          <div className={styles.search}>
            <div>
              <FormItem label="时间" name="time">
                <RangePicker style={{ width: "240px" }} />
              </FormItem>
            </div>
            <div>
              <Button className={styles.searchBtn} htmlType="submit">
                搜索
              </Button>
              <Button
                className={styles.Btn}
                onClick={() => {
                  handleReset();
                }}
                style={{ marginLeft: "8px" }}
              >
                重置
              </Button>
            </div>
          </div>
        </Form>
      </div>
      <div style={{ marginTop: "20px", width: "100%" }}>
        <Table
          columns={columnsList}
          dataSource={listData.list}
          scroll={{ x: "100%" }}
          pagination={false}
          loading={loading}
        />
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <Pagination
            current={listData.current}
            onChange={handlePage}
            total={listData.total}
            pageSize={10}
          />
        </div>
      </div>

      {isModalVisible && (
        <Modal
          title={<div>入金信息</div>}
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          closable={false}
        >
          <div>
            {depositsDetail.order && (
              <div>
                <h3 className={styles.title}>订单号</h3>
                <div>{depositsDetail.order}</div>
              </div>
            )}
          </div>
          <div>
            {depositsDetail.bank && (
              <div>
                <h3 className={styles.title}>收款银行</h3>
                <div>{depositsDetail.bank}</div>
              </div>
            )}
          </div>
          <div>
            {depositsDetail.card && (
              <div>
                <h3 className={styles.title}>银行卡号</h3>
                <div>{depositsDetail.card}</div>
              </div>
            )}
          </div>
          <div>
            {depositsDetail.amount && (
              <div>
                <h3 className={styles.title}>实际金额</h3>
                <div>￥{depositsDetail.amount}</div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TradeRecord;
