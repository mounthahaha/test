import { message } from 'antd';
import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import styles from "./styles.module.scss";
const Footer = () => {
  const navigate = useNavigate();  
  const userInfo = useSelector((state) => state.user.userInfo);
  const list = [
    { url: '/help-centre/about', name: '新手帮助' },
    { url: '/help-centre/about', name: '关于我们' },
    { url: 'liveChat', name: '联系我们' },
    { url: '/help-centre/problem', name: '代理加盟' },
    { url: '/help-centre/problem', name: '常见问题' },
    { url: '/user-centre/deposit', name: '存款帮助' },
    { url: '/appdownload', name: '客户端下载' },
  ]
  const handleListEle = (ele) => {
    if ( ele.url === 'liveChat' ) {      
      const { Name, id } = userInfo;
      const url = `https://chat.guanjun703.com/kefu/5c6cbcb7d55ca?&name=${Name}&uid=${id}`;
      window.open(url);
    } else {
      navigate(ele.url)  
    }    
  }
  const requireImg = (index) => require(`@/assets/footer/img/footer-${index}.png`)

  const imgList = (length) => {
    const list = []
    for (let i = 0;i < length;i++) {
      const img = i <= 9 ? <img height="35" key={i} src={requireImg(i+1)}/> : <img height="48" key={i} style={{marginRight: '15px'}} src={requireImg(i+1)}/>
      list.push(img)
    }
    return list
  }

  return (
    <div className={styles.footerWrap}>
      <div className={styles.payStyleV}>
        <div className={styles.imgBgV}>
          {imgList(15)}
        </div>
      </div>

      <div className={styles.rightDescV}>
        <div className={styles.descTitle}>
          冠军体育拥有欧洲马耳他（MGA）和菲律宾政府竞猜委员会（PAGCOR）颁发的合法执照。
        </div>
        <div className={styles.descTitle}>
          注册于英属维尔京群岛，是受国际行业协会认可的合法公司。进行注册并娱乐前，请确保您年满18周岁
        </div>
      </div>

      <div className={styles.severItemS}>
        {list.map((ele, index) => {
          return <div key={index} onClick={handleListEle.bind(null, ele)} className={styles.severItem}>{ele.name}</div>
        })}                
      </div>

      <div className={styles.rightDesc}>
        copyright © 2019@platform娛樂版权归属声明：所有版权归冠军体育所有，违者必究
      </div>
    </div>
  );
};

export default Footer;
