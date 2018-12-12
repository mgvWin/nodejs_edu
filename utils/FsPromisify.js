import fs from 'fs';
import { promisify } from 'util';

const fsStat = promisify(fs.stat);
const fsReadDir = promisify(fs.readdir);
const fsReadFile = promisify(fs.readFile);
const fsExixts = promisify(fs.exists);

export default class FsPromisify {
  static stat(path) {
    return fsStat(path);
  }

  static readdir(path) {
    return fsReadDir(path);
  }

  static readFile(path) {
    return fsReadFile(path);
  }

  static exists(path) {
    return fsExixts(path);
  }
}
