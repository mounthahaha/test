import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { getActivity } from '@/store/modules/activity';
import styles from "./styles.module.scss";
import {useLocation } from 'react-router-dom';

const Promotion = () => {
  const [preferData, setPreferData] = useState([]);
  const [title, setTitle] = useState('');

  let {id} = useLocation().state;

  const activityList = useSelector((state) => {
    return state.activity.activityInfo.list;
  });

  const dispatch = useDispatch();

  const [details, setDetails] = useState({ title: '', mobile_image_url: '' });

  useEffect(() => {
    if (!activityList.length) {
      dispatch(getActivity())
    }
  }, [activityList.length]);

  useEffect(() => {
    const info = activityList.find(el => el.id === Number(id))
    info && setDetails(info)
  }, [id, activityList]);

  return (
    <div className={styles.promotionWrap}>
      <div className={styles.itemBgV}>
       <article>
         <h1 className={styles.title}>{details.title}</h1>
         <div className={styles.conMesV}>
           {/* <div dangerouslySetInnerHTML={{__html:preferData}}/> */}
           <img src={`/${details.pc_image_url}`} alt="" />
         </div>
       </article>
      </div>
    </div>
  );
};

export default Promotion;
