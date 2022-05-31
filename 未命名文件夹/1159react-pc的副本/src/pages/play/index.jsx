
import React, { useState, useEffect } from "react";
import styles from "./styles.module.scss";
import { message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import API from "@/api/play.api"
import { useSelector } from 'react-redux';

const Play = props => {
    const [isError, setIsError] = useState(false);
    const [showUrl, setShowUrl] = useState('');
    const navigate = useNavigate();
    let params = useParams();

    const isLogin = useSelector((state) => state.user.login);
    
    const getGameUrl = async () => {
        const hide = message.loading('加载中...', 0);
        const res = await API.gameUrl({urlParams:params, params: {zone:-480}});
        hide();

        if ( res.isError ) {
            setIsError(true);
            message.error(res.error || '加载失败...')
            return;
        }
        setIsError(false);
        setShowUrl(res.link);
    }
    useEffect(() => {
        if (!isLogin) return message.error('请先登录！');     
        getGameUrl()
    },[params])
    return (
        <div>
            {!isError && <iframe scrolling="yes" height={window.innerHeight} width="100%" src={showUrl}></iframe>}
            {isError && <div className={styles.errorWrap}>
                <div className={styles.wTitle}>进入大厅失败</div>
                <div className={styles.wDesc}>进入大厅失败，请稍后再试，或联系客服</div>
                <div className={styles.wDivisiondLine}></div>
                <div className={styles.wBtnBox}>
                    <span className={styles.wBtn} onClick={()=>{navigate('/')}} >回到首页</span>
                </div>
            </div>}            
        </div>
    );
};

export default Play;
