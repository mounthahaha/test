import React, { useState, useEffect } from 'react';
import styles from './styles.module.scss'
import { UpOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import slotGameList from './slotGameList';
import titleBg from '@/assets/slotIcons/slotLobbyBanner01.png'


const MGPlay = () => {    
    let navigate = useNavigate();  
    const [showGoTop, setShowGoTop] = useState(false);

    useEffect(()=> {
        window.addEventListener('scroll', ()=> {
            const windowHeight = document.documentElement.clientHeight;
            const offsetTop = window.pageYOffset || document.documentElement.scrollTop;
            if ( windowHeight < offsetTop ) {
                setShowGoTop(true);
            } else {
                setShowGoTop(false);
            }
        })
    }, [])

    const palyTap = (item) => {
        navigate('/play/' + item.link);
    }

    const toTop = () => {
        window.scrollTo(0,0)
    }

    return <div className={styles.playWrap}>
        <div className={styles.playContent}>        
            <div className={styles.topImgV}>
                <img className={styles.topImg} src={titleBg}></img>
            </div>

            <div className={styles.wrapItemV}>
                {
                    slotGameList.map((ele, index) => {
                        return <div className={styles.wrapItem} key={index} onClick={palyTap.bind(this, ele)}>
                            <div className={styles.wrapImgV}>
                                <img className={styles.wrapImg} src={require(`@/assets/slotIcons/${ele.picture}`)}></img>
                            </div>
                            <div className={styles.wrapTitle}>{ele.name}</div>
                        </div>
                    })
                }
            </div>
            {showGoTop&&<div className={styles.goTopBox} onClick={toTop}>
                <UpOutlined />
            </div>}
            
        </div>

    </div>
}

export default MGPlay