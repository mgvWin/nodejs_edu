import fs from 'fs';
import path from 'path';

import * as mainConfig from './config/main.json';
import { Logger } from './utils';
import { User, Product } from './models';
import { EventEmitter } from 'events';
import { promisify } from 'util';

Logger.console(mainConfig.appName);

/* eslint-disable-next-line no-unused-vars */
const user = new User();

/* eslint-disable-next-line no-unused-vars */
const product = new Product();


const watchers = new Map();
const pathExixts = promisify(fs.exists);
const fsStat = promisify(fs.fstat);
const readDir = promisify(fs.readdir);

class DirWatcher extends EventEmitter {
  constructor() {
    super();

    this.absolutePath = null;
    this.watcher = null;
  }

  watch(absolutePath, delay) {
    if(this.absolutePath) {
      return;
    }

    this.absolutePath = absolutePath;

    if (watchers.has(absolutePath)) {
      watchers
        .get(absolutePath)
        .on('dirWatcher:change', this.emit.bind(null, 'dirWatcher:change'));
      
      return;
    }

    this.addDirWatcher();
  }

  addDirWatcher(absolutePath, delay) {
    watchers.set(absolutePath, this);

    this.getDirFiles()
      .then(files => {
        
        const files = files
          .map(file => (() => {
            let mtimeMs = null;

            return () => {
              pathExixts(this.absolutePath)
                .then(isExist => isExist ? fsStat(absolutePath) : null)
                .then(fileStat => {
                  if (!fileStat || fileStat.mtimeMs === mtimeMs) {
                    return;
                  }

                  mtimeMs = fileStat.mtimeMs;
                  this.emit('dirWatcher:change', absolutePath)
                });
            }
          })());
      })
      .then(fileChangeCheckers => {
        setInterval(() => {
          if (!this.listenerCount) {
            return;
          }

          fileChangeCheckers.forEach(changeChecker => changeChecker());
        }, delay);
      })
  }

  getDirFiles() {
    return pathExixts(this.absolutePath)
      .then(isExist => isExist ? readDir(this.absolutePath, { withFileTypes: true }) : null)
      .then(dirContent => dirContent || [])
      .then(dirContent => dirContent.filter(content => content.isFile()));
  }
}

new DirWatcher();