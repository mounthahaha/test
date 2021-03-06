import React, { useState, useEffect, useRef, forwardRef } from "react";
import { Input, Button, Tabs, message  } from "antd";
import { useNavigate,useLocation , } from "react-router-dom"

import {
  EditFilled,
  CheckOutlined,
} from "@ant-design/icons";
import styles from "./styles.module.scss";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "@/api/account.api"

import ModifyLogin from "./components/ModifyLogin";
import ModifyTk from "./components/ModifyTk";

const { TextArea } = Input
const { TabPane } = Tabs;
const Myseting = () => {

  const navigate = useNavigate();
  const ModifyLoginRef = useRef()
  const ModifyTkRef = useRef()

  const [isEdit, setIsedit] = useState(false);
  const [userInfor, setUserInfor] = useState({ username:'',  mobile:'' });
  const [bankList, setBankList] = useState([]);
  const [ustdList, setUstdList] = useState([]);
  const [TOPAY, setTOPAY] = useState([]);
  const [OKPAY, setOKPAY] = useState([]);

  const userInfo = useSelector((state) => state.user.userInfo);
 
  let {state} = useLocation();
  useEffect(() => {
    getUserInfo();
    loadBanksList();
  }, [state]);

  const saveUsrInfor = async ()=>{
    setIsedit(false);
    let res = await API.postApiProfile({
      data: {
        mobile: userInfor.mobile,
        username: userInfor.username,
      }
    })
    if(res.isError){
      message.error(res.error)
    }
    getUserInfo()
  }

  const setUserKey = (key,val)=> setUserInfor({ ...userInfor, [key]: val })
  
  const getUserInfo = async () => {
    let {status,result} = await API.getProfile()
    if(status == 200){
      setUserInfor({
        ...result,
        username: result.username,
        mobile: result.mobile
      })
    }
  }

  const loadBanksList = async () => { 
    const res  = await API.banklist();
    if (res.isError) {
      message.error( res.error )
      return ;
    }
    if ( Array.isArray(res.result) ) {  
      const payType = {
        USDT: [],
        TOPAY: [],
        OKPAY: []
      }
      let bank = []
      res.result.forEach(el => {
        if (payType[el.Bank]) {
          payType[el.Bank].push(el)
        } else {
          bank.push(el)
        }
      })        
      setBankList(bank)
      setUstdList(payType.USDT)
      setTOPAY(payType.TOPAY)
      setOKPAY(payType.OKPAY)
    }    
  }

  const gotPath = (path) => navigate(path);
  const showModal = (temRef) => temRef.current.totalShow(true);
  const addBankCard = ()=>{
    if(!userInfor.username){
      setIsedit(true)
      message.error('????????????????????????')
      return
    }
    gotPath('/user-centre/profile/addCard');
  }


  return (
    <div className={styles.profile}>
      <div className={styles.left}>
        <div className="perInfo">
          <h3 className={styles.title}>
            ????????????
            {isEdit ? (
              <Button type="text" onClick={()=>{saveUsrInfor()}}>
                ??????
                <CheckOutlined />
              </Button>
            ) : (
              <Button type="text" onClick={() => setIsedit(!isEdit)}>
                ??????
                <EditFilled />
              </Button>
            )}
          </h3>
          <h4 className={styles.info}>
            ????????????
            <p style={{ color: "#ff5252", fontSize: "12px" }}>
              ????????????????????????????????????????????????????????????????????????????????????{" "}
            </p>
          </h4>
          <Input
            size="large"
            bordered={false}
            readOnly={true}
            addonBefore={<p style={{ width: 80 }}> ????????????</p>}
            defaultValue={userInfo.Name}
            className={styles.inpt}
          ></Input>
          <Input
            size="large"
            bordered={isEdit}
            readOnly={!isEdit}
            addonBefore={<p style={{ width: 80 }}> ?????????</p>}
            value={userInfor.username}
            onChange={({ target: { value } })=>{setUserKey('username',value)}}
            className={styles.inpt}
          ></Input>

          <Input
            disabled
            size="large"
            bordered={isEdit}
            readOnly={!isEdit}
            addonBefore={<p style={{ width: 80 }}> ?????????</p>}
            value={userInfor.mobile}
            onChange={({ target: { value } })=>{setUserKey('mobile',value)}}
            className={styles.inpt}
          ></Input>
        </div>

        <div>
          <h4 className={styles.info}>
            ?????????
            <p style={{ color: "#ff5252", fontSize: "12px" }}>
              ???????????????????????????
            </p>
          </h4>
          {bankList.map((item, index)=>
            <Input
              size="large"
              bordered={false}
              key={item.Id}
              readOnly={true}
              addonBefore={<p style={{ width: 80 }}>{index==0?'???????????????':''}</p>}
              defaultValue={item.Card}
              className={styles.inpt}
            />
          )}  
          <Button className={styles.btns} onClick={() => addBankCard()}>???????????????</Button>
        </div>

        <div style={{paddingBottom: '60px'}}>
          <h4 className={styles.info}>
            USDT??????{" "}
            <p style={{ color: "#ff5252", fontSize: "12px" }}>
              USDT????????????????????????{" "}
            </p>
          </h4>

          {ustdList.map((item,index)=>
            <TextArea
              size="large"
              autoSize={true}
              key={item.Id}
              bordered={false}
              readOnly={true}
              addonBefore={<p style={{ width: 80 }}>{index==0?'USDT?????????':''}</p>}
              defaultValue={item.Card}
              className={styles.inpt}
            />
          )}
          
          <Button className={styles.btns} onClick={() => gotPath('/user-centre/profile/addWallet')}>??????USDT??????</Button>
        </div>

        <div>
          <h4 className={styles.info}>
            ????????????
            <p style={{ color: "#ff5252", fontSize: "12px" }}>
              ??????????????????????????????
            </p>
          </h4>
          <div className={styles.otherWallet}>
            <div className={styles.walletTitle}>????????????</div>
            <div className={styles.walletList}>
              {OKPAY.map((item, index)=>
                <Input
                  key={item.Id}
                  size="large"
                  bordered={false}
                  readOnly={true}
                  defaultValue={item.Card}
                  className={styles.inpt}
                />
              )}
            </div>
            <Button className={styles.otherBtns} onClick={() => gotPath('/user-centre/profile/addOtherWallet?type=OKPAY')}>??????????????????</Button>
          </div>
          <div className={styles.otherWallet}>
            <div className={styles.walletTitle}>????????????</div>
            <div className={styles.walletList}>
              {TOPAY.map((item, index)=>
                <Input
                  key={item.Id}
                  size="large"
                  bordered={false}
                  readOnly={true}
                  defaultValue={item.Card}
                  className={styles.inpt}
                />
              )}
            </div>
            <Button className={styles.otherBtns} onClick={() => gotPath('/user-centre/profile/addOtherWallet?type=TOPAY')}>??????????????????</Button>
          </div>
        </div>


        <div>
          <h4 className={styles.info}>??????</h4>
          <Input
            size="large"
            bordered={false}
            readOnly={true}
            addonBefore={<p style={{ width: 80 }}> ???????????????</p>}
            addonAfter={
              <Button className={`${styles.btns} ${styles.posi}`} onClick={showModal.bind(null, ModifyLoginRef)}>??????</Button>
            }
            defaultValue="********"
            className={styles.inpt}
          />
          <Input
            size="large"
            bordered={false}
            readOnly={true}
            addonBefore={<p style={{ width: 80 }}> ???????????????</p>}
            addonAfter={
              <Button className={`${styles.btns} ${styles.posi}`} onClick={showModal.bind(null, ModifyTkRef)}>??????</Button>
            }
            defaultValue="********"
            className={styles.inpt}
          />
        </div>

        <>
          <Outlet></Outlet>
        </>
      </div>

      <div className={styles.right}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="????????????" key="1"> 
            {
              bankList.length==0?<p className={styles.noaccount}> 
                ??????????????????????????????<br/> <b onClick={() => gotPath('/user-centre/profile/addCard')}>?????????</b>
              </p>:''
            }
            {
              bankList.map(item=>(
                <div className={styles.bankList} key={item.Card}>
                  <p className={styles.tit}> {item.Bank} </p>
                  <p>{item.Card}</p>
                </div>
                )
              )
            }
          </TabPane>
          <TabPane tab="???????????????" key="2">
            {
              ustdList.length==0?<p className={styles.noaccount}> 
                ????????????????????????????????????<br/> <b onClick={() => gotPath('/user-centre/profile/addWallet')}>?????????</b>
              </p>:''
            }
            {
              ustdList.map(item => <p style={{margin: '10px 0'}} className={styles.usdtP} key={item.Card}>{item.Card}</p> )
            }
          </TabPane>
        </Tabs>
      </div>
      <ModifyLogin ref={ModifyLoginRef}></ModifyLogin>
      <ModifyTk ref={ModifyTkRef}></ModifyTk>
    </div>
  );
};

export default Myseting;
