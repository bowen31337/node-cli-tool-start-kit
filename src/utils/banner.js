import figlet from 'figlet'
import chalk from 'chalk'

console.log(
  chalk.red(
    figlet.textSync('MyCli', { horizontalLayout: 'full' })
  )
);
