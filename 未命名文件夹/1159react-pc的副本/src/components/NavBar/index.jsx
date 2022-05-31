import { Button, Carousel } from "antd";
import {
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./styles.module.scss";
import logoImgPng from "@/assets/header/logo.png";
import { message } from "antd";
import servicePng from "@/assets/header/nav-1.png";
import promotionPng from "@/assets/header/nav-3.png";
import appPng from "@/assets/header/nav-4.png";
import depositPng from "@/assets/header/deposit.png";
import withdrawPng from "@/assets/header/withdraw.png";
import avatarPng from "@/assets/header/avatar.png";
import API from "@/api/login.api";
import { useDispatch } from 'react-redux';
import { getGameTypes } from '@/store/modules/app';
import { useSelector } from 'react-redux';
// import _games from "@/assets/games";
import { logout } from '@/store/modules/user';


const NavBar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let location = useLocation();
  const isLogin = useSelector((state) => state.user.login);
  const gameList = useSelector((state) => state.app.gameList);
  const balanceAllInfo = useSelector((state) => state.app.balanceAllInfo);
  const configure = useSelector((state) => state.app.configure);
  const profile = useSelector((state) => state.user.profile);
  const userInfo = useSelector((state) => state.user.userInfo);
  const [showWallet, setShowWallet] = useState(false);
  const [mousemove, setMousemove] = useState(false);
  const [mousemoveName, setMousemoveName] = useState('');

  const games = [{
    menu_name: '首页',
    to: { name: 'home' },
  }, ...gameList];

  const changeMenu = (menu) => {
    if ( menu.branch ) {
      navigate(`/game-lobby/${menu.branch}`);
    } else {
      navigate('/home');
    }   
  };

  const linkTo = (path) => {
    if ( !path ) {
      const { Name, id } = userInfo;
      const url = `https://chat.guanjun703.com/kefu/5c6cbcb7d55ca?&name=${Name}&uid=${id}`;
      window.open(url);
    }
    navigate(path);
  }
  
  useEffect(() => {
    dispatch(getGameTypes())
    document.addEventListener('click', (e) => {
      if ( e.target.id && e.target.id === 'wallet-box' ) {
        return
      }
      if ( e.target.id && e.target.id === 'wallet-box-show' ) {
        setShowWallet(true)
        return 
      }
      setShowWallet(false)      
    })
  }, [])
  
  const iconMenus = [{
    id: 1,
    title: '客服',
    icon: servicePng
  },{
    id: 2,
    title: '优惠',
    icon: promotionPng,
    link: '/promotion'
  },{
    id: 3,
    title: 'APP',
    icon: appPng,
    link: '/appdownload'
  }]

  const withdrawalMenus = [{
    id: 1,
    title: '存款',
    icon: depositPng,
    link: '/user-centre/deposit'
  },{
    id: 2,
    title: '取款',
    icon: withdrawPng,
    link: '/user-centre/withdrawals'
  }]

  const logoutTap = async () => {
    const hide = message.loading('退出中...', 0);
    const res = await API.logout();
    hide()
    dispatch(logout());
  }
  const handleMouseMove = (menu) => {
    setMousemoveName(menu.branch)
    if ( menu.games && menu.games.length ) {
      setMousemove(true)
    } else {
      setMousemove(false)
    }    
  }

  const toGame = (ele) => {
    if (!isLogin) return message.error('请先登录！');
    if (ele.pc_router === '1') {
      navigate('/slotLobby')
      return 
    }
    const arr = ele.url_pc.split('/');
    const to = arr[arr.length - 1];
    if (!to) return message.error('游戏未正确配置！');
    navigate(`/play/${to}`)
  }

  // 将数组每2项分为一组
  const gameCarousel = (menu) => {
    if(!menu.games || !menu.games.length) return []
    if (menu.games.length < 3) {
      return [menu.games]
    }
    const list = []
    let current = []
    menu.games.forEach(el => {
      current.push(el)
      if (current.length === 2) {
        list.push(current)
        current = []
      }
    })
    if (current.length) {
      list.push(current)
    }
    return list
  }


  // 定义游戏走马灯箭头及方法
  const carouselNode = React.createRef()

  const carouselPrev = () => {
    carouselNode.current.prev()
  }

  const carouselNext = () => {
    carouselNode.current.next()
  }

  return (
    <div className={location.pathname === '/home' ?`${styles.navBarWrap} ${styles.fixed}` : styles.navBarWrap} onMouseLeave={()=>{setMousemove(false)}}>
      <div className={styles.navBarContainer}>
        <div className={styles.logoImgV}>
          <img className={styles.logoImg} src={logoImgPng}></img>
        </div>      
        <div className={styles.menuItemV}>
          {games.map((menu,index)=>{
            return <div key={index} onMouseMove={handleMouseMove.bind(null, menu)} className={styles.menuItem} onClick={changeMenu.bind(this, menu)}>
              <div className={styles.menuItemTitle}> {menu.menu_name}</div> 
            </div>
          })}         
        </div>
        <div className={styles.spacer}></div>
        <div className={styles.iconMenusWrap}>
          {iconMenus.map(ele=>{
            return  <div onClick={linkTo.bind(null, ele.link)} key={ele.id} className={styles.iconMenusItem}>
              <div className={styles.iconMenuIcon}>
                <img src={ele.icon} alt="" />
              </div>              
              <div className={styles.iconMenusTitle}>{ele.title}</div>
            </div>
          })}
        </div>
        <div className={styles.spacer}></div>

        {isLogin&&<div className={styles.iconMenusWrap}>
          {withdrawalMenus.map(ele=>{
            return  <div onClick={linkTo.bind(null, ele.link)} key={ele.id} className={`${styles.iconMenusItem} ${styles.withdrawal}`}>
              <div className={styles.iconMenuIcon}>
                <img src={ele.icon} alt="" />
              </div>              
              <div className={styles.iconMenusTitle}>{ele.title}</div>
            </div>
          })}
        </div>}

        {isLogin&&<div className={styles.userInfo}>
          <div className={styles.userNameBox}>
            <span className={styles.userName} onClick={linkTo.bind(null, '/user-centre/profile')}>{profile&&profile.name||'--'}</span>
            <span className={styles.userVip} onClick={linkTo.bind(null, '/user-centre/vip')}>
              <span className={styles.vip}>vip</span>
              <span className={styles.level}>{profile.vip_lv}</span>
            </span>
          </div>
          <div id="wallet-box-show" className={styles.userInfoAmount} onClick={() => { setShowWallet(!showWallet) }}>
            <span id="wallet-box-show">{configure.unit} { balanceAllInfo[0] && balanceAllInfo[0].balance || '0.00'}</span>           
          </div>
          { showWallet && <div className={styles.userInfoAmountDetail}>
            <div id="wallet-box" className={styles.userInfoAmountDetailBox}>
              {Object.keys(balanceAllInfo).map((key, index) => {
                return <div id="wallet-box" key={index} className={styles.detailItem}>{balanceAllInfo[key].name} {configure.unit} {balanceAllInfo[key].balance||'0.00'}</div>
              })}
            </div>
          </div> }                   
        </div>}

        {!isLogin&&<div className={styles.userInfo}>
          <Button style={{marginRight: '10px'}} onClick={() => navigate(`/login`)} type="success">登录</Button>
          <Button onClick={() => navigate(`/register`)}>注册</Button>
        </div>}

        {isLogin&&<div className={styles.userAvatar}>
          <img src={avatarPng} alt="" />
          <div className={styles.logOut}>
            <span onClick={()=>{logoutTap()}}>登出</span>
          </div>
        </div>}
      </div>

      {mousemove && <div className={`${styles.navExpand} ${styles.active}`}>
        {games.map((menu, index) => {
          const games = gameCarousel(menu)
          return <div className={menu.branch === mousemoveName ? `${styles.dFlex} ${styles.active}`:styles.dFlex} key={index}>
            {games.length>1&&<LeftOutlined className={styles.arrowLeft} onClick={() => carouselPrev()} />}
            {games.length>1&&<RightOutlined className={styles.arrowRight} onClick={() => carouselNext()} />}
            {menu.branch===mousemoveName&&<Carousel dots={false} ref={carouselNode}>
              {games.map((el, i) => {
                return <div key={i}>
                  {el.map((link) => {
                    return <div className={styles.navExpandItem} key={link.game_name}>
                      <img className={styles.linkImg} src={link.pic_big_pc['200']} />
                      <div className={styles.navExpandInfo}>
                        <div className={styles.infoTop}>
                          <div className={styles.titleLogo}><img src={link.logo_gray['60']} /></div>
                          <div className={styles.infoText}>
                            <h3 className={styles.infoTextTitle}>{link.game_name}</h3>
                            <h6 className={styles.infoTextDesc}>{link.sub_title}</h6>
                          </div>
                        </div>
                        <div className={styles.btnCustom} onClick={()=>{ toGame(link)}}>进入游戏</div>
                      </div>
                    </div>
                  })}
                </div>
              })}
            </Carousel>}
          </div>
        })}        
      </div>}
    </div>
  );
};

export default NavBar;
