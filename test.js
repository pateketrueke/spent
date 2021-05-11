const assert = require('assert');
const { extract, format } = require('./main');

const sample = `
May 8, 2020
  15:05 - 15:35

2020-05-09
  07:35 - 10:15 - 10:25 +10 +10 +10

5/10/2020
  08:15 - 09:30
  23:50 - 01:51
`;

const result = extract(sample);

assert.equal(format(result), `
2020-05-08, 0:30
2020-05-09, 3:10
2020-05-09, 1:15
2020-05-09, 2:01
Total time spent 6:56
`.trim());

const filtered = extract('05/09/2020 00:10 00:20 | 2020-05-11 00:10 02:30', {
  gt: 'May 1, 2020',
  lte: '3 hours ago',
  from: '2020-05-10',
});

assert.equal(format(filtered), `
2020-05-09, 0:10
2020-05-11, 2:20
Total time spent 2:30
`.trim());
