import chalk from 'chalk';

type level = 'info' | 'success' | 'warn' | 'error' | 'debug';
const log = (lvl: level, msgs: string[]) => {
  const chalkFunc = { success: chalk.green, info: chalk.cyan, warn: chalk.yellow, error: chalk.red, debug: chalk.blue }[lvl] || chalk.white;
  console.log(chalkFunc(`[${lvl.toUpperCase()}] ${new Date().toISOString()} ${msgs.join(' ')}`));
};
const logger = {
  info: (...m: string[]) => log('info', m),
  success: (...m: string[]) => log('success', m),
  warn: (...m: string[]) => log('warn', m),
  error: (...m: string[]) => log('error', m),
  debug: (...m: string[]) => log('debug', m),
};

export default logger;
