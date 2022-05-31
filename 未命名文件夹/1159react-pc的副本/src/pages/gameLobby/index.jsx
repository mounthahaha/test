import React, { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { message } from "antd";
import { useParams } from 'react-router-dom';
// import games from "@/assets/games";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';

const CompontentBox = () => {
  const [tab, setTab] = useState(0)
  const { type } = useParams();
  const navigate = useNavigate();
  const gameList = useSelector((state) => state.app.gameList);
  const currentGames = gameList.find(item => item.branch == type)||{};
  const tabs = currentGames.games;
  const activeItem = (currentGames.games&&currentGames.games[tab])||{};
  const isLogin = useSelector((state) => state.user.login);
  
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

  useEffect(() => {
    setTab(0)
  }, [type])

  return (
    Object.keys(activeItem).length&&<div className={styles.cWrap}>
      <div className={styles.bgv}>
      <div className={styles.pLeft}>
        <img className={styles.videoImg} width={530} key={activeItem.pic_big_pc[600]} src={activeItem.pic_big_pc[600]}></img>
      </div>
      <div className={styles.pRight}>
        <div className={styles.kyImgV}>
          <img className={styles.kyImg} src={activeItem.title_logo}></img>
        </div>
        <div className={styles.desc}>
          {activeItem.content}
        </div>
        <div className={styles.kvlogoImgV}>
          {tabs.length&&tabs.map((ele, i)=> {
            return <div onClick={handleGame.bind(null, ele)} key={i} className={styles.kvlogoImgBox} onMouseOver={()=>setTab(i)}>
              <img className={styles.kvlogoImg} width={80} src={i===tab?ele.logo_color:ele.logo_gray[80]}></img>
              {/* <img className={i===tab? `${styles.kvlogoImg} ${styles.active} ${styles.selected}`: `${styles.kvlogoImg} ${styles.active}`} src={ele.pic_big_pc[200]}></img> */}
              <div>{currentGames.games[i].game_name}</div>
            </div>
          })}
        </div>
        
      </div>
      </div>
    </div>
  );
};

export default CompontentBox;
