import { Button, Table, Form, DatePicker } from "antd";
import React, { useState, useEffect ,forwardRef, useRef} from "react";
import moment from "moment";
import styles from "./styles.module.scss";
import API from "@/api/transferHistory.api";
import { formatDate } from "@/utils/formUltls";
import ModalDetails from "./components/ModalDetails"

const MyModalDetails = forwardRef(ModalDetails)
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const BetRecord = () => {
  const diaLogRef = useRef();
 
  const [listData, setListData] = useState({ total: 0, list: [] });
  const [paramsData, setParamsData] = useState({
    sort: 'settle_time',
    asc: true,
    page: 1, // 页码
    num: 20, // 条数
  }); // 查询类型

  const [platforms, setPlatforms] = useState({})

  const [sumData, setSumData] = useState({
    bet: '0.00',
    payout: '0.00',
    result: '0.00'
  })

  const init = () => {
    const params = {
      sort: 'settle_time',
      asc: true,
      page: 1, // 页码
      num: 20, // 条数
    }
    API.transferHistory({ params })
      .then((res) => {
        if (res.status === 200) {
          let resultList = res?.result?.games;
          setPlatforms(res?.result?.platforms)
          setSumData(res?.result?.sum)
          setListData((obj) => ({
            ...obj,
            list: resultList,
            total: res?.result?.total,
          }));
        }
      })
      .catch((err) => {
        setListData({ total: 0, list: [] });
      });
  }

  const handleSearch = async (values) => {
    const { time } = values
    const params = {
      ...paramsData,
      s: time && time[0] ? moment(time[0]).format('yyyy-MM-DD') : '',
      e: time && time[1] ? moment(time[1]).format('yyyy-MM-DD') : '',
    }
    const res = await API.transferHistory({ params });
    // console.log(requestApi, '555')
    // // requestApi

    if (res.status === 200) {
      let resultList = res?.result?.games;
      setPlatforms(res?.result?.platforms)
      setSumData(res?.result?.sum)
      setListData((obj) => ({
        ...obj,
        list: resultList,
        total: res?.result?.total,
      }));
    }

  }

  useEffect(() => {
    init();
  }, []);
  
  
  const columns = [
    {
      title: ' 平台 / 游戏 ',
      dataIndex: 'game_name',
      key: 'game_name',
      width: 148,
      render: (text, item) => <span>{platforms[item.game_pid]} / {text}</span>,
    },
    {
      title: ' 期 ',
      // width:'169',
      key:'round_no',
      dataIndex: 'round_no',
      render: text => <span>{text}</span>,
    },
    {
      title: ' 玩法 ',
      key: 'rule_type',
      dataIndex: 'rule_type',
      // width: 126,
      render: text => <span>{text}</span>,
    },
    {
      title: ' 投注 ',
      key: 'bet_amount',
      dataIndex: 'bet_amount',
      width: 84,
      render: text => <span>￥{text}</span>,
    },
    {
      width: 84,
      title: '  派彩  ',
      key: 'payout_amount',
      dataIndex: 'payout_amount',
      render: text => <span>￥{text}</span>,
    },
    {
      width: 84,
      title: '  结果  ',
      key: 'result_amount',
      dataIndex: 'result_amount',
      render: text => <span>￥{text}</span>,
    },
    {
      width: 165,
      title: '   投注时间   ',
      key: 'bet_time',
      dataIndex: 'bet_time',
      render: text => <span>{formatDate(text)}</span>,
    },
    {
      width: 165,
      title: ' 结算时间 ',
      key: 'settle_time',
      dataIndex: 'settle_time',
      render: text => <span>{formatDate(text)}</span>,
    },
    {
      title: '  操作  ',
      key: 'action',
      render: (rowData)=>  { 
        return (rowData.detail_json?.length&&<Button className={styles.detailBtn} onClick={() => {
          diaLogRef.current.changeModal(true); 
          diaLogRef.current.setInfoData(rowData.detail_json[0]); 
        }}> 详情</Button>)||'-'
      }
    },
  ]

  const sumDataRender = (data) => {
    return (
      <div className={styles.sumDataBox}>
        <div className={styles.sumData}>
          <p><span>总投注：</span>￥{data.bet}</p>
          <p><span>总派彩：</span>￥{data.payout}</p>
          <p><span>输赢：</span>￥{data.result}</p>
        </div>
      </div>
    )
  }

  return (
    <div >
      <div className={styles.TopCard}>
        <h3 className={styles.title}>投注记录</h3>
        <div className={styles.remark}>当前系统支持查询最近30日的交易记录</div>
        <Form
          onFinish={handleSearch}
          className={styles.search}>
          <div>
            <FormItem label='时间' name='time' style={{ marginBottom: '0' }}>
              <RangePicker style={{ width: '240px' }} />
            </FormItem>
          </div>
          <div>
            <Button className={styles.searchBtn} htmlType="submit">搜索</Button>
          </div>
        </Form>
      </div>
      <div style={{ marginTop: "20px", width:'940px' }}>
        <Table
          rowKey="id"
          scroll={{ x: '1500px' }}
          columns={columns}
          dataSource={listData.list}
          footer={() => listData.list.length?sumDataRender(sumData):''}
        />
      </div>

      <MyModalDetails ref={diaLogRef}/>
    </div>
  );
};

export default BetRecord;
