import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import styles from './index.less';

/**
 * 内页100%高度
 */
const Page = ({ className, children, inner = false }) => ({
  render() {
    return (
      <div
        className={classnames(className, {
          [styles.contentInner]: inner,
        })}
      >
        {children}
      </div>
    );
  },
});

Page.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  inner: PropTypes.bool,
};

export default Page;
