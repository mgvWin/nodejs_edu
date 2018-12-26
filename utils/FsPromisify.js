import fs from 'fs';
import { promisify } from 'util';

const fsStat = promisify(fs.stat);
const fsReadDir = promisify(fs.readdir);
const fsReadFile = promisify(fs.readFile);
const fsExixts = promisify(fs.exists);
const fsAccess = promisify(fs.access);

export default class FsPromisify {
  static async stat(path) {
    return fsStat(path);
  }

  static async readdir(path) {
    return fsReadDir(path);
  }

  static async readFile(path) {
    return fsReadFile(path);
  }

  static async exists(path) {
    return fsExixts(path);
  }

  static async access(path) {
    return fsAccess(path);
  }
}
