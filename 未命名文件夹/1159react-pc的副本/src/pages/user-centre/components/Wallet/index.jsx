
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { getBalanceAll } from '@/store/modules/app';
import styles from "./styles.module.scss";
import refresh from "@/assets/userCenter/refresh.png";
import ckPng from "@/assets/userCenter/ck.png";
import tkPng from "@/assets/userCenter/tk.png";
import CommonRight from '../CommonRight';
import { message } from "antd";
import API from "@/api/account.api";
import walletAPI from "@/api/wallet.api";


const Wallent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const defaultInfo = {
    deposit: "0.00",
    usdt_deposit: "0.00",
    usdt_withdrawal: "0.00",
    withdrawal: "0.00",
  };

  // 出入金明细
  const [totalInfo, settotalInfo] = useState(defaultInfo);

  // 主钱包
  const mainWallet = useSelector((state) => {
    return state.app.mainWallet;
  });

  // 游戏钱包
  const gameWallet = useSelector((state) => {
    return state.app.gameWallet;
  });

  // 钱包明细
  const balanceAllInfo = useSelector((state) => {
    return state.app.balanceAllInfo;
  });

  const toFix2 = (num) => num.toFixed(2)

  // 获取出入金明细
  const loadData = () => {
    const hide = message.loading('加载中...', 0);
    API.getWalitTotal().then((res) => {
      const {CNY, USDT} = res.total
      const totalData = {}
      // 总出入金
      if (CNY) {
        totalData.deposit = toFix2(CNY.in)
        totalData.withdrawal = toFix2(CNY.out)
      }
      // USDT出入金
      if (USDT) {
        totalData.usdt_deposit = toFix2(USDT.in)
        totalData.usdt_withdrawal = toFix2(USDT.out)
      }
      settotalInfo({
        ...totalInfo,
        ...totalData
      });
      hide()
    }).catch((e)=>{
      hide()
    });
  }

  useEffect(() => {
    loadData()
    dispatch(getBalanceAll())
  }, []);
  const handleRefresh = () => {
    loadData()
  }

  const ckTap = () => {
    navigate("/user-centre/deposit");
  };
  const tkTap = () => {
    navigate("/user-centre/withdrawals");
  };

  const handleRecycle = async () => {
    const hide = message.loading('回收中...', 0);
    const res = await walletAPI.balance();
    dispatch(getBalanceAll())
    hide()
    if (res.isError) {
      message.error(res.error);
    }
  }

  return (
    <div className={styles.wallentConV}>
      <div className={styles.wallentMes}>
        <div className={styles.wallentTitle}>我的钱包</div>
        <div className={styles.wallentNum}>
          <div className={styles.wallentSun}>资金总余额</div>
          <div className={styles.refreshBtnV} onClick={handleRefresh}>
            <div className={styles.refreshTitle}>刷新</div>
            <div className={styles.refreshImgV}>
              <img className={styles.refreshImg} src={refresh}></img>
            </div>
          </div>
        </div>
        <div className={styles.mainWallentV}>
          <div className={styles.mainWallentConV}>
            <div className={styles.recoveryBtn} onClick={handleRecycle}>一键回收</div>
            <div className={styles.mainWallentBgV}>
              <div className={styles.mainWallent}>
                主钱包 <span className={styles.mtag}>¥</span>
                <span className={styles.mNum}>{mainWallet}</span>
              </div>
              <div className={styles.lines}></div>
              <div className={styles.activeWallentV}>
                游戏钱包 <span className={styles.mtag}>¥</span>
                <span className={styles.mNum}>{gameWallet}</span>
              </div>
            </div>
          </div>
          <div className={styles.ctkV}>
            <div
              className={styles.ckV}
              onClick={() => {
                ckTap();
              }}
            >
              <div className={styles.ckImgV}>
                <img className={styles.ckImg} src={ckPng}></img>
              </div>
              <div className={styles.ckTitle}>存款</div>
            </div>
            <div
              className={styles.tkV}
              onClick={() => {
                tkTap();
              }}
            >
              <div className={styles.tkImgV}>
                <img className={styles.tkImg} src={tkPng}></img>
              </div>
              <div className={styles.tkTitle}>提款</div>
            </div>
          </div>
        </div>

        <div className={styles.wallDetailV}>
          <div className={styles.wallDetailTitle}>钱包明细</div>
          <div className={styles.wallbgV}>
            {Object.values(balanceAllInfo).map(({name, balance}) => {
              return (
                <div className={styles.wallNumV} key={name}>
                  <div className={styles.wallNumber}>
                    <span>{name}</span>
                    <span>
                      <span className={styles.mtag}>¥</span>{" "}
                      <span className={styles.mNum}>{balance}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.sunConV}>
          <div className={styles.wallSunNum}>
            总入金：
            <span className={styles.mtags}>¥</span>
            <span className={styles.mNum}>{totalInfo.deposit}</span>
          </div>
          <div className={styles.wallSunNum}>
            总出金：
            <span className={styles.mtags}>¥</span>
            <span className={styles.mNum}>{totalInfo.withdrawal}</span>
          </div>
          <div className={styles.wallSunNum}>
            总USDT入金：
            <span className={styles.mtags}>USDT</span>
            <span className={styles.mNum}>{totalInfo.usdt_deposit}</span>
          </div>
          <div className={styles.wallSunNum}>
            总USDT出金：
            <span className={styles.mtags}>USDT</span>
            <span className={styles.mNum}>{totalInfo.usdt_withdrawal}</span>
          </div>
        </div>
      </div>
      <CommonRight/>
    </div>
  );
};

export default Wallent;
