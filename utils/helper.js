import fs from 'fs';
import path from 'path';
import { isBuffer } from 'util';
import { default as readlinePipe } from 'readline';

import FsPromisify from './FsPromisify.js';

export function curry(func, ...args) {
  return func.bind(null, ...args);
}

export function parsePath(absolutePath) {
  const fileFullName = path.basename(absolutePath);
  const fileExtension = fileFullName
    ? fileFullName.slice(
        (Math.max(0, fileFullName.lastIndexOf('.')) || Infinity) + 1
      )
    : '';

  return {
    file: {
      name: (fileFullName || '').replace(
        fileExtension ? `.${fileExtension}` : '',
        ''
      ),
      ext: fileExtension,
      toString: () => fileFullName
    },
    dir: path.dirname(absolutePath)
  };
}

export function pathToAbsolute(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
}

export async function isPathExists(absolutePath) {
  try {
    await FsPromisify.access(absolutePath, fs.F_OK);
    return absolutePath;
  } catch (err) {
    throw new Error(`Path '${absolutePath}' doesn't exist in file system`);
  }
}

export async function isFileReadable(absolutePath) {
  try {
    await FsPromisify.access(absolutePath, fs.R_OK);
    return absolutePath;
  } catch (err) {
    const { file, dir } = parsePath(absolutePath);
    throw new Error(`File '${file}' is not readable in folder '${dir}'`);
  }
}

export function reverse(data) {
  return data
    .toString()
    .split('')
    .reverse()
    .join('');
}

export function upperCase(data) {
  return data.toString().toUpperCase();
}

export function processStdOut(string) {
  process.stdout.write(string);
  return string;
}

export function processStdIn(questionMessage) {
  const readLine = readlinePipe.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    readLine.question(questionMessage, input => {
      resolve(input);
      readLine.close();
    });
  });
}

export async function getFolderFiles(folderPath, compareFilter = () => true) {
  const filePaths = [];

  for await (const fileName of await FsPromisify.readdir(folderPath)) {
    const filePath = path.join(folderPath, fileName);
    const fileStat = await FsPromisify.stat(filePath);

    Object.assign(fileStat, {
      name: fileName,
      ext: fileName.slice(
        (Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1
      )
    });

    if (fileStat.isFile() && compareFilter(fileStat)) {
      filePaths.push(filePath);
    }
  }

  return filePaths;
}

export function readFile(absolutePath) {
  return new Promise((resolve, reject) => {
    let fileData = '';

    const readStream = fs.createReadStream(absolutePath, {
      autoClose: true,
      encoding: 'utf8'
    });

    readStream
      .on('data', data => {
        fileData += data;
      })
      .on('end', () => {
        resolve(fileData);
      })
      .on('error', reject);
  });
}

export async function readFiles(pathsList) {
  return await Promise.all(pathsList.map(filePath => readFile(filePath)));
}

export function writeFile(content, fileName, dirPath) {
  return new Promise((resolve, reject) => {
    if (isBuffer(content) || typeof content === 'string') {
      const writeStream = fs.createWriteStream(path.join(dirPath, fileName));

      writeStream.write(content, 'utf-8');
      writeStream.on('finish', resolve).on('error', reject);
      writeStream.end();
    } else {
      reject(new Error('Invalid non-string/buffer chunk'));
    }
  });
}

export function pipe(...optionsAsync) {
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
