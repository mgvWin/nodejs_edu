import { promisify } from 'util';
import _ from 'lodash';

import { parse as parseSync } from 'csv-parse/lib/sync';
import parse from 'csv-parse';

const parsePromise = promisify(parse);

const PARSER_CONFIG = {
  trim: true,
  skip_empty_lines: true
};

function prepareOutputData(output) {
  const headers = output[0];

  return output
    .slice(1)
    .map(props => _.zipObject(headers, props));
}

export default class CSVParser {
  static parseSync(data) {
    const output = parseSync(data, PARSER_CONFIG);
    return prepareOutputData(output);
  }

  static async parse(input) {
    const output = await parsePromise(input, PARSER_CONFIG);
    return prepareOutputData(output);
  }
}
