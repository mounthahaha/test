import { message, Modal } from "antd";
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Outlet } from "react-router-dom";
import styles from "./styles.module.scss";
import refresh from "@/assets/userCenter/refresh.png";
import selPng from "@/assets/userCenter/sel.png";
import addPng from "@/assets/userCenter/add.png";
import eyePng from "@/assets/common/eye.png";
import ceyePng from "@/assets/common/ceye.png";
import AccountAPI from "@/api/account.api";
import { accMul } from '@/utils';
import CommonRight from '../CommonRight';
import { getBalanceAll } from '@/store/modules/app';
import ModifyTk from "@/pages/user-centre/components/Profile/components/ModifyTk";
import walletAPI from "@/api/wallet.api";

const Wallent = () => {
  const userInfo = useSelector((state) => state.user.userInfo);

  const configure = useSelector((state) => state.app.configure);

  // 主钱包
  const mainWallet = useSelector((state) => {
    return state.app.mainWallet;
  });

  // 游戏钱包
  const gameWallet = useSelector((state) => {
    return state.app.gameWallet;
  });

  // 钱包明细
  const balanceAllInfo = useSelector((state) => {
    return state.app.balanceAllInfo;
  });

  const dispatch = useDispatch();
  const rate = configure.usdt_buying_rate;
  
  const ModifyTkRef = useRef();

  const withdrawalTypes = [
    {
      title: '银行卡',
      id: 1,
      en: 'bank'
    }, {
      title: 'USDT',
      id: 2,
      en: 'USDT'
    }, {
      title: '欧币',
      id: 3,
      en: 'OKPAY'
    }, {
      title: '淘币',
      id: 4,
      en: 'TOPAY'
    },
  ]

  const [depositedCurrency, setDepositedCurrency] = useState({
    USDT: false,
    TOPAY: false,
    OKPAY: false
  })

  const [withdrawlMap, setWithdrawlMap] = useState({ USDT: [], OKPAY: [], TOPAY: [], bank: [] })
  const [withdrawalType, setWithdrawalType] = useState('bank');
  const [currentWithdrawl, setCurrentWithdrawl] = useState([])
  const [currentWithdrawlName, setCurrentWithdrawlName] = useState('银行卡')
  const [withdrawalTotal, setWithdrawalTotal] = useState(0.0);
  // const [allInfo, setAllInfo] = useState({ result: {}, map: {} });  
  const [pswShow, setPswShow] = useState(true);
  const [canSubmit, setCanSubmit] = useState(false); 
  const [currentCard, setCurrentCard] = useState(null);
  const [monyValidatInfo, setmonyValidatInfo] = useState('');
  const [formInfo, setFormInfo] = useState({
    amount: '',    
    password: '',    
    name: '',
  })

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getBalanceAll())
    initdata();
    getDepositedCurrency()
    ModifyTkRef.current.totalShow(!userInfo.w);
  }, []);

  const loadWithInfo = async () => {
    let res = await AccountAPI.getWalletAll();
    if (!res.isError) {
      setWithdrawalTotal(res.APP.total);  
    }
  };

  const initdata = async () => {
    loadWithInfo();
    let [res, resProfile] = await Promise.all([
      AccountAPI.banklist(),
      AccountAPI.getProfile(),
    ]);
    if (Array.isArray(res.result)) {
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
      setWithdrawlMap({
        ...withdrawlMap,
        ...payType,
        bank
      })
      setCurrentWithdrawl(bank)
    }     
    handleFormInfoChange({name: resProfile.result.username})    
  };

  const getDepositedCurrency = async () => {
    const {result} = await walletAPI.getDepositedCurrency()
    setDepositedCurrency({
      ...depositedCurrency,
      ...result
    })
  }

  const handleRecycle = async () => {
    const hide = message.loading('回收中...', 0);
    const res = await walletAPI.balance();
    dispatch(getBalanceAll());
    hide()
    if (res.isError) {
      message.error(res.error);
    }
  }

  const handleFormInfoChange = (params) => {
    const data = {...params}
    const [keys, val] = Object.entries(params)[0]
    // console.log(keys, keys === 'amount' , ['TOPAY', 'OKPAY'].includes(withdrawalType))
    if (keys === 'amount'&&['TOPAY', 'OKPAY'].includes(withdrawalType)) {
      const newVal = val.replace(/[^0-9]/g, '')
      data.amount = newVal
    }
    setFormInfo({
      ...formInfo,
      ...data
    })
  }

  const handleWithdrawalTypeChange = (item) => {
    if (['TOPAY', 'OKPAY', 'USDT'].includes(item.en)&&!depositedCurrency[item.en]) {
      Modal.warning({
        title: '温馨提示',
        content: `您需要进行过${item.title}充值，才可使用${item.title}取款`,
      }); 
      return false
    }
    setWithdrawalType(item.en);
    setCurrentWithdrawlName(item.title.replace('取款', ''))
    setCurrentWithdrawl(withdrawlMap[item.en])
    handleFormInfoChange({
      card: null
    })
    
    setFormInfo({
      ...formInfo,
      amount: ''
    })
    setmonyValidatInfo('')
  };

  const gotPath = () => {
    const path = {
      bank: '/user-centre/profile/addCard',
      USDT: '/user-centre/profile/addWallet',
      TOPAY: '/user-centre/profile/addOtherWallet?type=TOPAY',
      OKPAY: '/user-centre/profile/addOtherWallet?type=OKPAY'
    }[withdrawalType]
    navigate(path)
  };

  const getAmountValid = () => {
    let tips = ''
    let isValid = false;
    if ( withdrawalType === 'bank' ) {
      if ( !formInfo.amount || formInfo.amount <= 0 ) {
        tips = '请输入正确金额'
      } else if ( parseFloat(formInfo.amount) > parseFloat(withdrawalTotal) ) {
        tips = `提现金额超出您的总余额，可提现¥: ${withdrawalTotal}`;
      } else {
        isValid = true;
      }
    } else {
      if ( !formInfo.amount || formInfo.amount <= 0 ) {
        tips = `请输入正确的${currentWithdrawlName}数量`
      } else if ( parseFloat(formInfo.amount) > parseFloat(withdrawalTotal) ) {
        tips = `提现金额超出您的总余额，可提现¥: ${withdrawalTotal}`;
      } else {
        isValid = true;
      }
    }

    return { tips, isValid }
  }
  useEffect(() => {
    const { tips } = getAmountValid();
    setmonyValidatInfo(tips)
  }, [formInfo.amount])

  const handleRefresh = () => {
    initdata()
  }

  const handleSubmit = async () => {
    if ( !canSubmit ) {
      return
    }
    
    const BrowserHash = localStorage.getItem('visitorId');
    const params = {
      ...formInfo,
      amount: parseFloat(formInfo.amount),
      bank: currentCard.Bank,
      card: currentCard.Card,
      branch: currentCard.branch,
      BrowserHash
    }
    if ( withdrawalType === 'USDT' ) {
      params.amount = parseFloat(accMul(formInfo.amount, rate));
      params.usdtAccount = currentCard.Card;
    }    

    const hide = message.loading('提交中...', 0);

    if (configure.withdrawal_usdt_show_dialog == 1) {
      const res = await AccountAPI.getApiUsdtWithdrawal({});
      if (res.result.desposit) {
        const res = await AccountAPI.withdrawal({
          data: params,
        });
        if (res.isError || res.error) {
          message.error(res.error)
        } else {
          message.success('提交成功')
          dispatch(getBalanceAll());
          setTimeout(() => {
            navigate(-1);
          }, 500);
        }
      } else {
        Modal.warning({
          title: '温馨提示',
          content: '您需要进行过USDT充值，才可以使用USDT取款',
        });        
      }
    } else {
      const res = await AccountAPI.withdrawal({ data: params });
      if (res.isError || res.error) {
        message.error(res.error)
      } else {
        message.success('提交成功')
        dispatch(getBalanceAll());
        setTimeout(() => {
          navigate(-1);
        }, 500);
      }
    }
    
    hide()
  }

  useEffect(() => {
    let _canSubmit = true;
    const { isValid } = getAmountValid();

    if ( !currentCard || !currentCard.Card || !formInfo.name  || !formInfo.password || !isValid  ) {
      _canSubmit = false;
    }
    setCanSubmit(_canSubmit)

  }, [formInfo, currentCard])

  const formatTotalAmount = (num) => {
    if (num) {
      const _arr = `${num}`.split('.');
      if (_arr[1] && _arr[1].length > 2) {
        return `${_arr[0]}.${_arr[1].substring(0, 2)}`;
      }
      return num;
    }
    return 0;
  };

  // 提款方式列表
  const withdrawalTemplate = () => {
    return (
      <div className={styles.bankListV}>
        {currentWithdrawl.length === 0 && (
          <div className={styles.bankItemV} onClick={gotPath.bind(null)}>
            <div className={styles.addImgV}>
              <img className={styles.addImg} src={addPng}></img>
              <span>{`添加${currentWithdrawlName}`}</span>
            </div>
            <div className={styles.name}>
              {withdrawalType === 'bank'?'请先绑定一张银行卡，用于收款':`请先绑定${currentWithdrawlName}，用于收款`}
            </div>
          </div>
        )}
        {currentWithdrawl.map((item, index) => (
          <div className={currentCard && currentCard.Card === item.Card?`${styles.bankItemV} ${styles.active}`:styles.bankItemV} key={index} onClick={()=>{setCurrentCard(item)}}>
            <div className={styles.addImgV}>
              <img className={styles.addImg} src={addPng}></img>{" "}
              {item.Bank}
            </div>
            <div className={styles.bankNum}>{item.Card}</div>
            <div className={styles.name}>{item.Name}</div>
          </div>
        ))}
      </div>
    )
  }


  return (
    <div className={styles.wallentWarp}>
      <div className={styles.wallBgV}>
        <div className={styles.wallentMes}>
          <div className={styles.wallentTitle}>取款</div>
          <div className={styles.wallentNum}>
            <div className={styles.wallentSun}>钱包金额</div>
            <div className={styles.refreshBtnV} onClick={handleRefresh}>
              <div className={styles.refreshTitle}>刷新</div>
              <div className={styles.refreshImgV}>
                <img className={styles.refreshImg} src={refresh}></img>
              </div>
            </div>
          </div>
          <div className={styles.mainWallentV}>
            <div className={styles.mainWallentConV}>
              <div className={styles.recoveryBtn} onClick={handleRecycle}>一键回收</div>
              <div className={styles.mainWallentBgV}>
                <div className={styles.mainWallent}>
                  主钱包 <span className={styles.mtag}>¥</span>
                  <span className={styles.mNum}>{mainWallet}</span>
                </div>
                <div className={styles.lines}></div>
                <div className={styles.activeWallentV}>
                  游戏钱包 <span className={styles.mtag}>¥</span>
                  <span className={styles.mNum}>{gameWallet}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.wallDetailV}>
            <div className={styles.wallDetailTitle}>钱包明细</div>
            <div className={styles.wallbgV}>
              {Object.values(balanceAllInfo).map(({name, balance}) => {
                return (
                  <div className={styles.wallNumV} key={name}>
                    <div className={styles.wallNumber}>
                      <span>{name}</span>
                      <span>
                        <span className={styles.mtag}>¥</span>{" "}
                        <span className={styles.mNum}>{balance}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.withdTypeV}>
          <div className={styles.changeTypeV}>
            {withdrawalTypes.map((ele, index) => {
              return (
                <div
                  key={index}
                  className={
                    withdrawalType === ele.en
                      ? `${styles.bankV} ${styles.active}`
                      : `${styles.bankV}`
                  }
                  onClick={handleWithdrawalTypeChange.bind(null, ele)}
                >
                  {ele.title+'取款'}
                  {withdrawalType === ele.en && (
                    <div className={styles.selImgV}>
                      <img className={styles.selImg} src={selPng}></img>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.bankBgV}>
            {withdrawalTemplate()}

            <div className={styles.widthAmountV}>
              <div className={styles.widthTitle}>{withdrawalType=='bank'?'提现金额':`提现${currentWithdrawlName}数量`} :</div>
              <div className={styles.widthInputV}>
                <div className={styles.inputConV}>
                  <span className={styles.tagm}>{withdrawalType=='bank'&&'¥'}</span>
                  <input
                    type="number"
                    value={formInfo.amount}
                    min={0}
                    onChange={(e) => { handleFormInfoChange({                        
                      amount: e.target.value
                    })}}
                    className={styles.widthInput}
                    placeholder={withdrawalType=='bank'?'请输入正确金额':`请输入正确${currentWithdrawlName}数量`}
                  ></input>
                </div>
                <div className={styles.comNum}>{monyValidatInfo}</div>
              </div>
              {withdrawalType === 'USDT'&&
                (<div >
                  <div className={styles.ratev}>
                    换算汇率： <span className={styles.num}>{rate}</span>
                  </div> 
                  <div className={styles.ratev}>
                    换算人民币金额： <span className={styles.num}>￥{formatTotalAmount(accMul(formInfo.amount, rate)) || 0}</span>
                  </div>
                </div>)
              }
              
            </div>
            <div className={styles.widthAmountV}>
              <div className={styles.widthTitle}>卡主姓名 :</div>
              <div className={styles.widthInputV}>
                <div className={styles.inputConV}>
                  {/* <span className={styles.tagm}>¥</span> */}
                  <input
                    value={formInfo.name}
                    onChange={(e) =>
                      handleFormInfoChange({                        
                        name: e.target.value
                      })
                    }
                    className={styles.widthInput}
                    placeholder="请填写完整持卡人姓名"
                  ></input>
                </div>
                {!formInfo.name && (
                  <div className={styles.comNum}>请填写完整持卡人姓名</div>
                )}
              </div>
            </div>

            <div className={styles.widthAmountV}>
              <div className={styles.widthTitle}>取款密码</div>
              <div className={styles.widthInputV}>
                <div className={styles.inputConV}>
                  {/* <span className={styles.tagm}>¥</span> */}
                  <input
                    value={formInfo.password}
                    onInput={(e) =>
                      handleFormInfoChange({
                        password: e.target.value
                      })
                    }
                    className={styles.widthInput}
                    placeholder="请填写取款密码"
                    type={pswShow ? "password" : "text"}
                  ></input>
                  <div className={styles.eyeImgV} onClick={()=>{setPswShow(!pswShow)}}>
                    {pswShow ? (
                      <img className={styles.eyeImg} src={eyePng}></img>
                    ) : (
                      <img className={styles.eyeImg} src={ceyePng}></img>
                    )}
                  </div>
                </div>{" "}
                {!formInfo.password && (
                  <div className={styles.comNum}>请输入取款密码</div>
                )}
              </div>
            </div>

            <div className={styles.submitV}>
              <div onClick={()=>{handleSubmit()}} className={canSubmit?styles.submit:`${styles.submit} ${styles.disabled}`}>提交</div>
            </div>
          </div>        
        </div>      
      </div>
      <CommonRight/>
      <ModifyTk ref={ModifyTkRef} />
    </div>
  );
};

export default Wallent;
