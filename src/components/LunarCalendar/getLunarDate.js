(function(root, factory) {
  if (typeof define === 'function' && define.amd) define([], factory);
  else root.getLunarDate = factory();
})(this, function() {
  'use strict';

  var madd = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  var tgString = '甲乙丙丁戊己庚辛壬癸';
  var dzString = '子丑寅卯辰巳午未申酉戌亥';
  var numString = '一二三四五六七八九十';
  var monString = '正二三四五六七八九十冬腊';
  var weekString = '日一二三四五六';
  var sx = '鼠牛虎兔龙蛇马羊猴鸡狗猪';
  var calendarData = [
    0xa4b,
    0x5164b,
    0x6a5,
    0x6d4,
    0x415b5,
    0x2b6,
    0x957,
    0x2092f,
    0x497,
    0x60c96,
    0xd4a,
    0xea5,
    0x50da9,
    0x5ad,
    0x2b6,
    0x3126e,
    0x92e,
    0x7192d,
    0xc95,
    0xd4a,
    0x61b4a,
    0xb55,
    0x56a,
    0x4155b,
    0x25d,
    0x92d,
    0x2192b,
    0xa95,
    0x71695,
    0x6ca,
    0xb55,
    0x50ab5,
    0x4da,
    0xa5b,
    0x30a57,
    0x52b,
    0x8152a,
    0xe95,
    0x6aa,
    0x615aa,
    0xab5,
    0x4b6,
    0x414ae,
    0xa57,
    0x526,
    0x31d26,
    0xd95,
    0x70b55,
    0x56a,
    0x96d,
    0x5095d,
    0x4ad,
    0xa4d,
    0x41a4d,
    0xd25,
    0x81aa5,
    0xb54,
    0xb6a,
    0x612da,
    0x95b,
    0x49b,
    0x41497,
    0xa4b,
    0xa164b,
    0x6a5,
    0x6d4,
    0x615b4,
    0xab6,
    0x957,
    0x5092f,
    0x497,
    0x64b,
    0x30d4a,
    0xea5,
    0x80d65,
    0x5ac,
    0xab6,
    0x5126d,
    0x92e,
    0xc96,
    0x41a95,
    0xd4a,
    0xda5,
    0x20b55,
    0x56a,
    0x7155b,
    0x25d,
    0x92d,
    0x5192b,
    0xa95,
    0xb4a,
    0x416aa,
    0xad5,
    0x90ab5,
    0x4ba,
    0xa5b,
    0x60a57,
    0x52b,
    0xa93,
    0x40e95,
  ];

  function getBit(m, n) {
    return (m >> n) & 1;
  }

  function e2c(date) {
    var total, m, n, k, isEnd;
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    total = (year - 1921) * 365 + Math.floor((year - 1921) / 4) + madd[month] + day - 38;

    if (date.getYear() % 4 === 0 && month > 1) total++;

    for (m = 0, isEnd = false; ; m++) {
      k = calendarData[m] < 0xfff ? 11 : 12;
      for (n = k; n >= 0; n--) {
        if (total <= 29 + getBit(calendarData[m], n)) {
          isEnd = true;
          break;
        }
        total = total - 29 - getBit(calendarData[m], n);
      }
      if (isEnd) break;
    }
    year = 1921 + m;
    month = k - n + 1;
    day = total;
    if (k === 12 && month == Math.floor(calendarData[m] / 0x10000) + 1) month = 1 - month;
    if (k === 12 && month > Math.floor(calendarData[m] / 0x10000) + 1) month--;
    return {
      year: year,
      month: month,
      day: day,
    };
  }

  function getLunarDate(date) {
    var year = date.getFullYear();
    var month;
    var day;
    if (year < 1921 || year > 2020) {
      return {};
    }

    date = e2c(date);
    year = date.year;
    month = date.month;
    day = date.day;

    var isLeapYear = month < 1;
    var lunarDay = '';
    if (day < 11) lunarDay += '初';
    else if (day < 20) lunarDay += '十';
    else if (day < 30) lunarDay += '廿';
    else lunarDay += '三十';
    if (day % 10 || day === 10) lunarDay += numString.charAt((day - 1) % 10);

    return {
      year: tgString.charAt((year - 4) % 10) + dzString.charAt((year - 4) % 12),
      zodiac: sx.charAt((year - 4) % 12),
      isLeapYear: isLeapYear,
      month: isLeapYear ? monString.charAt(-month - 1) : monString.charAt(month - 1),
      day: lunarDay,
    };
  }

  return getLunarDate;
});
