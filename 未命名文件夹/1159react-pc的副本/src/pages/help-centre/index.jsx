import React, { useState, useEffect } from "react";
import styles from "./styles.module.scss";
import API from "@/api/help.api";
import { useNavigate, useParams } from "react-router-dom";
import { TeamOutlined,
  MessageOutlined,
  BarsOutlined,
  EditOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  CopyOutlined,
  MobileOutlined,
} from '@ant-design/icons';
import { Spin } from "antd";

const HelpCentre = () => {
  const navigate = useNavigate();
  const { code } = useParams();

  const [helps, setHelps] = useState([]);
  const [loading, setLoaing] = useState(false);
  const [loadingList, setLoaingList] = useState(false);
  const [detail, setDetail] = useState({});
  const [title, setTitle] = useState('');
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    loadAbout(code);
  }, [code]);

  const icons = {
    about: <TeamOutlined />,
    problem: <MessageOutlined />,
    features: <BarsOutlined />,
    terms: <EditOutlined />,
    disclaimer: <FileTextOutlined />,
    policies: <ExclamationCircleOutlined />,
    rules: <CopyOutlined />,
    agreement: <MobileOutlined />,
  }

  const load = async () => {
    setLoaingList(true);
    const res = await API.help();
    setLoaingList(false);
    if (res.isError) {
      return;
    } else {
      if ( Array.isArray(res.result) ) {
        setHelps(res.result);
      }
    }
  };
  const loadAbout = async (code) => {
    setLoaing(true)
    const res = await API.helpDetail({urlParams:{code}});
    setLoaing(false)
    if (res.isError) {
      return;
    } else {
      if ( res.result ) {
        setDetail(res.result);
        setTitle(res.result.title)
      }
    }
  };

  const handleItem = (ele) => {
    setTitle(ele.title)
    navigate(`/help-centre/${ele.code}`)
  }

  const promotionTap = (ele) => {
    navigate('/promotionDetail',{state:{id:ele.id,title:ele.title}})
  }

  return (
    <div className={styles.helpCentre}>
      <div className={styles.helpCentreWrap}>
        <div className={styles.wLeft}>
          <Spin spinning={loadingList}>
            <div className={styles.leftList}>
              {helps.map(ele=>{
                return <div className={styles.listItem} onClick={handleItem.bind(null,ele)}>
                  <span className={styles.itemIcon}>{icons[ele.code]}</span>
                  {ele.title}
                </div>
              })}
            </div>
          </Spin>
        </div>
        <div className={styles.wRight}>
          <div className={styles.rightContent}>
            <div className={styles.cHeader}>
              <div className={styles.cTitle}>{title}</div>
            </div>          
            <div className={styles.cContent}>
              <Spin spinning={loading}>
                <span dangerouslySetInnerHTML={{__html:detail.content}}></span>
              </Spin>              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCentre;
