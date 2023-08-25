import LOGGER from "../utils/logger.js";

/* CronJobs can only be assigned cronSchedules from this list */
const intervals = {
  everyMinute: '* * * * *',
  everyFiveMinutes: '5 * * * *',
  everyFifteenMinutes: '15 * * * *',
  everyThirtyMinutes: '30 * * * *',
  everyFourtyFiveMinutes: '45 * * * *',
  everyHour: '0 * * * *',
  everyTwoHours: '0 */2 * * *',
  everyThreeHourse: '0 */3 * * *',
  everyDayAtMidnight: '0 0 * * *',
  everyDayAtEightAM: '0 8 * * *',
  everySundayAtMidnight: '0 0 * * 0',
  everyMondayAtMidnight: '0 0 * * 1',
  everyTuesdayAtMidnight: '0 0 * * 2',
  everyWednesdayAtMidnight: '0 0 * * 3',
  everyThursdayAtMidnight: '0 0 * * 4',
  everyFridayAtMidnight: '0 0 * * 5',
  everySaturdayAtMidnight: '0 0 * * 6',
  everySaturdayAtNinePM: '0 21 * * 6',
  everyMonth: '0 0 1 * *',
  everyOtherMonth: '0 0 1 */2 *',
  everySixMonths: '0 0 1 */6 *',
  everyYear: '0 0 1 1 *'
}

const getCronExpression = (interval) => {
  const expression =  intervals[interval];
  if (!expression) {
    LOGGER.error('Invalid expression found. Check interval list to validate');
  }
  return expression;
}

export default getCronExpression;