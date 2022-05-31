import React, { useEffect } from 'react';
import { Route, Routes, HashRouter as Router, useNavigate } from 'react-router-dom';
import UserCentre from '@/pages/user-centre';

import { routes } from "./routeConfig"
import Home from '@/pages/home';
import PageLayout from '@/components/Layout';
import BetRecord from "@/pages/user-centre/components/BetRecord";
import Betdetail from "@/pages/user-centre/components/Betdetail";
import Deposit from "@/pages/user-centre/components/Deposit";
import Notice from "@/pages/user-centre/components/Notice";
import Profile from "@/pages/user-centre/components/Profile";
import TradeRecord from "@/pages/user-centre/components/TradeRecord";
import Vip from "@/pages/user-centre/components/Vip";
import Vipdetail from "@/pages/user-centre/components/Vipdetail";
import Wallet from "@/pages/user-centre/components/Wallet";
import Withdrawals from "@/pages/user-centre/components/Withdrawals";
import GameLobby from '@/pages/gameLobby';
import SlotLobby from '@/pages/slot-lobby';
import HelpCentre from '@/pages/help-centre';
import Play from '@/pages/play';


import AddCard from '@/pages/user-centre/components/AddCard';
import AddWallet from '@/pages/user-centre/components/AddWallet';
import AddOtherWallet from '@/pages/user-centre/components/AddOtherWallet';

import RequireAuth from "./premisson"


const Redirect = ({ to }) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  });
  return null;
};

class RouterConfig extends React.Component {
  render() {
    return (
      <Router>
        <Routes>
          {routes.map(item =>
            <Route
              path={item.path}
              key={item.name}
              element={item.showMenu === false ? item.component  :<RequireAuth> <PageLayout>{item.component}</PageLayout></RequireAuth>} 
            />
          )}
          <Route path="/" index element={<Redirect to="/home" />} />
          <Route path="/as/:token" index element={<PageLayout><Home /></PageLayout>} />
          <Route path="/guest" index element={<PageLayout><Home /></PageLayout>} />
          <Route path="/game-lobby/:type" element={<PageLayout><GameLobby /></PageLayout>} />
          <Route path="/play/:id" element={<PageLayout><Play /></PageLayout>} />
          <Route path="/slotLobby" element={<PageLayout><SlotLobby /></PageLayout>} />
          <Route path="/help-centre/:code" element={<PageLayout><HelpCentre /></PageLayout>} />
          <Route path="/user-centre" element={<RequireAuth><PageLayout><UserCentre /></PageLayout></RequireAuth>} >
            <Route path="/user-centre/profile" element={<Profile />} >
              <Route path="/user-centre/profile/addCard" element={<AddCard />} />
              <Route path="/user-centre/profile/addWallet" element={<AddWallet />} />
              <Route path="/user-centre/profile/addOtherWallet" element={<AddOtherWallet />} />
            </Route>
            <Route path="/user-centre/vip" element={<Vip />} />
            <Route path="/user-centre/vipdetail" element={<Vipdetail />} />
            <Route path="/user-centre/trade-record" element={<TradeRecord />} />
            <Route path="/user-centre/bet-record" element={<BetRecord />} />
            <Route path="/user-centre/bet-record-detail" element={<Betdetail />} />
            <Route path="/user-centre/wallet" element={<Wallet />} />
            <Route path="/user-centre/notice" element={<Notice />} />
            <Route path="/user-centre/deposit" element={<Deposit />} />
            <Route path="/user-centre/withdrawals" element={<Withdrawals />}/>            
          </Route>
        </Routes>
      </Router >

    );
  }
}
export default RouterConfig;
