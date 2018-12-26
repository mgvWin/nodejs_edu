const PRODUCTION_ENV_NAME = 'production';

/* eslint-disable no-console */
export default class Logger {
  static console(message) {
    if (process.env.NODE_ENV === PRODUCTION_ENV_NAME) {
      return;
    }

    console.log(message);
  }

  static error(errorMessage) {
    console.log('\x1b[31mERROR!\x1b[0m', errorMessage);
  }

  static warm(warmMessage) {
    console.log('\x1b[33mWARM!\x1b[0m', warmMessage);
  }

  static table(data) {
    if (process.env.NODE_ENV === PRODUCTION_ENV_NAME) {
      return;
    }

    console.table(data);
  }
}
/* eslint-enable no-console */
