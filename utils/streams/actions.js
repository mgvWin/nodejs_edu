import {
  reverse,
  upperCase,
  processStdOut,
  processStdIn,
  readFile,
  readFiles,
  pathToAbsolute,
  isFileReadable,
  isPathExists,
  parsePath,
  writeFile,
  getFolderFiles,
  curry
} from './helper.js';
import CSVParser from '../CSVParser.js';
import Logger from '../Logger';

import MESSAGES from './messages.js';
import OPTIONS from './options.js';

function pipe(...optionsAsync) {
  return async data => {
    let acc = data;
    try {
      for await (const func of optionsAsync) {
        acc = await func(acc);
      }
    } catch (err) {
      throw err;
    }

    return acc;
  };
}

function readCommandOption(optionName, options) {
  if (!options[optionName]) {
    throw new Error(`Option '--${optionName}' is required`);
  }

  return options[optionName];
}

const validateFilePathPipeline = pipe(
  curry(readCommandOption, OPTIONS.FILE),
  pathToAbsolute,
  isPathExists
);

const readFilePipeline = pipe(
  validateFilePathPipeline,
  isFileReadable,
  readFile
);

const commandLibrary = {
  reverse: pipe(
    curry(processStdIn, 'Enter text: '),
    reverse,
    processStdOut
  ),
  transform: pipe(
    curry(processStdIn, 'Enter text: '),
    upperCase,
    processStdOut
  ),
  outputFile: pipe(
    readFilePipeline,
    Logger.console
  ),
  convertFromFile: pipe(
    readFilePipeline,
    CSVParser.parse,
    json => JSON.stringify(json),
    processStdOut
  ),
  convertToFile: pipe(
    validateFilePathPipeline,
    isFileReadable,
    absolutePath =>
      pipe(
        readFile,
        CSVParser.parse,
        json => JSON.stringify(json),
        content => {
          const {
            file: { name },
            dir
          } = parsePath(absolutePath);

          return [content, `${name}.json`, dir];
        }
      )(absolutePath),
    args => writeFile(...args),
    () => MESSAGES.FILE_WROTE,
    processStdOut
  ),
  cssBundler: pipe(
    curry(readCommandOption, OPTIONS.PATH),
    pathToAbsolute,
    isPathExists,
    folderPath =>
      pipe(
        curry(getFolderFiles, folderPath, file => file.ext === 'css'),
        readFiles,
        filesData => [filesData.join('\n'), `bundle.css`, folderPath]
      )(folderPath),
    args => writeFile(...args),
    () => MESSAGES.CSS_BUNDLE_CREATED,
    processStdOut
  )
};

export default async function evaluateAction(actionName, options) {
  const action = commandLibrary[actionName];
  if (action) {
    try {
      await action(options);
    } catch (err) {
      Logger.error(err.message);
    }
  } else {
    Logger.warm(MESSAGES.INVALID_ACTION);
  }
}
