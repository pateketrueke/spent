const { expect } = require('chai');
const { extract, format } = require('../main');

/* global describe, it */

const short = extract('01:23 01:40');
const dates = extract(`
May 8, 2020
  15:05 - 15:35

2020-05-09
  07:35 - 10:15 - 10:25 +10 +10 +10

05/10/2020
  08:15 - 09:30
  23:50 - 01:51

2020-05-11
  23:11 - 02:30
`);

describe('extract', () => {
  it('should parse time tokens', () => {
    expect(short).to.eql([[
      { diff: { begin: [1, 23], end: [1, 40] } },
    ]]);
  });

  it('shuold parse date tokens', () => {
    expect(dates).to.eql([
      [{ now: Date.parse('May 08 2020 00:00:00') }],
      [{ diff: { begin: [15, 5], end: [15, 35] } }],
      [{ now: Date.parse('May 09 2020 00:00:00') }],
      [{ diff: { begin: [7, 35], end: [10, 15] } }, { add: [10, 10, 10], begin: [10, 25] }],
      [{ now: Date.parse('May 10 2020 00:00:00') }],
      [{ diff: { begin: [8, 15], end: [9, 30] } }],
      [{ diff: { begin: [23, 50], end: [1, 51] } }],
      [{ now: Date.parse('May 11 2020 00:00:00') }],
      [{ diff: { begin: [23, 11], end: [2, 30] } }],
    ]);
  });
});

describe('format', () => {
  it('should return a summary', () => {
    expect(format(dates)).to.eql(`
2020-05-08, 0:30
2020-05-09, 3:10
2020-05-10, 1:15
2020-05-11, 2:01
2020-05-12, 3:19
Total time spent 10:15
`.trim());

    expect(format(short)).to.eql(`
2021-05-13, 0:17
Total time spent 0:17
`.trim());
  });
});

describe('filters', () => {
  it('should allow to discard past times', () => {
    expect(format(dates, {
      since: 'yesterday',
      from: '2020-05-10',
    })).to.eql(`
2020-05-09, 3:10
2020-05-10, 1:15
2020-05-11, 2:01
2020-05-12, 3:19
Total time spent 9:45
`.trim());
  });

  it('should allow to discard future times', () => {
    expect(format(dates, {
      since: 'yesterday',
      until: 'tomorrow',
      from: '2020-05-10',
    })).to.eql(`
2020-05-09, 3:10
2020-05-10, 1:15
2020-05-11, 2:01
Total time spent 6:26
`.trim());
  });
});
