const googleTrends = require('google-trends-api')
const subDays = require('date-fns/sub_days')
const endOfToday = require('date-fns/end_of_today')
const chalk = require('chalk')
const R = require('ramda')

module.exports = function (vorpal) {
  vorpal
    .command('google-trends <input...>')
    .description('Explore google trends')
    .option('--days <days>', 'period to watch in days, 30 days by default')
    .action(function (args, callback) {
      const keywords = args.input

      const days = args.options.days || 30
      const endTime = endOfToday()
      const startTime = subDays(endTime, days)

      googleTrends.interestOverTime({
          keyword: keywords,
          startTime,
          endTime
        })
        .then(function (results) {
          const entries = JSON.parse(results).default.timelineData
          const maxValue = R.reduce((acc, elem) => R.max(acc, R.head(R.prop('value', elem))), 0, entries)
          console.log(
            entries
            .map(({
              formattedTime,
              value
            }) => {
              const squareCount = Math.round(value * 20 / maxValue)
              const squares = R.repeat('█', squareCount).join('')
              return `${formattedTime}\t\t${value}\t${chalk.green(squares)}`
            })
            .join('\n')
          )
          callback()
        })
        .catch(function (err) {
          console.error('Oh no there was an error', err)
          callback()
        })
    })
}