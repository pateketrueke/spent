function pad(num) {
  return `0${num}`.substr(-2);
}

function time(value) {
  return parseInt(value, 10);
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

// FIXME: apply filters...
function filter(date, opts) {
  // from lt lte gt gte
  // console.log({date,opts});
  return true;
}

function extract(input, flags = {}) {
  if (!input || typeof input !== 'string') {
    throw new TypeError(`Invalid input, given '${input}'`);
  }

  const stack = [];

  input.split('\n')
    .map(line => {
      const times = line.trim().match(/(?:\+\d+|\d{2}:\d{2}|\d{4}[/-]?\d{2}[/-]?\d{2}|\d{2}[/-]?\d{2}[/-]?\d{4}|[a-z]{3,}\s+\d{1,2},?\s+\d{4})/gi);
      const chunk = [];

      let current;
      for (let i = 0; times && i < times.length; i+= 1) {
        if (/\d{4}/.test(times[i])) {
          if (current) chunk.push(current);
          current = null;

          const next = Date.parse(times[i]);

          if (!filter(next, flags)) break;

          chunk.push({ now: next });
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

          if (!after) throw new TypeError(`Missing time after '${before}'`);
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

function append(now, times) {
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
    sum += Array.isArray(times.add)
      ? times.add.reduce((prev, cur) => prev + cur, 0)
      : times.add;
  }

  return sum;
}

function format(stack, kind = 'short') {
  let now = Date.now();
  let values = []

  const dates = [];

  function push() {
    const minutes = values.reduce((prev, cur) => prev + cur, 0);

    dates.push({ date: new Date(now), minutes });
    values = [];
  }

  const entries = stack.reduce((current, chunk) => {
    chunk.forEach(entry => {
      if (entry.now) {
        if (values.length) push();
        now = entry.now;
      } else if (entry.diff) {
        values.push(append(now, entry.diff));
      } else {
        values.push(append(now, entry));
      }
    });
    if (values.length) push();
    return current;
  }, []);

  const total = dates.reduce((prev, cur) => prev + cur.minutes, 0);

  return dates.map(entry => {
    return `${short(entry.date)}, ${hours(entry.minutes)}`;
  }).concat(`Total time spent ${hours(total)}`).join('\n');
}

module.exports = {
  format,
  append,
  extract,
  clamp,
  split,
  hours,
  short,
  time,
  pad,
};
