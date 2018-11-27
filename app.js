import * as mainConfig from './config/main.json';
import { User, Product } from './models';

/* eslint-disable-next-line */
console.log(mainConfig.appName);
/* eslint-disable-next-line */
const user = new User();
/* eslint-disable-next-line */
const product = new Product();
