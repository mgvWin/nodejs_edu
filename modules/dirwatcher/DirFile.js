import path from 'path';
import { FsPromisify } from '../../utils';

export default class DirFile {
  constructor(filePath) {
    this.mtimeMs = null;

    this.filePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(filePath);
  }

  async isChanged() {
    const fileStat = await FsPromisify.stat(this.filePath);

    if (!fileStat || fileStat.mtimeMs === this.mtimeMs) {
      return false;
    }

    this.mtimeMs = fileStat.mtimeMs;
    return true;
  }
}
