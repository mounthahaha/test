import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {Button,Progress} from "antd"
import API from "@/api/account.api"

import ss from "@/assets/userCenter/ss.png";
import xz from "@/assets/userCenter/xz.png";
import qb1 from "@/assets/userCenter/qb1.png";
import styles from "./styles.module.scss";

const Vip = () => {
  let defaultVipInfo = {
    next_vip_level_conditions:0,
    next_vip_flow_conditions:0,
    next_vip_level:0,
    current_vip_level:0,
  }
  const navigate = useNavigate();
  const [vipInfo, setVipInfo] = useState(defaultVipInfo);
  const [leaveUpArr, setleaveUpArr] = useState([
    {
      imgUrl: qb1,
      num: 0,
      cont: "每日提款次数",
    },
    {
      imgUrl: xz,
      num: 0,
      cont: "每日提款额度",
    },
    {
      imgUrl: ss,
      num: 0,
      cont: "升级礼金(晋级自动发放)",
    },
  ]);
  

  useEffect(()=>{
   initData()
  },[])
  const initData = async ()=>{
    let res = await API.getCurrenVip();
    if(res.status != 200) return;
    setVipInfo(res.result);
    let temArr = leaveUpArr.map((item,index)=>{
      let num = 0,curObj = res.result.list[res.result.current_vip_level];
      switch (index) {
        case 0:
          num = curObj.dailyWithdrawTimes;
          break;
        case 1:
          num = curObj.dailyWithdraw;
          break;
        case 2:
          num = curObj.promotionRewards;
          break;
      }
      return { ...item, num }
    });
    setleaveUpArr(temArr);
  }

  const goDetailTap = () =>{
    navigate('/user-centre/vipdetail')
    console.log('---e-e-这是222e--e-');
  }

  return (
    <div className={styles.profileWrap}>
      <div className={styles.left}>

        <div className={styles.tops}>
          <div className={styles.vipInfo}>
            <img src={require(`@/assets/userCenter/level/vip-${vipInfo.current_vip_level}.png`)} alt="" />
            <div>
              <p className={styles.leavNum}>当前等级: VIP {vipInfo.current_vip_level}</p>
              <p>您共需达成 {vipInfo.next_vip_level_conditions}元存款、{vipInfo.next_vip_flow_conditions}流水，即可升级至 VIP{vipInfo.next_vip_level}</p>
            </div>
          </div>
          <div className={styles.processCont}>
            <div className={styles.levelBox}>
              {
                [...Array(11)].map((_, index)=>(<span key={index} className={index==vipInfo.current_vip_level?styles.actSpan:''}> {'VIP'+index} </span>))
              }
            </div>
            <Progress percent={vipInfo.current_vip_level*10} showInfo={false} strokeColor="#00ad49"/>
          </div >
          <p className={styles.nextLeave}>距离下一等级：VIP{vipInfo.next_vip_level}</p>
        </div>

        <div>
          <h4 className={styles.info}>VIP{vipInfo.current_vip_level}&nbsp;&nbsp;尊享</h4>
          <div className={styles.zx}>
            {leaveUpArr.map((item) => (
              <div key={item.cont}>
                <img src={item.imgUrl} alt="" />
                <p className={styles.num}>{item.num}</p>
                <p className={styles.cont}>{item.cont}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.btnBox}>
          <h4 className={styles.info}>VIP{vipInfo.current_vip_level}&nbsp;&nbsp;晋级优惠</h4>
          <p>当前等级没有晋级优惠</p>
          <Button className={styles.btn} size="large" onClick={()=>{goDetailTap()}}>
            更多VIP特权
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Vip;
