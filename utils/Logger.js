export default class Logger {
  static console(message) {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    /* eslint-disable-next-line no-console */
    console.log(message);
  }
}
