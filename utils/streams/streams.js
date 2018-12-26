import yargs from 'yargs';

import OPTIONS from './options.js';
import MESSAGES from './messages.js';
import evaluateAction from './actions.js';
import Logger from '../Logger.js';

const processArgv = process.argv.slice(2);
const commandLineOptions = Object.keys(OPTIONS).map(key => OPTIONS[key]);

const { argv } = yargs.options(
  commandLineOptions.reduce(
    (optionsObj, option) =>
      Object.assign(optionsObj, {
        [option.key]: {
          alias: option.shortCut,
          type: option.type,
          description: option.description
        }
      }),
    {}
  )
);

if (!processArgv.length) {
  Logger.error(MESSAGES.EMPTY_ARGUMENTS_LIST);
  yargs.showHelp();
}

const actionName = argv[OPTIONS.ACTION];

if (actionName) {
  evaluateAction(actionName, argv);
} else {
  Logger.warm(MESSAGES.EMPTY_ACTION);
}
