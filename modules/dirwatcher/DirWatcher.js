import { fs } from 'fs';
import { EventEmitter } from 'events';
import { path } from 'path';

const DEFAULT_WATCH_DELAY = 1000; // ms

const dirWatchers = {};

async function pathExists(path) {
  return await fs.exists(path);
}

async function readPathStat(path) {
  return await fs.stat(path);
}

class ModifyWatcher extends EventEmitter {
  constructor(relativePath, callback, delay = DEFAULT_WATCH_DELAY) {
    super();

    this.absolutePath = path.resolve(relativePath);

    this.watchInterval = setInterval(() => {
      if (!this.listenerCount('modifyWatcher:changed')) {
        return;
      }

      const isPathExist = pathExists(this.absolutePath);
      if (isPathExist) {
        this.emit('modifyWatcher:changed', this.absolutePath);
      }

      this.destroy();
    }, delay);
  }

  destroy() {
    clearInterval(this.watchInterval);
    delete dirWatchers[this.absolutePath];
  }
}

export default class DirWatcher {
  watch(path, delay = DEFAULT_WATCH_DELAY) {
    if (!dirWatchers[path]) {
      dirWatchers[path] = new Map();
    }

    if (dirWatchers[path].has(this)) {
      return;
    }

    dirWatchers[path].set(this, setInterval(() => {}, delay));
  }

  destroy() {}
}
