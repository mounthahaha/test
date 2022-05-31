import { Input, Spin, message, Modal, Button } from "antd";
import React, { useState, useEffect } from "react";
import styles from "./styles.module.scss";
import API from '@/api/deposit.api';
import { uniq } from 'lodash';
import { accMul } from '@/utils';
import CommonRight from '../CommonRight';
const Deposit = () => {
  
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [methods, setMethods] = useState([]);
  const [currentMethod, setCurrentMethod] = useState(null);
  const [presets, setPresets] = useState([]);
  const [exchange, setExchange] = useState(0);
  const [payConfirmVisible, setPayConfirmVisible] = useState(false);
  
  // 付款信息
  const [payInfo, setPayInfo] = useState({});

  const getMethods = async () => {
    
    setLoading(true);
    
    const res = await API.methods();
    
    setLoading(false);
    if ( res.isError ) {
      message.error(res.error)
      return;
    }    
    if ( Array.isArray(res.result) ) {
      let _arr = res.result;

      const _other = res.result.find((ele) => ele.code === 'OTHER');
      const _otherIndex = res.result.findIndex((ele) => ele.code === 'OTHER');
      if (_otherIndex !== -1) {
        _arr.splice(_otherIndex, 1);
        _arr.push(_other);
      }

      const _exchange = res.usdt_rate ? parseFloat(res.usdt_rate) : 0;
      setExchange(_exchange);
      setCurrentMethod(_arr[0]);

      setMethods(_arr);      
    }
  }

  useEffect(() => {
    getMethods()
  }, [])

  useEffect(() => {    
    const arr = [];
    if ( currentMethod && Array.isArray(currentMethod.channels) ) {      
      currentMethod.channels.forEach(ch => {
        ch.amount_selects.forEach(n => arr.push(Number(n)));
      });
    }

    const newArr = uniq(arr.sort((a, b) => a - b))
    setPresets(newArr)

    // 切换支付方式时设置默认金额
    setAmount(newArr[0] || '')
  }, [currentMethod])

  const sourceData = [1, 1];

  const findIcon = (code) => {
    try {
      const icon = require(`./assets/${code}.png`);
      return icon;
    } catch (e) {
      return require('./assets/POINT_CARD.png');
    }
  }
  const checkValid = (channel) => {    
    const { amount_selects, amount_range } = channel;
    const amountNum = Number(amount)
    return (
      amountNum !== 0 &&
      (!amount_selects?.length || amount_selects.map(n => Number(n))?.includes(amountNum)) &&
      (!amount_range?.length || (amount_range[0] <= amountNum && amount_range[1] >= amountNum))
    );
  }
   // 全球支付
   const handleChannel = async (channel) => {
    if (!checkValid(channel)) return;
    const hide = message.loading('提交中...', 0);
    const browser_hash = localStorage.getItem('visitorId');
    let params = {
      amount: parseFloat(amount),
      id: channel.id,
      pay_type: currentMethod.code,
      currency: 'CNY',
      browser_hash
    };

    if ( currentMethod.code === 'USDT') {
      params = {
        browser_hash,
        id: channel.id,
        pay_type: currentMethod.code,
        currency: 'USDT',
        usdt_amount: parseFloat(amount),
      };
    }
    const res = await API.createOrder({
      data: params,
    });
    hide()
    if (res.isError) {
      let ErrorStr = res.error.match(/\{(.+?)\}/g);
      if (ErrorStr) {
        ErrorStr = JSON.parse(ErrorStr);        
        message.error(ErrorStr.msg)
      } else {
        message.error(res.error || '系统错误！')        
      }
      return;
    }
    
    if (res.status === 200) {         
      setPayInfo(res.result.FORM);
      setPayConfirmVisible(true);
    }
  };
  const handlePayMethod = (ele) => {
    setCurrentMethod(ele)
  }
  const handlePay = () => {
    const form = window.document.querySelector('form[name=pay]');
    if ( !form ) {
      return;
    }
    form.submit()
  }

  const payTypeName = (payItem) => {
    const mapName = {
      QQ: '钉钉',
      POINT_CARD: 'Astropay',
      USDT: '虚拟货币转账'
    }
    return mapName[payItem.code] || payItem.name;
  };

  const _randerAmountTips = (item, code) => {
    const hasAmountSelects = Array.isArray(item.amount_selects) && item.amount_selects.length
    const hasAmountRange = Array.isArray(item.amount_range) && item.amount_range.length
    const text = code === 'USDT' ? '数量' : '金额'

    if (hasAmountSelects) {
      return <div className={styles.desc}>固定{text}{item.amount_selects.join(', ')}</div>
    }

    if (hasAmountRange) {
      return <div className={styles.desc}>{text}范围{item.amount_range[0]} - {item.amount_range[1]}</div>
    }

    return ''
  }

  // 保留2位小数
  const toFix2 = num => Math.floor(accMul(num, 100)) / 100
  
  return (
    <Spin spinning={loading}>
      <div className={styles.depositWrap}>
        <div className={styles.wrapContent}>
          <div className={styles.contentHeader}>
            <div className={styles.headerTitle}>存款</div>
            <div className={styles.payInfoBox}>
              <div>支付方式 </div>
              <div className={styles.payCourse}>存款教程</div>
            </div>
            <div className={styles.payTypes}>
              <div className={styles.typesItem}>全球支付</div>            
            </div>
          </div>

          <div className={styles.payTypesBox}>
            <div className={styles.title}>选择支付类型</div>
            <div className={styles.typesBox}>
              {methods.map(ele => {
                return (
                  <div onClick={handlePayMethod.bind(null, ele)} key={ele.code} className={ele.code===currentMethod.code?`${styles.typeItem} ${styles.active}`:styles.typeItem}>
                    <img src={findIcon(ele.code)} alt="" />
                    <div className={styles.itemTitle}>{payTypeName(ele)}</div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className={styles.payInputWrap}>

            <div className={styles.tipInfo}>
              <img src={require('./assets/hint.png')} alt="" />
              为了您的资金安全，请使用绑定的姓名存款。
            </div>
            <div className={styles.inputBox}>
              <div>{currentMethod && currentMethod.code === 'USDT' ? 'USDT交易数量：' : '存款金额：'}</div>
              <div className={styles.input}>
                <Input 
                  min={0}
                  placeholder={currentMethod && currentMethod.code === 'USDT' ?'输入UDT数量':'输入金额'}
                  value={amount}
                  onChange={e => {
                    const value = e.target.value
                    if (currentMethod.code === 'USDT') {
                      let newNum = value.toString().match(/^\d+(?:\.\d{0,2})?/)[0]
                      setAmount(newNum)
                      return 
                    }
                    setAmount(value)
                  }}
                  style={{ width: '220px' }}
                />
                <span className={styles.inputTips}>建议您存入带尾数的金额（例101、503），以便存款后能更快匹配到账</span>
              </div>
            </div>
            {!!(currentMethod && currentMethod.code === 'USDT') &&  <div className={styles.exchangeBox}>
              <div className={styles.exchangeItem}>汇率：</div>
              <div className={`${styles.exchangeItem} ${styles.num}`}>{exchange}</div>
              <div className={styles.exchangeItem}>人民币交易金额：</div>
              <div className={`${styles.exchangeItem} ${styles.num}`}>{toFix2(accMul(amount, exchange))}</div>
            </div>}
            <div className={styles.presetsBox}>            
              {presets.map((option, i) => {
                return <div key={i} onClick={()=> setAmount(option)} className={option===amount? `${styles.presetsItem} ${styles.active}` : styles.presetsItem}>{option}</div>
              })}
            </div>
            <div className={styles.payChannels}>
              {!!(currentMethod && Array.isArray(currentMethod.channels)) && currentMethod.channels.map((channel, i) => {
                return <div className={checkValid(channel)? styles.channelBox : `${styles.channelBox} ${styles.disabled}`} onClick={handleChannel.bind(null, channel)}>
                  <span>{ channel.name }</span>
                  {_randerAmountTips(channel, currentMethod.code)}
                </div>
              })}
            </div>
          </div>
        </div>

        {/* 活动信息 */}
        <CommonRight/>
        <Modal width={290} title="支付确认" visible={payConfirmVisible}  onCancel={()=>setPayConfirmVisible(false)} 
          footer={[
              <Button key="back" onClick={()=>setPayConfirmVisible(false)}>
                关闭
              </Button>,
          ]}
          footer={null}>
            
          <div dangerouslySetInnerHTML={{__html:payInfo&&payInfo.length?payInfo.replace('_blank','_self'):''}}></div>
          <div className={styles.payConfirmBtn}>
            <span onClick={()=>{handlePay()}}>确认</span>
          </div>
        </Modal>
      </div>
    </Spin>
  );
};

export default Deposit;
