
import React from "react";
import { message } from 'antd';
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.scss";
import bulbPng from "@/assets/fix-menus/bulb.png";
import micPng from "@/assets/fix-menus/mic.png";
import qrPng from "@/assets/fix-menus/qr.png";
import { useSelector } from 'react-redux';

const Advice = () => {
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.user.userInfo);
  const handleMenu = (id) => {
    if ( id === 1) {
      window.open('mailto:csgjty888@gmail.com')
    } else if ( id === 2 ) {     
      const { Name, id } = userInfo;
      const url = `https://chat.guanjun703.com/kefu/5c6cbcb7d55ca?&name=${Name}&uid=${id}`;
      window.open(url);
      
      navigate("/appdownload");
    } else {
      navigate("/appdownload");
    }
  };

  const menus = [{
    id: 1,
    icon: bulbPng
  },{
    id: 2,
    icon: micPng
  },{
    id: 3,
    icon: qrPng
  }]

  return (
    <div className={styles.Advice}>
      {menus.map(ele=>{
        return <a onClick={handleMenu.bind(null, ele.id) } key={ele.id}>
          <img src={ele.icon} alt="" />
        </a>
      })}
    </div>
  );
};

export default Advice;
