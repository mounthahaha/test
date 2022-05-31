import React, { useEffect, useState } from 'react';
import styles from "../styles.module.scss";
import hotAvtivePng from "@/assets/home/hotAvtive.png";
// import gameList from "@/assets/games";
import { useNavigate } from "react-router-dom";
// import { useDispatch } from 'react-redux';
// import { getGameTypes } from '@/store/modules/app';
import { useSelector } from 'react-redux';
import { message } from "antd";

const CompontentBox = () => {
  const [active, setActive] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  // const dispatch = useDispatch();
  const isLogin = useSelector((state) => state.user.login);
  const gameList = useSelector((state) => state.app.gameList);
  const navigate = useNavigate();
  const item =  (gameList.length&&gameList[active].games[itemIndex || 0])||{};
  const gameTypeName = gameList.length&&gameList[active].branch;

  const handleGame = (ele) => {
    if (!isLogin) return message.error('请先登录！');
    if (ele.pc_router === '1') {
      navigate('/slotLobby')
      return 
    }
    // navigate(`/gameLobby/${ele.branch}`)
    const arr = ele.url_pc.split('/');
    const to = arr[arr.length - 1];
    navigate(`/play/${to}`)
  }

  const handleItem = (index) => {
    setActive(index);
    setItemIndex(0)
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionImgV}>
        <img className={styles.sectionImg} src={hotAvtivePng}></img>
      </div>
      <div className={styles.activeBtns}>
        {gameList.map((item, i) => {
          return <div key={i} onClick={handleItem.bind(null, i)} className={active == i? `${styles.active} ${styles.activeBtn}`:styles.activeBtn}>{item.menu_name}</div>
        })}       
      </div>

      {Object.keys(item).length&&<div className={styles.activeItemV}>       
        <div className={styles.activeItemDescV}>
          <div className={styles.activeItemDescBox}>           
            <div className={styles.title_logo}><img src={item.title_logo}></img></div>
            <div className={styles.activeItemTitle}>
              { item.content }
            </div>
            <div className={styles.agConv}>
              {gameList.length&&gameList[active].games.map((link, i) => {
                return <div onClick={handleGame.bind(null, link)} className={styles.agImgV} key={i} onMouseOver={() => { setItemIndex(i) }}>
                  <img className={styles.agImg} src={link.logo_gray[70]}></img>
                  <div className={styles.agTitle}>{link.game_name}</div>
                </div>
              })}
            </div>
          </div>
        </div>
        <div className={styles.activeGreenBox}></div>
        <img className={styles.activeItemImg} key={item.pic_big_pc[550]} src={item.pic_big_pc[550]}></img>
      </div>}
    </div>
  );
};

export default CompontentBox;
