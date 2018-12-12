import * as mainConfig from './config/main.json';
import { Logger, CSVParser } from './utils';
import { User, Product } from './models';
import {
  DirWatcher,
  DIR_WATCHER_EVENTS,
  Importer,
  IMPORTER_EVENTS
} from './modules';

Logger.console(mainConfig.appName);

/* eslint-disable-next-line no-unused-vars */
const user = new User();

/* eslint-disable-next-line no-unused-vars */
const product = new Product();

const dirWatcher = new DirWatcher();
dirWatcher.watch('./data');
dirWatcher.on(DIR_WATCHER_EVENTS.CHANGED, () => {});

const importer = new Importer();
importer.watch('./data/products.csv');
importer.on(IMPORTER_EVENTS.CHANGED, data => {
  CSVParser.parse(data).then(obj => {
    Logger.console('Import file by watch');
    Logger.table(obj);
  });
});

Logger.console('Import file without watch');
Importer.import('./data/products.csv')
  .then(data => CSVParser.parse(data))
  .then(data => Logger.table(data));

Logger.console('Import file without sync');
const fileData = Importer.importSync('./data/products.csv');
const csv = CSVParser.parseSync(fileData);
Logger.table(csv);
