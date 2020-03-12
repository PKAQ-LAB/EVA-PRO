import React from 'react';
import { connect } from 'dva';
import { Redirect } from 'umi';
import { stringify } from 'querystring';
import Cookies from 'universal-cookie';
import { ConnectState, ConnectProps } from '@src/models/connect';
import { CurrentUser } from '@src/models/user';
import PageLoading from '@src/components/PageLoading';
import defaultSettings from '@config/defaultSettings';

const cookies = new Cookies();

interface SecurityLayoutProps extends ConnectProps {
  loading?: boolean;
  currentUser?: CurrentUser;
}

interface SecurityLayoutState {
  isReady: boolean;
}

class SecurityLayout extends React.Component<SecurityLayoutProps, SecurityLayoutState> {
  state: SecurityLayoutState = {
    isReady: false,
  };

  componentDidMount() {
    this.setState({
      isReady: true,
    });
  }

  render() {
    const { isReady } = this.state;
    const { children, loading } = this.props;

    const token = cookies.get(defaultSettings.token_key);

    const isLogin = token;
    const queryString = stringify({
      redirect: window.location.href,
    });

    if ((!isLogin && loading) || !isReady) {
      return <PageLoading />;
    }

    if (!isLogin && window.location.pathname !== '/user/login') {
      return <Redirect to={`/user/login?${queryString}`} />;
    }
    return children;
  }
}

export default connect(({ loading }: ConnectState) => ({
  loading: loading.models.user,
}))(SecurityLayout);
