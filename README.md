# spent

[![Build Status](https://github.com/pateketrueke/spent/workflows/build/badge.svg)](https://github.com/pateketrueke/spent/actions)
[![codecov](https://codecov.io/gh/pateketrueke/spent/branch/master/graph/badge.svg)](https://codecov.io/gh/pateketrueke/spent)
[![NPM version](https://badge.fury.io/js/spent.svg)](http://badge.fury.io/js/spent)

Get it through:

```bash
npm i -g spent
```

## How it works?

The CLI lets you get time-stats from almost any text input.

It recognizes the following date-time patterns:

- `+10`
- `01:23`
- `2021-05-10`
- `2021/05/10`
- `05-10-2021`
- `05/10/2021`
- `May 10, 2021`

Processing rules for parsing:

- Date patterns are used to group time ranges, also they're required to enable filtering.
- Time patterns are used as checkpoints, `HH:MM` values are treated as minutes.
- Numbers prefixed with `+` will be summed up as minutes too.

> All values MUST be paired, and the first item of each time-slice MUST be in `HH:MM` format, followed by one-or-more `+N` or the ending time in `HH:MM` format.

## Usage example

Create a **journal.txt** file with this contents:

```txt
May 10, 2021
  - I reviewed code from 19:00 to 20:22 (+5 +3)

2021-05-09
  - I did some stuff from 13:15 to 16:20
```

If you run `spent - < journal.txt` you should get:

```txt
2021-05-10, 1:30
2021-05-09, 3:05
Total time spent 4:35
```

It also works with plain time-slices as arguments:

```bash
spent 13:20 15:16
```

Filtering can be done through `--since` and `--until` keywords, e.g.

- `this week` would take the initial week-day
- `last week` equals to `1 week ago`
- `yesterday` equals to `1 day ago`
- `tomorrow` equals to `next day`
- `1 week ago`
- `90 minutes ago`
- `next week`
- `next 24 hours`
- `last 20 days`

> Only `minute`, `hour`, `day` and `week` keywords are supported.

Use `--from` to set the date for resolving relative dates, e.g.

```bash
spent --from 2021-05-01 --until "next 3 weeks"
```

> Otherwise, the actual date will be used instead.

## Motivation

I am used to have a journal file on most projects I work following the [Markdown](https://daringfireball.net/projects/markdown/syntax) or [ToDone](https://packagecontrol.io/packages/ToDone) formatting rules.

After trying some time-trackers, pomodoro, CLI programs, Android apps, etc. and I'm still unconvinced if they work for me because:

- Having to switch-context out from my editor just to start/pause/stop a timer is a bummer.
- Almost surely I'll not start any timer et all, or may I forgot to pause/stop it when switching tasks.
- I tend to write what's happening rather that "what I'll do", so my journal is not a just ToDo list written in stone.

Those are distractions to me as I found easier (and quicker) to switch between tabs, move around with the keyboard and write down stuff, code or notes, whatever.

Do you think this would work for you too? Just give it a try!
