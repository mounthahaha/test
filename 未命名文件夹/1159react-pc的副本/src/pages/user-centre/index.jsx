
import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux"
import styles from "./styles.module.scss";
import { Outlet } from "react-router-dom";
import head from "@/assets/userCenter/head.png";
import ck from "@/assets/userCenter/ck.png";
import tk from "@/assets/userCenter/tk.png";
import zl from "@/assets/userCenter/zl.png";
import vip from "@/assets/userCenter/vip.png";
import qb from "@/assets/userCenter/qb.png";
import history from "@/assets/userCenter/history.png";
import tzjl from "@/assets/userCenter/tzjl.png";
import email from "@/assets/userCenter/email.png";
import logoutPng from "@/assets/userCenter/logout.png";
import API from "@/api/account.api";
import loginAPI from "@/api/login.api";
import { message } from "antd";
import { logout } from '@/store/modules/user';

const Setting = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const [vip_lv,setvip_lv] = useState(0);
  const [joinDays, setJoinDays] = useState(0);

  const userInfo = useSelector((state) => state.user.userInfo);

  useEffect(()=>{
    initData()
  },[])

  const getJoinDays = (created) => {
  
    if ( created ) {
      return (Math.abs(Date.now() - new Date(created).getTime()) / (1000 * 60 * 60 * 24)).toFixed(0);
    } else {
      return 0;
    }
  }
  const initData = async ()=>{
    let { result:{ vip_lv, created } } = await API.getProfile();
    const _joinDays = getJoinDays(created);
    setJoinDays(_joinDays);
    setvip_lv(vip_lv)

  }

  const logoutTap = async () => {
    const hide = message.loading('退出中...', 0);
    const res = await loginAPI.logout();
    hide();
    if (res.isError) {
      message.error(res.error);
    } else {
      dispatch(logout());
    }
  }
  const handleMenu = (ele) => {    
    if ( typeof ele === 'object' && ele.path ) {
      navigate(ele.path);
    }  else if ( ele ) {
      // navigate(ele);
      logoutTap();
    }      
  }

 

  const menus = [{
    title: '个人资料',
    icon: zl,
    path: '/user-centre/profile'
  },{
    title: 'VIP特权',
    icon: vip,
    path: '/user-centre/vip'
  },{
    title: '我的钱包',
    icon: qb,
    path: '/user-centre/wallet'
  },{
    title: '交易记录',
    icon: history,
    path: '/user-centre/trade-record'
  },{
    title: '投注记录',
    icon: tzjl,
    path: '/user-centre/bet-record'
  },{
    title: '站内信',
    icon: email,
    path: '/user-centre/notice'
  },{
    title: '立即登出',
    icon: logoutPng,
    isLogout: true
  }]

  return (
    
    <div className={styles.userInfoCont}>
      <div className={`${styles.content} maxWidth`}>
        <div className={styles.left}>
          <ul className={styles.bgClass}>
            <li className={styles.usrInfo}>
              <img className={styles.headImg} src={head} alt="" />
              <div className={styles.attention}>
                <p>{userInfo.Name}</p>
                <img className={styles.lc} src={require(`@/assets/userCenter/level/vip-${vip_lv}-2.png`)} alt="" />
              </div>
            </li>
            <li className={styles.cq}>
              <p className={styles.ck} onClick={handleMenu.bind(null, {path:'/user-centre/deposit'})}> <img src={ck} /> 存款</p>
              <p className={styles.ck} onClick={handleMenu.bind(null, {path:'/user-centre/withdrawals'})}> <img src={tk} /> 提款</p>
            </li>
          </ul>
          <ul className={styles.menus}>
            {menus.map(ele => {
              return <li key={ele.path} className={ele.path == pathname ? `${styles.active}` : ''} onClick={handleMenu.bind(null, ele)}><img className={styles.zl} src={ele.icon} alt="" /> {ele.title} </li>
            })}                                 
          </ul>
          <div className={styles.joinDays}>加入冠军体育第 {joinDays} 天</div>
        </div>
        <div className={styles.right}>
          <Outlet/>
        </div>
      </div>
    </div>
  );
};

export default Setting;
