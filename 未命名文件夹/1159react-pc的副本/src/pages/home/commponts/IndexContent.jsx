import React from 'react';
import styles from "../styles.module.scss";
import meterPng from "@/assets/home/meter.png";
import servicedPng from "@/assets/home/service.png";

const meters = [
  {
    text1: 'CURRENT SPEED',
    text2: '60',
    text3: '秒',
    text4: '平均存款时间',
    text5: 'AVERAGE TIME OF DEPOSIT',
  },
  {
    text1: 'TOTALLY AMOUNT',
    text2: '80',
    text3: '家',
    text4: '合作支付平台',
    text5: 'PAYMENT PLATFORM PARTNERS',
  },
  {
    text1: 'PAYMENT',
    text2: '90',
    text3: '秒',
    text4: '平均取款时间',
    text5: 'PAYMENT PLATFORM PARTNERS',
  },
  {
    text1: 'PARTNERS',
    text2: '23',
    text3: '家',
    text4: '合作游戏平台',
    text5: 'GAMING PROVIDER PARTNERS',
  },
]

const services = [
  {
    image: require('./assets/img/common-sevice-icon-01@3x.png'),
    title: '极速存取转款',
    text: `最新技术自主研发的财务处理系统真正做到极速存、取、转独家网络优化技术，为您提供一流的游戏体验，最大优化网络延迟。`,
  },
  {
    image: require('./assets/img/common-sevice-icon-02@3x.png'),
    title: '海量赛事种类',
    text: `每天为您提供近千场精彩体育赛事，更有真人、彩票、电子游戏等多种娱乐方式选择，让您拥有完美游戏体验。`,
  },
  {
    image: require('./assets/img/common-sevice-icon-03@3x.png'),
    title: '加密安全管理',
    text: `最新技术自主研发的财务处理系统真正做到极速存、取、转独家网络优化技术，为您提供一流的游戏体验，最大优化网络延迟。`,
  },
  {
    image: require('./assets/img/common-sevice-icon-04@3x.png'),
    title: '三端任您选择',
    text: `引领市场的卓越技术，自主研发了全套终端应用，让您随时随地，娱乐投注随心所欲！7x24小时在线客服提供最贴心、最优质的服务。`,
  },
]

const CompontentBox = () => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionImgV}>
        <img className={styles.sectionImg} src={servicedPng}></img>
      </div>

      <div className={styles.tableBgV}>
        {meters.map((item, i) => {
          return <div key={i} className={styles.tableConV}>
            <div className={styles.meterImgV}>
              <img className={styles.meterImg} src={ meterPng }></img>
            </div>
            <div className={styles.tableDesc}>
              <div className={styles.tableTitle}>{ item.text1 }</div>
              <div className={styles.tableTime}>{ item.text2 }</div>
              <div className={styles.tableMins}>{ item.text3 }</div>
            </div>
            <div className={styles.timeDesc}>
              <div className={styles.timeTitle}>{ item.text4 }</div>
              <div className={styles.timeDetitle}>{ item.text5 }</div>
            </div>
          </div>
        })}
      </div>

      <div className={styles.sevConV}>
        {services.map((item, i) => {
          return <div key={i} className={styles.severV}>
            <div className={styles.iconImgV}>
              <img className={styles.iconImg} src={item.image}></img>
            </div>
            <div className={styles.severDesc}>
              <div className={styles.severTitle}>{item.title}</div>
              <div className={styles.severDetitle}>
                {item.text}
              </div>
            </div>
          </div>
        })}            
      </div>
    </div>
  );
};

export default CompontentBox;
