import React from "react";
import styles from "./styles.module.scss";
import androidBtnPng from "@/assets/home/android-button.png";
import iosBtnPng from "@/assets/home/ios-button.png";
import androidPng from "@/assets/home/android.png";
import iosPng from "@/assets/home/ios.png";
import qrPng from "@/assets/home/qr.png";
import homePng from "@/assets/home/home.png";
import API from "@/api/home.api";
import { useEffect,useState } from 'react';
import { useSelector } from "react-redux";
const CompontentBox = () => {
  const [downloadInfo,setdownloadInfo]=useState({})
  useEffect(()=>{
    initData();
  },[])
  const initData = async ()=>{
    let res = await API.configure();
    if(res.isError){
      return
    }
    setdownloadInfo(res)
  }
  let gotPath = ()=>{
    const w=window.open('about:blank');
    w.location.href=downloadInfo.app
  }
  const configure = useSelector((state) => state.app.configure);
  const  openNewTab =()=> {
     const newWindow = window.open();
     newWindow.location.href = this.appDownloadPath;
   }
 
  return (
    <div className={styles.cWrap}>
      <div className={styles.section}>
        <div className={styles.homeCon}>
          <div className={styles.homeImgV}>
            <img className={styles.homeImg} src={homePng}></img>
          </div>

          <div className={styles.rightConV}>
            <div className={styles.title}>一切精彩尽在掌握</div>
            <div className={styles.detitle}>
              移动设备 iOS/Android 版本持续更新
            </div>
            <div className={styles.qrImgV}>
              <img
                className={styles.qrImg}                
                src={qrPng}
              ></img>
            </div>

            <div className={styles.iosandV} onClick={()=>{openNewTab()}}>
              <div className={styles.iosImgV}>
                <img className={styles.iosImg} src={iosPng}></img>
              </div>
              <div className={styles.andImgV}>
                <img className={styles.andImg} src={androidPng}></img>
              </div>
            </div>

            <div className={styles.loadDesc}>
              安装好 APP 后请按提示步骤操作,否则无法正常使用
            </div>

            <div className={styles.btns}>
              <div className={styles.iosBtnV}>
                <img className={styles.iosBtn} src={iosBtnPng} onClick={()=>{gotPath()}}></img>
              </div>
              <div className={styles.andBtnV}>
                <img className={styles.andBtn} src={androidBtnPng} onClick={()=>{gotPath()}}></img>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompontentBox;
