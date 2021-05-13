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
2020-05-10, 2:01
Total time spent 6:56
`.trim());

const filtered = extract('05/09/2020 21:10 21:20 | 2020-05-11 23:11 02:30');

assert.equal(format(filtered, {
  since: 'May 1, 2020',
  until: '1 hours ago',
  from: '2020-05-10',
}), `
2020-05-10, 0:10
Total time spent 0:10
`.trim());

assert.equal(format(filtered, {
  since: '3 weeks ago',
  from: '2020-06-10',
}), `
Total time spent 0:00
`.trim());
