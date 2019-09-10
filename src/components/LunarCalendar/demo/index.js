/* eslint-disable no-plusplus */
import React, { Component } from 'react';
import moment from 'moment';
import styles from './index.less';

const getLunarDate = window.getLunarDate;

class CalendarBody extends Component {
  getFirstDay = (year, month) => {
    const firstDay = new Date(year, month - 1, 1);
    return firstDay.getDay();
  };

  getMonthLen = (year, month) => {
    let nextMonth = new Date(year, month, 1);
    nextMonth = moment(nextMonth)
      .subtract(1, 'days')
      .format('D');
    return nextMonth;
  };

  getCalendarTable = (year, month) => {
    const monthLen = Number(this.getMonthLen(year, month));
    const firstDay = Number(this.getFirstDay(year, month));
    const list = [[]];
    let i;
    let cur;
    let row;
    for (i = firstDay; i--; ) {
      list[0].push('');
    }
    for (i = 1; i <= monthLen; i++) {
      cur = i + firstDay - 1;
      row = Math.floor(cur / 7);
      list[row] = list[row] || [];
      list[row].push(i);
    }
    const lastRow = list[row];
    for (i = 7 - lastRow.length; i--; ) {
      lastRow.push('');
    }
    return list;
  };

  onClickCallback = (year, month, day) => {
    let date = new Date(year, month - 1, day);
    date = moment(date).format('YYYY-MM-DD');
    this.props.onSelectedChange(date);
  };

  render() {
    const { date, current } = this.props;
    // 今天
    const curDay = Number(moment(current).format('D'));

    // 本月
    const year = Number(moment(date).format('YYYY'));
    const month = Number(moment(date).format('M'));
    const table = this.getCalendarTable(year, month);
    return (
      <div className={`${styles.s11} ${styles.column}`}>
        {table.map(row => {
          const days = row.map((day, index) => {
            // 设置样式
            let className = `${styles.day} ${styles.s1} ${styles.center}`;
            if (day === curDay) {
              className += ` ${styles.cur}`;
            }
            if (index === 0 || index === 6) {
              className += ` ${styles.weekend}`;
            }
            // 农历
            let lunarDate;
            if (day) {
              const day1 = new Date(year, month - 1, day);
              lunarDate = getLunarDate(day1);
              lunarDate = (
                <span className={styles.lunar}>
                  {' '}
                  {lunarDate.month}月{lunarDate.day}{' '}
                </span>
              );
            }
            return (
              <div className={className} onClick={() => this.onClickCallback(year, month, day)}>
                {day}
                {lunarDate}
              </div>
            );
          });
          return <div className={`${styles.row} ${styles.s1}`}>{days}</div>;
        })}
      </div>
    );
  }
}

class CalendarHeader extends Component {
  onClickLeft = date => {
    let year = moment(date).format('YYYY');
    let month = moment(date).format('M') - 1;
    if (month === 0) {
      month = 12;
      year -= 1;
    }
    const lastMonth = moment(new Date(year, month - 1)).format('YYYY-MM-DD');
    this.props.onNavChange(lastMonth);
  };

  onClickRight = date => {
    let year = moment(date).format('YYYY');
    let month = moment(date).format('M');
    month = Number(month) + 1;
    if (month === 13) {
      month = 1;
      year = Number(year) + 1;
    }
    const nextMonth = moment(new Date(year, month - 1)).format('YYYY-MM-DD');
    this.props.onNavChange(nextMonth);
  };

  render() {
    const { date } = this.props;
    const currentMonth = moment(date).format('YYYY年M月');
    return (
      <div className={`${styles.header} ${styles.row} ${styles.s1}`}>
        {/* 上个月 */}
        <div className={`${styles.center} ${styles.s1}`} onClick={() => this.onClickLeft(date)}>
          {'<'}
        </div>
        {/* 当前月 */}
        <div className={`${styles.s5} ${styles.center}`}>
          <span>{currentMonth}</span>
        </div>
        {/* 下个月 */}
        <div className={`${styles.center} ${styles.s1}`} onClick={() => this.onClickRight(date)}>
          {'>'}
        </div>
      </div>
    );
  }
}

class CalendarHead extends Component {
  componentDidMount() {
    console.info('CalendarHead');
  }

  render() {
    const nodes = ['日', '一', '二', '三', '四', '五', '六'];
    return (
      <div className={`${styles.row} ${styles.s1}`}>
        {nodes.map(text => {
          const className = `${styles.tableTh} ${styles.s1} ${styles.center} ${
            text === '日' || text === '六' ? styles.weekend : ''
          }`;
          return <div className={className}>{text}</div>;
        })}
      </div>
    );
  }
}

export default class Calendar extends Component {
  state = {
    date: moment().format('YYYY-MM-DD'),
    current: moment().format('YYYY-MM-DD'),
  };

  onNavChange = date => {
    this.setState({
      date,
    });
  };

  onSelectedChange = date => {
    this.setState({
      current: date,
    });
  };

  render() {
    const { date, current } = this.state;
    return (
      <div className={`${styles.react_calendar} ${styles.column}`}>
        <CalendarHeader date={date} onNavChange={this.onNavChange} />
        <div className={`${styles.calendar} ${styles.column} ${styles.s9}`}>
          <CalendarHead />
          <CalendarBody current={current} date={date} onSelectedChange={this.onSelectedChange} />
        </div>
      </div>
    );
  }
}
