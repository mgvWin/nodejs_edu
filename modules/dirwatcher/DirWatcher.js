import EventEmitter from 'events';
import path from 'path';

import DirFile from './DirFile';
import { FsPromisify } from '../../utils';

const DEFAULT_WATCH_DELAY = 1000; // ms

const watchers = new Map();

export const DIR_WATCHER_EVENTS = {
  CHANGED: 'dirwatcher:changed'
};

export class DirWatcher extends EventEmitter {
  constructor() {
    super();

    this.dirPath = null;
    this.dirFiles = [];
  }

  listenerCount(eventType) {
    const watcher = watchers.get(this.dirPath);
    return watcher && watcher === this
      ? super.listenerCount(eventType)
      : watcher.listenerCount(eventType);
  }

  watch(dirPath, delay = DEFAULT_WATCH_DELAY) {
    if (this.absolutePath) {
      return;
    }

    this.dirPath = path.isAbsolute(dirPath) ? dirPath : path.resolve(dirPath);

    if (watchers.has(this.dirPath)) {
      watchers.get(this.dirPath).on(DIR_WATCHER_EVENTS.CHANGED, data => {
        this.emit(DIR_WATCHER_EVENTS.CHANGED, data);
      });

      return;
    }

    watchers.set(this.dirPath, this);

    this.getDirFilePaths().then(files => {
      this.dirFiles = files.map(filePath => new DirFile(filePath));
      this.setWatcher(delay);
    });
  }

  async getDirFilePaths() {
    const isDirExists = await FsPromisify.exists(this.dirPath);

    if (!isDirExists) {
      return [];
    }

    const resolvedPaths = [];

    for await (const fileName of await FsPromisify.readdir(this.dirPath)) {
      const filePath = path.join(this.dirPath, fileName);
      const isFile = await this.isFile(filePath);

      if (isFile) {
        resolvedPaths.push(filePath);
      }
    }

    return resolvedPaths;
  }

  async isFile(filePath) {
    const fileStat = await FsPromisify.stat(filePath);
    return fileStat.isFile();
  }

  setWatcher(delay) {
    setInterval(() => {
      if (!this.listenerCount(DIR_WATCHER_EVENTS.CHANGED)) {
        return;
      }

      this.dirFiles.forEach(file =>
        (async () => {
          const isFileChanged = await file.isChanged();

          if (isFileChanged) {
            this.emit(DIR_WATCHER_EVENTS.CHANGED, file.filePath);
          }
        })()
      );
    }, delay);
  }
}
