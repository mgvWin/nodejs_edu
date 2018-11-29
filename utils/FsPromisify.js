import fs from 'fs';
import { promisify } from 'util';

const fsStat = promisify(fs.stat);
const fsReadDir = promisify(fs.readdir);
const fsReadFile = promisify(fs.readFile);

export default class FsPromisify {
  static stat(path, options) {
    return fsStat(path, options)
  }

  static readdir(path, options) {
    return fsReadDir(path, options)
  }

  static readFile(path, options) {
    return fsReadFile(path, options)
  }
}