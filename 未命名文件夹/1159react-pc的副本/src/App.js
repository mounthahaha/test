
import React, { useEffect } from 'react';
import Root from './router';
import { useSelector, useDispatch } from 'react-redux';
import { getBalanceAll, getConfigure } from '@/store/modules/app';
import { getProfile } from '@/store/modules/user';
import './App.scss';
function App() {
  const login = useSelector((state) => {
    return state.user.login;
  });

  const configure = useSelector((state) => {
    return state.app.configure;
  });

  const dispatch = useDispatch();
  useEffect(() => {
    if (login) {
       dispatch(getBalanceAll());
       dispatch(getProfile())
    }    
  }, [login]);
  
  useEffect(()=>{
    dispatch(getConfigure())
  }, [])

  useEffect(()=>{
    document.title = configure.title || '冠军体育'
  }, [configure])

  return (
    <div className="App">
      <Root />
    </div>
  );
}
export default App;
