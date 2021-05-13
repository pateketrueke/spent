const { Transform } = require('stream');
const argv = require('wargs')(process.argv.slice(2));
const { extract, format, short } = require('./main');

const current = short(new Date()).substr(0, 7);
const month = new Date().toString().split(' ')[1];
const year = new Date().getFullYear();

const USAGE_INFO = `
Usage: spent <INPUT> [OPTIONS]

Options:
   --from  Set date for verbal times
  --until  Filter out future dates
  --since  Filter out past dates

Examples:
  spent 13:15 16:20 --short
  spent - --since "${month} 1, ${year}" --until "3 hours ago" < journal.txt
  spent ${current}-09 00:10 00:20 ${current}-16 00:10 02:30 --from "3 weeks ago" --until yesterday
`;

if (!argv._.length || argv.flags.help) {
  process.stdout.write(`${USAGE_INFO}\n`);
  process.exit(1);
}

if (argv._[0] === '-') {
  process.stdin.pipe(new Transform({
    transform(entry, enc, callback) {
      const content = Buffer.from(entry, enc).toString();
      const result = format(extract(content), argv.flags);

      callback(null, `${result}\n`);
    },
  })).pipe(process.stdout);
} else {
  try {
    const result = format(extract(argv._.join(' ')), argv.flags);

    process.stdout.write(`${result}\n`);
  } catch (e) {
    process.stderr.write(`${e.message}\n`);
    process.exit(2);
  }
}
