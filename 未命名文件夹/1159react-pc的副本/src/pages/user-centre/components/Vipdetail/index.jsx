import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper";
import "swiper/css";
import backPng from "@/assets/common/back.png";
import styles from "./styles.module.scss";
import { vipList, vipList2 } from './data';
import { useNavigate } from "react-router-dom";
import API from "@/api/account.api"
import {tranNumber} from '@/utils'

const defaultData = {
  betMultiple: 50,
  created: "2021-08-31T00:00:00+08:00",
  dailyWithdraw: 49999,
  dailyWithdrawTimes: 5,
  flowConditions: 0,
  id: 1,
  keepFlowConditions: 0,
  keepRechargeConditions: 0,
  promotionRewards: 0,
  promotionRewardsPeriod: "1D",
  rebate_multiple: 0.0032,
  rechargeConditions: 0,
  rechargeOffer: 0,
  updated: "2022-04-11T19:32:39+08:00",
  vipLv: 0,
  vipLvDesc: "VIP0"
}

const Vip = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1)
  }
  const [vipInfo, setVipInfo] = useState([defaultData]);

  const fetchVipInfo = async () => {
    let res = await API.getCurrenVip();
    if(res.status != 200) return;
    setVipInfo(res.result.list);
  }

  useEffect(() => {
    fetchVipInfo()
  }, [])

  const SwiperSlides = (props) => (
    <div className={styles.swipItem}>
      <div className={styles.vip}>
        <div className={styles.vipLevel}>{props.vipLvDesc}</div>
        <div className={styles.vipLevelImgV}>
          <img className={styles.vipLevelImg} src={require(`./assets/vip-${props.vipLv}.png`)}></img>
        </div>
      </div>
      <div className={styles.conditionsNumV}>
        <div className={styles.conditionsItemV}>
          <div className={styles.conditionsNumber}>{tranNumber(props.rechargeConditions)}</div>
          <div className={styles.conditionsTitle}>累计存款</div>
        </div>
        <div className={styles.conditionsItemV}>
          <div className={styles.conditionsNumber}>{tranNumber(props.flowConditions)}</div>
          <div className={styles.conditionsTitle}>累计有效流水</div>
        </div>
        <div className={styles.conditionsItemV}>
          <div className={styles.conditionsNumber}>{tranNumber(props.keepFlowConditions)}</div>
          <div className={styles.conditionsTitle}>保级有效流水</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.vipDetailWarp}>
      <div className={styles.pageTitleV}>
        <div className={styles.titleV}>
          <div className={styles.backImgV} onClick={handleBack}>
            <img className={styles.backImg} src={backPng}></img>
            <span className={styles.title}>VIP详情</span>
          </div>          
        </div>

        <div className={styles.carItemV}>
          <Swiper
            spaceBetween={10}
            slidesOffsetBefore={-80}
            slidesPerView={"auto"}
            loop={true}
            onSlideChange={() => console.log("slide change")}
            onSwiper={(swiper) => console.log(swiper)}
            modules={[EffectCoverflow]}
            effect="coverflow"
          >
            {vipInfo.map(ele => {
              return  <SwiperSlide key={ele.vipLv}>
                <SwiperSlides {...ele} />
              </SwiperSlide>
            })}          
          </Swiper>
        </div>
      </div>

      <div className={styles.botmV}>
        <div className={styles.welfareV}>
          <div className={styles.welfareTitle}>
            <b>冠军体育VIP尊享福利</b>
          </div>
          <p className={styles.welfareDeTitle}>活动条件</p>
          <p className={styles.welfareMes}>活动对象：冠军体育全站会员</p>
          <p className={styles.welfareDeTitle}>活动内容</p>
          <p className={styles.welfareMes}>
            加入冠军体育，体现尊贵，彰显品位，尽享VIP专属礼遇。领取生日礼金和每月红包。
          </p>
        </div>

        <div className={styles.backRateV}>
          <div className={styles.backTitle}>
            <div className={styles.backLine}></div>
            <div className={styles.backRateTitle}>VIP返水比例</div>
          </div>
          <div className={styles.tableBgV}>
            <table>
              <thead>
                <tr>
                  <th className={styles.titles}>会员等级</th>
                  <th>累计存款</th>
                  <th>累计有效流水</th>
                  <th>保级有效流水</th>
                  <th>反水比例</th>
                </tr>
              </thead>
              <tbody>
                {vipInfo.map(item => {
                  return <tr key={item.vipLv}>
                    <td className={styles.strong}>{item.vipLvDesc}</td>
                    <td>{tranNumber(item.rechargeConditions)}</td>
                    <td>{tranNumber(item.flowConditions)}</td>
                    <td>{tranNumber(item.keepFlowConditions)}</td>
                    <td>{((item.rebate_multiple*100).toFixed(2))}%</td>
                  </tr>
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.backTitle}>
            <div className={styles.backLine}></div>
            <div className={styles.backRateTitle}>VIP每月红包</div>
          </div>
          <div className={styles.tableBgV}>
            <table>
              <thead>
                <tr>
                  <th className={styles.titles}>会员等级</th>
                  <th>升级礼金</th>
                  <th>生日礼金</th>
                  <th>上半月红包</th>
                  <th>下半月红包</th>
                </tr>
              </thead>
              <tbody>
                {vipList2.map(item => {
                  return <tr key={item.vip}>
                    <td className={styles.strong}>{item.vip}</td>
                    <td>{item.state1}</td>
                    <td>{item.state2}</td>
                    <td>{item.state3}</td>
                    <td>{item.state4}</td>
                  </tr>
                })}                
              </tbody>
            </table>
          </div>

          <div className={styles.ruleV}>
            <div className={styles.ruleTitle}>活动规则</div>
            <ul>
              <li>
                1.晋升标准：会员的累计存款以及累计投注额达到相应级别的要求，即可在次日24点前晋级相应VIP等级；
              </li>
              <li>2.晋升顺序：VIP等级达到相应的要求可每天晋升1级，</li>
              <li>
                3.保级要求：会员在达到某VIP等级后，90天内投注需要完成保级要求。如果在此期间完成晋升，保级要求重新按照当前等级计算；
              </li>
              <li>
                4.降级标准：如果会员在1个季度（90天计算）内没有完成相应的保级要求流水，系统会自动降级1个等级，相应的返水及其它优惠也会随之调整至降级后的等级；{" "}
              </li>
              <li>
                5.升级礼金：升级礼金在会员达到该会员级别后系统自动派发，每个级别的升级礼金每位会员仅能获得1次（升级礼金1倍流水即可提款）；
              </li>
              <li>
                6.返水计算周期：前一天00:00-24:00（北京时间）的返水报表，返水于每日北京时间00:00开始陆续派发，需要找在线客服申请，返水仅需一倍有效流水即可提款，反水金额=(日总有效流水-某些特定优惠活动需要完成的有效流水)*返水比例{" "}
              </li>
              <li>
                {" "}
                7.生日礼金：会员在注册3个月内过生日，今年将不能领取生日礼金。另注册时间大于3个月的会员需在生日当天的VIP页面进行自助领取，每年可领取1次（生日彩金1倍流水即可提款）；{" "}
              </li>
              <li>
                {" "}
                8.每月红包：会员在上个月存款≥1000元，即可在本月1日和15日到VIP特权页领取相应等级的红包彩金（每月红包彩金1倍流水即可提款）。
                领取时间如下：{" "}
              </li>
              <li>
                上半月红包：
                <ol>
                  <li>
                    -
                    VIP1-VIP5（包含降级到VIP0用户）每月1日01:00:00开启-14日23:59:59截止
                  </li>
                  <li>- VIP6~VIP10每月1日13:00:00开启-14日23:59:59截止</li>
                </ol>
              </li>
              <li>
                下半月红包：
                <ol>
                  <li>
                    -
                    VIP1-VIP5（包含降级到VIP0用户）每月15日01:00:00开启-当月最后一天的23:59:59截止
                  </li>
                  <li>
                    -
                    VIP6~VIP10每月15日13:00:00开启-当月最后一天的23:59:59截止；
                  </li>
                </ol>
              </li>
              <li>
                {" "}
                9.晋级优惠：会员可在VIP特权页面进行申请，申请晋级优惠后开始计算活动有效流水。此优惠不与平台其他优惠共享，仅与返水优惠共享。有任何疑问请咨询7x24小时在线客服；{" "}
              </li>
              <li>
                10.每个等级的VIP晋级优惠仅支持指定场馆申请（只可申请符合当前等级的晋级优惠）；
              </li>
              <li>11.冠军体育保留对活动的修改、停止及最终解释权。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vip;
