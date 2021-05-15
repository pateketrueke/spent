function pad(num) {
  return `0${num}`.substr(-2);
}

function int(val) {
  const num = parseInt(/\d/.test(val) ? val.match(/\d+/)[0] : 1, 10);

  if (val.includes('week')) return num * 604800;
  if (val.includes('day')) return num * 86400;
  if (val.includes('hour')) return num * 3600;
  if (val.includes('minute')) return num * 60;

  throw new TypeError(`Invalid time unit, given '${val}'`);
}

function now(date) {
  return date ? new Date(date) : new Date();
}

function time(value) {
  return parseInt(value, 10);
}

function parse(date) {
  return Date.parse(`${date} 00:00:00`);
}

function short(date) {
  return date.toISOString().substr(0, 10);
}

function split(value) {
  return value.split(/\D/).map(time);
}

function hours(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return `${h}:${pad(m)}`;
}

function clamp(before, after) {
  return {
    begin: split(before),
    end: split(after),
  };
}

function todate(date, times) {
  const slice = now(date);

  if (times) {
    slice.setHours(times[0], times[1]);
  }
  return slice;
}

function totime(date, value) {
  let out = date;
  if (value === 'last week') value = '1 week ago';
  if (value === 'yesterday') value = '1 day ago';
  if (value === 'tomorrow') value = 'next day';
  if (value.includes(' ago')) out -= int(value) * 1000;
  else if (value.includes('next ')) out += int(value) * 1000;
  else if (value.match(/\d{4}/)) return parse(value);
  else throw new TypeError(`Invalid time keyword, given '${value}'`);
  return out;
}

function filter(date, opts) {
  let current = now();
  let begin = 0;
  let end = Infinity;

  if (opts.from) current = totime(current, opts.from);
  if (opts.until) end = totime(current, opts.until);
  if (opts.since) begin = totime(current, opts.since);

  return date >= begin && date <= end;
}

function extract(input) {
  if (!input || typeof input !== 'string') {
    throw new TypeError(`Invalid input, given '${input}'`);
  }

  const stack = [];

  input.split('\n')
    .forEach((line, nth) => {
      const times = line.trim().match(/(?:\+\d+|\d{2}:\d{2}|\d{4}[/-]?\d{2}[/-]?\d{2}|\d{2}[/-]?\d{2}[/-]?\d{4}|[a-z]{3,}\s+\d{1,2},?\s+\d{4})/gi);
      const chunk = [];

      let current;
      for (let i = 0; times && i < times.length; i += 1) {
        if (/\d{4}/.test(times[i])) {
          if (current) chunk.push(current);
          current = null;
          chunk.push({ now: parse(times[i]) });
        } else if (times[i].charAt() === '+') {
          if (current) {
            current.add.push(time(times[i].substr(1)));
          } else {
            chunk.push({ add: time(times[i].substr(1)) });
          }
        } else {
          const before = times[i];
          const after = times[i + 1];

          if (current) chunk.push(current);
          current = null;

          if (!after) throw new TypeError(`Missing time after '${before}' at line ${nth + 1}`);
          if (after.charAt() === '+') {
            current = {
              begin: split(before),
              add: [],
            };
            continue;
          }

          i += 1;
          chunk.push({ diff: clamp(before, after) });
        }
      }

      if (current) chunk.push(current);
      if (chunk.length) stack.push(chunk);
    });

  return stack;
}

function append(current, times) {
  let sum = 0;

  if (times.end && times.end[0] < times.begin[0]) {
    sum += (24 - times.begin[0]) * 60;
    sum -= times.begin[1];
    sum += times.end[0] * 60;
    sum += times.end[1];
  } else if (times.end) {
    sum += (times.end[0] - times.begin[0]) * 60;
    sum -= times.begin[1];
    sum += times.end[1];
  } else {
    sum += [].concat(times.add).reduce((prev, cur) => prev + cur, 0);
  }

  return { date: todate(current, times.begin), total: sum };
}

function format(stack, flags = {}) {
  let current = Date.now();
  let values = [];

  const dates = [];

  function push() {
    const minutes = values.reduce((prev, cur) => prev + cur.total, 0);

    dates.push({ date: values[0].date, minutes });
    values = [];
  }

  stack.forEach(chunk => {
    chunk.forEach(entry => {
      if (entry.now) {
        if (values.length) push();
        current = entry.now;
      } else if (entry.diff) {
        values.push(append(current, entry.diff));
      } else {
        values.push(append(current, entry));
      }
    });
    if (values.length) push();
  });

  const filtered = dates.filter(entry => filter(entry.date, flags));
  const total = filtered.reduce((prev, cur) => prev + cur.minutes, 0);

  return filtered.map(entry => {
    return `${short(entry.date)}, ${hours(entry.minutes)}`;
  }).concat(`Total time spent ${hours(total)}`).join('\n');
}

module.exports = {
  format,
  append,
  extract,
  todate,
  totime,
  clamp,
  split,
  hours,
  short,
  time,
  pad,
};
