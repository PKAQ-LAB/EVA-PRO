// src/hocs/withAuth.jsx
import { Navigate } from 'umi'

const withAuth = (Component) => ()=>{
  const { isLogin } = useAuth();
  if (isLogin) {
    return <Component />;
  } else{
    return <Navigate to="/login" />;
  }
}

export default withAuth;
