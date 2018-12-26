class Option {
  constructor(key, description, type = 'string') {
    this.key = key;
    this.description = description;
    this.type = type;

    this.shortCut = key.substr(0, 1).toLowerCase();
  }

  toString() {
    return this.key;
  }
}

export default {
  HELP: new Option('help', 'Display this usage guide', 'boolean'),
  FILE: new Option('file', 'The input file path to process'),
  ACTION: new Option('action', 'Action name'),
  PATH: new Option('path', 'Get file by path')
};
