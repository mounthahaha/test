import {  Form, Modal, Row, Col, Button  } from "antd";
import React, { useState, useImperativeHandle } from "react";
import {gameTitleMap} from './gameTitleMap'
import {formatDate} from '@/utils/formUltls'


const ModalDetails = (props,ref) => {
  const hideItem = ['CellScore', 'LineCode', 'ChannelID', 'MRate', 'Odds', 'OrderNo', 'SRate', 'DataType', 'Type', 'ID', 'Jackpotcomm']
  const oddTypes = ['', '欧洲盘', '香港盘', '馬来盘', '印尼盘', '分数式']
  const stats =['', '进行中', '赢', '平局退款', '回滚退款', '提前结算', '输', '订单补正']

  const [detail, setDetail] = useState([]);
   
  let [isModalVisible, setisModalVisible] = useState(false);
  useImperativeHandle(ref, ()=>({
    changeModal:setisModalVisible,
    setInfoData:(item)=>{
      // console.log(item)
      if (!item.contents) return {};
      const contents = JSON.parse(item.contents);
      let detailData = {}
      if (item.detail_json) {
        const { GameName, Rule } = contents;
        const sport = JSON.parse(item.detail_json);
        detailData.sport = {
          ...sport[0],
          GameName,
          Rule,
        };
      } else {
        delete detailData.sport;
      }
      for (let key in contents) {
        // 過濾資料
        if (hideItem.indexOf(key) < 0 && gameTitleMap[key]) {
          detailData[key] = { title: gameTitleMap[key], value: contents[key] };
        }
      }
      console.log(detailData)
      setDetail(detailData)
    }
  }))

  const formatDateAdd8Hours = value => {
    if (!value || value == '0001-01-01T00:00:00Z') return '--';
    const date = formatDate(new Date(value.replace(/[-]/gi, '/')));
    return date;
  };

  const rowRender = () => {
    return (
      Object.keys(detail).map((k, index) => {
        let dom = ''
        if (k === 'Platform') {
          dom = <Col span={8}>{ formatDate(detail[k].value) }</Col>
        } else if (k === 'BetTime' || k === 'EndTime') {
          dom = <Col span={8}>{ formatDateAdd8Hours(detail[k].value) }</Col>
        } else if (k === 'Numbers') {
          dom = <Col span={8}>
            {detail[k].value.map((num, k) => {
              return (
                <Button type="info" size={'small'}>
                  { num }
                </Button>
              )
            })}
          </Col>
        } else {
          dom = <Col span={8}>{ detail[k].value }</Col>
        }

        return (
          <Row key={k+index}>
            <Col span={4}>
              <span>{ detail[k].title }</span>
            </Col>
            
            {dom}

            <Col span={12}></Col>
          </Row>
        )
      })
    )
  }

  const formRender = () => {
    return (
      <div>
        <h3>
          { detail.sport.GameType }
        </h3>
        <h4>{ detail.sport.Oddsname } @ { detail.sport.Odds }&nbsp;&nbsp;{ oddTypes[detail.sport.Oddstype] }</h4>

        <h4>盘口：</h4>
        <div>
          <p>{ detail.sport.Bettype }({ detail.sport.Eventpart} )</p>
          <p>{ detail.sport.P1 } vs. { detail.sport.P2 }</p>
          <p>{ detail.sport.Event }</p>
          <p>{ formatDate(new Date(`${detail.sport.Starttime.split(' ').join('T')}Z`)) }</p>
        </div>
        <h4>是否滚球 :</h4>
        <div>
          <p>{['否', '是'][detail.sport.Islive ? 1 : 0]}</p>
        </div>
        <h4>結果 :</h4>
        <div>
          <p>{ stats[detail.sport.Status] }</p>
        </div>
      </div>
    )
  }

  return (
    <Modal title="详情" visible={isModalVisible} footer={[]} onCancel={()=>setisModalVisible(false)}>
      <Form>
        {!detail.sport?rowRender():formRender()}
      </Form>
    </Modal>
  )
};

export default ModalDetails;
