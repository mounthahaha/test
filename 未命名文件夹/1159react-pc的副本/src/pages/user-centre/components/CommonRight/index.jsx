
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { getActivity } from '@/store/modules/activity';
import styles from "./styles.module.scss";
import nextPng from "@/assets/common/next.png";
import morePng from "@/assets/common/moreIcon.png";

import API from "@/api/account.api";

const Wallent = () => {
  const navigate = useNavigate();
  const defaultInfo = {
    deposit: "0.00",
    usdt_deposit: "0.00",
    usdt_withdrawal: "0.00",
    withdrawal: "0.00",
  };    
  // const [Yhlist, setYhlist] = useState([]);
  const [gameLIst, setgameLIst] = useState([]);

  const activityList = useSelector((state) => {
    return state.activity.activityInfo.list;
  });

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getActivity())
    Promise.all([            
      // API.getPromotionList(),
      API.usercentreGame({ params: { sort: "settle_time", asc: true } }),
    ]).then(([resGame]) => {            
      // setYhlist(resYhlist.result.list);
      let platforms = resGame.result.platforms;
      setgameLIst(
        resGame.result.games
          .slice(0, 3)
          .map((item) => ({ ...item, labName: platforms[item.game_pid] }))
      );
    });
  }, []);

  const promotionTap = (ele) => {
    navigate('/promotionDetail',{state:{id:ele.id,title:ele.title}})
  }

  return (
    <div className={styles.rightMesV}>
      <div className={styles.betRecort}>
        <div className={styles.betTitleV}>
          <div className={styles.favourTitle}>投注记录</div>
          <div className={styles.favourMoreV} onClick={() => navigate("/user-centre/bet-record")}>
            <div className={styles.favourMoreTitle}>更多</div>
            <img className={styles.favourNext} src={nextPng}></img>
          </div>
        </div>

        <div className={styles.recordV}>
          {gameLIst.map((ele, index) => {
            return (
              <div className={styles.recordItemV} key={index}>
                <div className={styles.recordTitle}>{ele.labName}</div>
                <div className={styles.recordTime}>{ele.settle_time}</div>
                <div className={styles.recordMes}>
                  {ele.rule_type}-{ele.game_name}
                </div>
                <div className={styles.recordProcess}>
                  投注 <img className={styles.favourNext} src={nextPng}></img>
                  賠率<img
                    className={styles.favourNext}
                    src={nextPng}
                  ></img>{" "}
                  結果
                </div>
                <div className={styles.recordCost}>
                  {ele.bet_amount}
                  <img className={styles.favourNext} src={nextPng}></img>
                  {ele.odds}
                  <img className={styles.favourNext} src={nextPng}></img>
                  {ele.result_amount}
                </div>
              </div>
            );
          })}
        </div>

        {gameLIst.length != 2 ? (
          <div className={styles.moreV}>
            <img className={styles.more} src={morePng} onClick={() => navigate("/user-centre/bet-record")}></img>
          </div>
        ) : (
          ""
        )}
      </div>

      <div className={styles.activeGam}>
        <div className={styles.activeBgV}>
        <div className={styles.favourTitle}>优惠活动</div>
        <div className={styles.favourMoreBox}>
          <div
            className={styles.moreTitle}
            onClick={() => navigate("/promotion")}
          >
            更多
          </div>
          <img className={styles.favourNext} src={nextPng}></img>         
        </div>
        </div>
        
        {activityList[0]?.pc_list_image ? (
          <img
            onClick={promotionTap.bind(null,activityList[0])}
            className={styles.imgs}
            src={`/${activityList[0]?.pc_image_url}`}
          ></img>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Wallent;
