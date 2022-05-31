import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux"

const RequireAuth = ({ children }) => {
  const authed = useSelector(({user}) => user.login);

  // 跳转到登录
  return authed ? children : <Navigate to="/login" replace />;
};

export default RequireAuth;