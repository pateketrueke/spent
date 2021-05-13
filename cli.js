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
  console.log(USAGE_INFO);
  process.exit(1);
}

if (argv._[0] === '-') {
  process.stdin.pipe(new Transform({
    transform(entry, enc, callback) {
      const content = Buffer.from(entry, enc).toString();
      const result = extract(content);

      callback(null, `${format(result, argv.flags)}\n`);
    }
  })).pipe(process.stdout);
} else {
  try {
    const result = extract(argv._.join(' '));

    console.log(format(result, argv.flags));
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }
}
