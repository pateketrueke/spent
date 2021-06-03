const tk = require('timekeeper');
const { expect } = require('chai');
const { extract, format } = require('../main');

/* global describe, it */

tk.freeze(1620604800000);

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
  it('should validate its input', () => {
    expect(extract).to.throw(/Invalid input/);
  });

  it('should fail on missing tokens', () => {
    expect(() => extract('01:23')).to.throw(/Missing time after '01:23' at line 1/);
  });

  it('should parse time tokens', () => {
    expect(short).to.eql([[
      { diff: { begin: [1, 23], end: [1, 40] } },
    ]]);

    expect(extract('+1')).to.eql([[
      { add: 1 },
    ]]);

    expect(extract('01:23 +1 +2 02:34 +1 +2')).to.eql([[
      { add: [1, 2], begin: [1, 23] },
      { add: [1, 2], begin: [2, 34] },
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

    expect(extract('2021-05-10 2021-05-11')).to.eql([[
      { now: 1620604800000 },
      { now: 1620691200000 },
    ]]);

    expect(extract('01:23 +1 2021-05-10')).to.eql([[
      { add: [1], begin: [1, 23] },
      { now: 1620604800000 },
    ]]);
  });
});

describe('format', () => {
  it('should consume all tokens', () => {
    expect(format(extract('05/10/2021 01:23 +5 05/11/2021 04:56 07:21'))).to.eql(`
2021-05-10, 0:05
2021-05-11, 2:25
Total time spent 2:30
`.trim());

    expect(format(extract('+1 +2 +3'))).to.eql(`
2021-05-10, 0:06
Total time spent 0:06
`.trim());
  });

  it('should return a summary', () => {
    expect(format(dates)).to.eql(`
2020-05-08, 0:30
2020-05-09, 3:10
2020-05-10, 1:15
2020-05-10, 2:01
2020-05-11, 3:19
Total time spent 10:15
`.trim());

    expect(format(short)).to.eql(`
2021-05-10, 0:17
Total time spent 0:17
`.trim());
  });
});

describe('filters', () => {
  it('should fail on invalid keywords', () => {
    expect(() => format(dates, {
      since: 'now',
    })).to.throw(/Invalid time keyword, given 'now'/);
  });

  it('should fail on invalid time units', () => {
    expect(() => format(dates, {
      since: '3 wut ago',
    })).to.throw(/Invalid time unit, given '3 wut ago'/);
  });

  it('should allow to discard past times', () => {
    expect(format(dates, {
      since: 'yesterday',
      from: '2020-05-10',
    })).to.eql(`
2020-05-09, 3:10
2020-05-10, 1:15
2020-05-10, 2:01
2020-05-11, 3:19
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
2020-05-10, 2:01
Total time spent 6:26
`.trim());
  });

  it('should handle minutes, hours, days and weeks', () => {
    expect(format(dates, { since: 'this week' })).to.eql('Total time spent 0:00');
    expect(format(dates, { since: 'last week' })).to.eql('Total time spent 0:00');
    expect(format(dates, { until: 'next 24 hours' })).to.eql('Total time spent 0:00');
    expect(format(dates, { from: 'last 3 days' })).to.contains('Total time spent 10:15');
    expect(format(dates, { until: 'next 90 minutes' })).to.eql('Total time spent 0:00');
  });
});
