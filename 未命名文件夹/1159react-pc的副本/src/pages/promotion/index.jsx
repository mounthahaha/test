import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { getActivity } from '@/store/modules/activity';
import styles from "./styles.module.scss";
import { useNavigate } from "react-router-dom";

const Promotion = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const activityList = useSelector((state) => {
    return state.activity.activityInfo.list;
  });

  // const activityStatus = useSelector((state) => {
  //   return state.activity.activityStatus;
  // });


  useEffect(() => {
    dispatch(getActivity())
  }, []);

  const promotionTap = (ele) => {
    navigate('/promotionDetail',{state:{id:ele.id,title:ele.title}})
  }

  return (
    <div className={styles.promotionWrap}>
      <div className={styles.itemBgV}>
        {activityList.map((ele, index) => {
          return (
            <div className={styles.itemImgV} key={index} onClick={promotionTap.bind(null,ele)}>
              <img className={styles.itemImg} src={`/${ele.pc_list_image}`} alt=""></img>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Promotion;
