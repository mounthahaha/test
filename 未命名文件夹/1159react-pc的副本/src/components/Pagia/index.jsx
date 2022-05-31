import React, { useState, useEffect } from "react";
import { Pagination } from 'antd';
import styles from "./styles.module.scss";
import { useNavigate } from "react-router-dom"

import banner2Png from "@/assets/common/banner2.jpeg";


const Pagia = (props) => {

  const[current, setCurrent] = useState(2)


  return (
    <div className={styles.mbs}>
      <Pagination showQuickJumper current={current} onChange={(page)=>{setCurrent(page)}} total={50} />
    </div>
  );
};

export default Pagia;
