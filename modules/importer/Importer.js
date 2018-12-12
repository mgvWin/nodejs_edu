import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';

import { DirWatcher, DIR_WATCHER_EVENTS } from '../dirwatcher/DirWatcher.js';
import { FsPromisify } from '../../utils/index.js';

export const IMPORTER_EVENTS = {
  CHANGED: 'file:changed'
};

export class Importer extends EventEmitter {
  constructor() {
    super();

    this.path = null;
    this.dirWatcher = null;
  }

  watch(filePath, delay) {
    if (this.path && this.path === filePath) {
      throw new Error(`Can't watch new path!`);
    }

    this.path = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
    const dirPath = path.dirname(this.path);

    this.dirWatcher = new DirWatcher();
    this.dirWatcher.watch(dirPath, delay);

    this.dirWatcher.on(DIR_WATCHER_EVENTS.CHANGED, filePathThatChanged => {
      if (
        filePathThatChanged !== this.path ||
        !this.listenerCount(IMPORTER_EVENTS.CHANGED)
      ) {
        return;
      }

      Importer.import(filePathThatChanged).then(data => {
        this.emit(IMPORTER_EVENTS.CHANGED, data);
      });
    });
  }

  static import(absolutePath) {
    return FsPromisify.readFile(absolutePath, 'utf8');
  }

  static importSync(absolutePath) {
    return fs.readFileSync(absolutePath, 'utf8');
  }
}
