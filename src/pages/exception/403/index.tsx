import { FormattedMessage, Link } from '@umijs/max';
import { Button, Card, Result } from 'antd';

export default () => (
  <Card variant="borderless">
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra={
        <Link to="/user/login" prefetch>
          <Button type="primary">
            <FormattedMessage id="menu.login" defaultMessage="登录" />
          </Button>
        </Link>
      }
    />
  </Card>
);
