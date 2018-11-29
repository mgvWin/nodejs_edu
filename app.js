import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { promisify } from 'util';

import * as mainConfig from './config/main.json';
import { Logger, CSVParser } from './utils';
import { User, Product } from './models';

Logger.console(mainConfig.appName);

/* eslint-disable-next-line no-unused-vars */
const user = new User();

/* eslint-disable-next-line no-unused-vars */
const product = new Product();

const watchers = new Map();
const pathExixts = promisify(fs.exists);
const fsStat = promisify(fs.stat);
const readDir = promisify(fs.readdir);
const fsReadFile = promisify(fs.readFile);

const DIR_WATCHER_EVENTS = {
  CHANGED: 'dirwatcher:changed',
}

const IMPORTER_EVENTS = {
  CHANGED: 'file:changed',
}

class DirFile {
  constructor(filePath) {
    this.mtimeMs = null;

    this.filePath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
  }

  async isChanged() {
    const fileStat = await fsStat(this.filePath);

    if (!fileStat || fileStat.mtimeMs === this.mtimeMs) {
      return false;
    }

    this.mtimeMs = fileStat.mtimeMs;
    return true;
  }
}

class DirWatcher extends EventEmitter {
  constructor() {
    super();

    this.dirPath = null;
    this.dirFiles = [];
  }

  listenerCount(eventType) {
    const watcher = watchers.get(this.dirPath);
    return watcher && watcher === this ? super.listenerCount(eventType) : watcher.listenerCount(eventType);
  }

  watch(dirPath, delay = 500) {

    if(this.absolutePath) {
      return;
    }

    this.dirPath = path.isAbsolute(dirPath) ? dirPath : path.resolve(dirPath);

    if (watchers.has(this.dirPath)) {

      watchers
        .get(this.dirPath)
        .on(DIR_WATCHER_EVENTS.CHANGED, data => {
            this.emit(DIR_WATCHER_EVENTS.CHANGED, data)
        });
      
      return;
    }

    watchers.set(this.dirPath, this);

    this.getDirFilePaths()
      .then(files => {
        this.dirFiles = files.map(filePath => new DirFile(filePath));
        this.setWatcher(delay);
      })
  }

  async getDirFilePaths() {
    const isDirExists = await pathExixts(this.dirPath);

    if(!isDirExists) {
      return [];
    }

    const resolvedPaths = [];

    for await (const fileName of await readDir(this.dirPath)) {
      const filePath = path.join(this.dirPath, fileName);
      const isFile = await this.isFile(filePath);

      if (isFile) {
        resolvedPaths.push(filePath);
      }
    }

    return resolvedPaths;
  }

  async isFile(filePath) {
    const fileStat = await fsStat(filePath);
    return fileStat.isFile();
  }

  setWatcher(delay) {
    setInterval(() => {
        if (!this.listenerCount(DIR_WATCHER_EVENTS.CHANGED)) {
          return;
        }

        this.dirFiles.forEach(file => (async () => {
            const isFileChanged = await file.isChanged();

            if (isFileChanged) {
                this.emit(DIR_WATCHER_EVENTS.CHANGED, file.filePath)
            }
        })())
    }, delay);
  }
}

class Importer extends EventEmitter {
  constructor () {
    super();

    this.path = null;
    this.dirWatcher = null;
  }

  watch(filePath, delay) {
    if(this.path && (this.path === path)) {
      throw new Error(`Can't watch new path!`);
    }

    this.path = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
    const dirPath = path.dirname(this.path);

    this.dirWatcher = new DirWatcher();
    this.dirWatcher.watch(dirPath, delay);

    this.dirWatcher.on(DIR_WATCHER_EVENTS.CHANGED, (filePathThatChanged) => {
      if ((filePathThatChanged !== this.path) || !this.listenerCount(IMPORTER_EVENTS.CHANGED)) {
        return;
      }

      Importer.import(filePathThatChanged).then(data => {
        this.emit(IMPORTER_EVENTS.CHANGED, data);
      })
    })
  }

  static import(absolutePath) {
    return fsReadFile(absolutePath, 'utf8');
  }

  static importSync(absolutePath) {
    return fs.readFileSync(absolutePath, 'utf8');
  }
}

const dirWatcher = new DirWatcher();
dirWatcher.watch('./data');
dirWatcher.on(DIR_WATCHER_EVENTS.CHANGED, (data) => {

})

const importer = new Importer();
importer.watch('./data/products.csv');
importer.on(IMPORTER_EVENTS.CHANGED, (data) => {
  CSVParser
    .parse(data)
    .then(data => Logger.console(data))
})
/*
Importer.import('./data/products.csv')
  .then(data => CSVParser.parse(data))
  .then(data => Logger.console(data))

const fileData = Importer.importSync('./data/products.csv');
const csv = CSVParser.parseSync(fileData);
Logger.console(csv);
*/