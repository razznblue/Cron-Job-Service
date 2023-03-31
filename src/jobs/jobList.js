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
    }
  },
  {
    jobName: JOBS.JSRF_GRAFFITI_TAGS,
    interval: {
      name: 'everySundayAtMidnight',
      expression: intervals['everySundayAtMidnight']
    },
    timezone: 'America/Chicago'
  },
  {
    jobName: JOBS.JSR_GRAFFITI_TAGS,
    interval: {
      name: 'everySundayAtMidnight',
      expression: intervals['everySundayAtMidnight']
    },
    timezone: 'America/Chicago'
  }
]

export default CRON_JOBS;