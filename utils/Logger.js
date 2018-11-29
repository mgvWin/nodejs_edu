const PRODUCTION_ENV_NAME = 'production';

export default class Logger {
  static console(message) {
    if (process.env.NODE_ENV === PRODUCTION_ENV_NAME) {
      return;
    }

    /* eslint-disable-next-line no-console */
    console.log(message);
  }

  static table(data) {
    if (process.env.NODE_ENV === PRODUCTION_ENV_NAME) {
      return;
    }

    /* eslint-disable-next-line no-console */
    console.table(data);
  }
}
