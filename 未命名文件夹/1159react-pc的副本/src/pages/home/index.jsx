import { Carousel } from "antd";
import { useNavigate } from "react-router-dom";
import React, { useState,useEffect } from "react";
import { useDispatch } from "react-redux";
import { Modal, message } from 'antd';
import styles from "./styles.module.scss";
import homePng from "@/assets/home/home.png";
import downloadPng from "@/assets/home/download.png";
import androidBtnPng from "@/assets/home/android-button.png";
import iosBtnPng from "@/assets/home/ios-button.png";
import androidPng from "@/assets/home/android.png";
import iosPng from "@/assets/home/ios.png";
import qrPng from "@/assets/home/qr.png";
import noticePng from "@/assets/home/notice.png";
import LotteryPopular from "./commponts/LotteryPopular";
import IndexContent from "./commponts/IndexContent";
import { useParams } from 'react-router-dom';
import loginAPI from "@/api/login.api";
import API from "@/api/home.api";
import { setUserInfo } from "@/store/modules/user";

const Home = () => {
  const [carouselData, setCarouselData] = useState([]);
  const [notices, setNotices] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState();
  const [noticeContent, setNoticeContent] = useState();
  const {token} = useParams()
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    loadNoticeInfo();
    loadSpotlightsInfo()
  }, []);

  useEffect(()=>{
    console.log(token)
    if (token) {
      getApiAsHandle(token)
    }
  },[token])

  const getApiAsHandle = async (token) => {
    console.log(token)
    const res = await loginAPI.getApiAs({urlParams: { token }, params: { token }});
    console.log(res)
    if (res.isError) {
      message.error(res.error);
    } else {
      dispatch(setUserInfo(res.result));
      message.success("登录成功", 1.5, () => {
        window.location.href = '/'
      });
    }
  }

  const loadNoticeInfo = async () => {
    const res = await API.noticeApi();
    
    if (res.isError) {
      return;
    } else {
      const { status, ...others } = res;
      const _notices = Object.values(others);
      if ( _notices.length === 1 ) {
        setNotices([
          ..._notices,
          ..._notices,
        ])
      } else {
        setNotices([
          ..._notices,          
        ])
      }
    }
  };

  const loadSpotlightsInfo = async () => {
    const res = await API.spotlightsApi();

    if (res.isError) {
      return;
    } else {
      if ( Array.isArray(res.data)) {
        setCarouselData(res.data);
      }
    }
  };


  const swipeTap = (ele) => {
    const elementA = document.createElement('a');
    elementA.href = ele.link;
    elementA.target = '_blank';
    elementA.click();
  }

  const showContent = (title, content) => {
    setIsModalVisible(true)
    setNoticeTitle(title)
    setNoticeContent(content)
  }

  const noticeModal = () => {
    return (
      <Modal title={noticeTitle} visible={isModalVisible} footer={null} onCancel={() => setIsModalVisible(false)}>
        <div dangerouslySetInnerHTML={{__html: noticeContent}}></div>
      </Modal>
    )
  }

  return (
    <div className={styles.homeWrap}>      
      <div className={styles.carouselWrap}>
        <Carousel  autoplay>
          {
            carouselData.map((ele, index) => {
              return <div key={index} onClick={swipeTap.bind(null, ele)}>
                <div className={styles.carouselItemWrap}>                
                  <img src={ele.picture} alt="" />
                </div>
              </div>
            })
          }
        </Carousel>
      </div>
      
      <div className={styles.noticeConV}>
        <div className={styles.noticeCon}>
          <div className={styles.noticeImgV}>
            <img src={noticePng} className={styles.noticeImg}></img>
          </div>
          <div className={styles.noticeTitle}>尊敬的客户：</div>
          <div className={styles.noticeContent}>
            <Carousel autoplay dotPosition="right" dots={false}>
              {notices.map(ele => {
                return <div key={ele.Id} className={styles.contentItem} onClick={() => showContent(ele.Title, ele.Content)}>
                  <div className={styles.contentBox} dangerouslySetInnerHTML={{__html:ele.Content}}></div>
                </div> 
              })}                     
            </Carousel>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionImgV}>
          <img className={styles.sectionImg} src={downloadPng}></img>
        </div>
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

            <div className={styles.iosandV}>
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
                <img className={styles.iosBtn} src={iosBtnPng}></img>
              </div>
              <div className={styles.andBtnV}>
                <img className={styles.andBtn} src={androidBtnPng}></img>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LotteryPopular/>
      <IndexContent/>     
      {isModalVisible&&noticeModal()}      
    </div>
  );
};

export default Home;
