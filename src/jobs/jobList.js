import Constants from "../constants/Constants.js";

const { JOBS } = Constants;

const intervals = {
  everyMinute: '* * * * *',
  everySundayAtMidnight: '0 0 * * 0'
}

const CRON_JOBS = [
  {
    jobName: JOBS.TEST_JOB,
    interval: {
      name: 'everyMinute',
      expression: intervals['everyMinute']
    },
    timezone: 'America/Chicago'
  },
  {
    jobName: JOBS.JSRF_GRAFFITI_TAGS,
    interval: {
      name: 'everySundayAtMidnight',
      expression: intervals['everySundayAtMidnight']
    },
  },
  {
    jobName: JOBS.JSR_GRAFFITI_TAGS,
    interval: {
      name: 'everySundayAtMidnight',
      expression: intervals['everySundayAtMidnight']
    },
  },
  {
    jobName: JOBS.GAMES,
    interval: {
      name: 'everySundayAtMidnight',
      expression: intervals['everySundayAtMidnight']
    },
  }
]

export default CRON_JOBS;